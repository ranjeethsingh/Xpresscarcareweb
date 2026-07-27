import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { profileId, newPassword } = await req.json();

    if (!profileId || !newPassword) {
      return NextResponse.json({ error: "Missing profileId or newPassword" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ password: hashed, updated_at: new Date().toISOString() })
      .eq("id", profileId);

    if (updateError) {
      console.error("Password reset error:", updateError);
      return NextResponse.json({ error: "Could not reset password" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset-password route failed:", err);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
