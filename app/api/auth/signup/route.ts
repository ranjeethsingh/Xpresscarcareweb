import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { profileData, password, phone, email } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }

    // Build the row to save. Hash the password here, server-side, if one was provided.
    const dataToSave: any = { ...profileData };

    if (password) {
      dataToSave.password = await bcrypt.hash(password, 10);
    }

    // Check for an existing profile by phone or email (same logic as before, just server-side now)
    const { data: existingByPhone } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    let existingByEmail = null;

    if (email) {
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      existingByEmail = data;
    }

    const existing = existingByPhone || existingByEmail;
    let profileId: string;

    if (existing) {
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update(dataToSave)
        .eq("id", existing.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        return NextResponse.json({ error: "Could not save profile" }, { status: 500 });
      }

      profileId = existing.id;
    } else {
      const { data, error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert(dataToSave)
        .select("id")
        .single();

      if (insertError) {
        console.error("Profile insert error:", insertError);
        return NextResponse.json({ error: "Could not create profile" }, { status: 500 });
      }

      profileId = data.id;
    }

    return NextResponse.json({ id: profileId });
  } catch (err) {
    console.error("Signup route failed:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
