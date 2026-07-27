import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSessionToken,
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const token = createAdminSessionToken();

    const res = NextResponse.json({ success: true });

    res.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, {
      httpOnly: true, // JavaScript in the browser cannot read or forge this
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });

    return res;
  } catch (err) {
    console.error("Admin login failed:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
