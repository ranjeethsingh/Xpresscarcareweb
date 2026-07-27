import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { phone, email, password, method } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Look up the profile server-side, using the admin client
    const query = supabaseAdmin.from("profiles").select("*");
    const { data: profile, error } =
      method === "phone"
        ? await query.eq("phone", phone).maybeSingle()
        : await query.eq("email", email).maybeSingle();

    if (error) {
      console.error("Login lookup error:", error);
      return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    // Handles both hashed passwords (new) and plaintext (old, not yet migrated)
    const passwordMatches = profile.password.startsWith("$2")
      ? await bcrypt.compare(password, profile.password)
      : profile.password === password;

    if (!passwordMatches) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Auto-upgrade plaintext password to hashed, transparently, on successful login
    if (!profile.password.startsWith("$2")) {
      const hashed = await bcrypt.hash(password, 10);
      await supabaseAdmin.from("profiles").update({ password: hashed }).eq("id", profile.id);
    }

    // Strip password before sending profile back to browser
    const { password: _pw, ...safeProfile } = profile;

    return NextResponse.json({ profile: safeProfile });
  } catch (err) {
    console.error("Login route failed:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}