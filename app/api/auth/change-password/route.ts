import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { profileId, currentPassword, newPassword, passwordMode } = await req.json();

    if (!profileId || !newPassword) {
      return NextResponse.json({ error: "Missing profileId or newPassword" }, { status: 400 });
    }

    // If the user is changing password via their current password (not OTP),
    // verify it server-side. The stored/actual password never reaches the browser.
    if (passwordMode === "current") {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("password")
        .eq("id", profileId)
        .maybeSingle();

      if (error) {
        console.error("Change-password lookup error:", error);
        return NextResponse.json({ error: "Could not verify current password" }, { status: 500 });
      }

      if (data?.password) {
        const matches = data.password.startsWith("$2")
          ? await bcrypt.compare(currentPassword || "", data.password)
          : data.password === currentPassword;

        if (!matches) {
          return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
        }
      }
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ password: hashed, updated_at: new Date().toISOString() })
      .eq("id", profileId);

    if (updateError) {
      console.error("Change-password update error:", updateError);
      return NextResponse.json({ error: "Could not update password" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Change-password route failed:", err);
    return NextResponse.json({ error: "Password change failed" }, { status: 500 });
  }
}
