import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { method, phone, email } = await req.json();

    const query = supabaseAdmin.from("profiles").select("*");
    const { data: profile, error } =
      method === "phone"
        ? await query.eq("phone", phone).maybeSingle()
        : await query.eq("email", email).maybeSingle();

    if (error) {
      console.error("Lookup error:", error);
      return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    // Strip password before sending profile to the browser
    const { password: _pw, ...safeProfile } = profile;

    return NextResponse.json({ profile: safeProfile });
  } catch (err) {
    console.error("Lookup route failed:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
