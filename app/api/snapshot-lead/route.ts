import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    const str = (v: unknown) => {
      const s = String(v ?? "").trim();
      return s ? s.slice(0, 500) : null;
    };
    const source = str(body.source) || "snapshot";
    await query(
      `INSERT INTO leads (email, target_area, name, company, source) VALUES ($1,$2,$3,$4,$5)`,
      [email.slice(0, 320), str(body.area), str(body.name), str(body.company), source]
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong — please try again." }, { status: 500 });
  }
}
