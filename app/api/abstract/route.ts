import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { extractPdfText, abstractDocuments } from "@/lib/abstract";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // extraction on a large package can run a few minutes

const MAX_FILES = 5;
const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const email = String(form.get("email") ?? "").trim();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    const pasted = String(form.get("text") ?? "").trim();

    if (!files.length && pasted.length < 200) {
      return NextResponse.json({ error: "Attach a document, or paste at least a page of text." }, { status: 400 });
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
        text = await extractPdfText(buf);
      } else {
        text = new TextDecoder().decode(buf);
      }
      text = text.replace(/[ \t ]+/g, " ").trim();
      if (text.length < 200) {
        return NextResponse.json({
          error: `We couldn't read text from ${f.name}. If it's a scanned image, it needs OCR first — paste the text instead, or send it over and we'll handle it.`,
        }, { status: 400 });
      }
      docs.push({ name: f.name, text });
    }
    if (pasted.length >= 200) docs.push({ name: "Pasted text", text: pasted });

    const result = await abstractDocuments(docs);

    // Record the run (and the lead, if they gave one). Never store document contents.
    try {
      await query(
        `INSERT INTO abstract_runs (email, doc_names, doc_chars, title, result) VALUES ($1,$2,$3,$4,$5)`,
        [
          email ? email.slice(0, 320) : null,
          docs.map((d) => d.name).join(" | ").slice(0, 500),
          docs.reduce((n, d) => n + d.text.length, 0),
          (result.title || "").slice(0, 300),
          JSON.stringify(result),
        ]
      );
    } catch { /* logging must never fail the user's run */ }

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg.slice(0, 400) }, { status: 500 });
  }
}
