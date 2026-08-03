import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { extractPdfText, abstractDocuments } from "@/lib/abstract";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_FILES = 5;
const MAX_BYTES = 15 * 1024 * 1024;
const MIN_TEXT = 60;                 // short instruments (extensions, ratifications) are legitimate
// Cost controls. This endpoint is public and every run costs money.
// ~$0.11 per typical abstract, ~$0.32 worst case at the MAX_CHARS ceiling —
// so the global cap is roughly the daily spend ceiling in dimes. Raise it via
// env once real demand shows up; the default is sized for abuse, not usage.
const PER_IP_PER_DAY = Number(process.env.ABSTRACT_PER_IP_PER_DAY ?? 3);
const GLOBAL_PER_DAY = Number(process.env.ABSTRACT_GLOBAL_PER_DAY ?? 50);

function clientIp(req: Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for") || "";
  return (xff.split(",")[0] || h.get("cf-connecting-ip") || h.get("x-real-ip") || "unknown").trim().slice(0, 64);
}

/** Reject before spending anything. Fails OPEN on DB error — never block a real user over telemetry. */
async function overLimit(ip: string): Promise<string | null> {
  try {
    const r = await query<{ mine: number; total: number }>(
      `SELECT count(*) FILTER (WHERE ip = $1)::int AS mine,
              count(*)::int AS total
         FROM abstract_runs
        WHERE created_at > now() - interval '24 hours' AND ok`,
      [ip]
    );
    const { mine = 0, total = 0 } = r.rows[0] ?? {};
    if (mine >= PER_IP_PER_DAY) {
      return `You've used your ${PER_IP_PER_DAY} free abstracts for today. Get in touch and we'll run the rest for you.`;
    }
    if (total >= GLOBAL_PER_DAY) {
      return "We're at today's capacity for free abstracts. Get in touch and we'll run yours directly.";
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  try {
    const limited = await overLimit(ip);
    if (limited) return NextResponse.json({ error: limited }, { status: 429 });

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: "Upload wasn't readable. Check the file size and try again." }, { status: 400 });
    }

    const email = String(form.get("email") ?? "").trim();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    const pasted = String(form.get("text") ?? "").trim();

    if (!files.length && pasted.length < MIN_TEXT) {
      return NextResponse.json({ error: "Attach a document, or paste the text of one." }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Up to ${MAX_FILES} files at a time.` }, { status: 400 });
    }

    const docs: { name: string; text: string }[] = [];
    for (const f of files) {
      if (f.size > MAX_BYTES) {
        return NextResponse.json({ error: `${f.name} is over 15 MB.` }, { status: 400 });
      }
      const buf = await f.arrayBuffer();
      let text = "";
      if (f.name.toLowerCase().endsWith(".pdf") || f.type === "application/pdf") {
        try {
          text = await extractPdfText(buf);
        } catch {
          // Malformed/encrypted PDF is a user-input problem, not a server fault.
          return NextResponse.json({
            error: `We couldn't open ${f.name}. If it's password-protected or damaged, re-save it and try again.`,
          }, { status: 400 });
        }
      } else {
        text = new TextDecoder().decode(buf);
      }
      text = text.replace(/[ \t ]+/g, " ").trim();
      if (text.length < MIN_TEXT) {
        return NextResponse.json({
          error: `We couldn't read text from ${f.name} — it's likely a scanned image, which needs OCR first. Paste the text instead, or send it over and we'll handle it.`,
        }, { status: 400 });
      }
      docs.push({ name: f.name, text });
    }
    if (pasted.length >= MIN_TEXT) docs.push({ name: "Pasted text", text: pasted });

    const result = await abstractDocuments(docs);

    try {
      await query(
        `INSERT INTO abstract_runs (email, doc_names, doc_chars, title, result, ip, ok) VALUES ($1,$2,$3,$4,$5,$6,true)`,
        [
          email ? email.slice(0, 320) : null,
          docs.map((d) => d.name).join(" | ").slice(0, 500),
          docs.reduce((n, d) => n + d.text.length, 0),
          (result.title || "").slice(0, 300),
          JSON.stringify(result),
          ip,
        ]
      );
    } catch { /* logging must never fail the user's run */ }

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    // Never surface internal config or stack detail to the caller.
    const raw = e instanceof Error ? e.message : String(e);
    const configProblem = /ANTHROPIC_API_KEY|api[_-]?key/i.test(raw);
    if (configProblem) console.error("[abstract] configuration error:", raw);
    else console.error("[abstract] failure:", raw);
    return NextResponse.json({
      error: configProblem
        ? "This tool isn't finished being set up yet. Please try again shortly."
        : "We couldn't complete that abstract. Try again, or send the document over and we'll run it.",
    }, { status: 500 });
  }
}
