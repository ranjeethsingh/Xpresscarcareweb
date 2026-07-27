import { NextRequest, NextResponse } from "next/server";
import { isValidAdminSessionToken, ADMIN_SESSION_COOKIE_NAME } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const authenticated = isValidAdminSessionToken(token);
  return NextResponse.json({ authenticated });
}
