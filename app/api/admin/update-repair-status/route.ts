import { NextRequest, NextResponse } from "next/server";
import { isValidAdminSessionToken, ADMIN_SESSION_COOKIE_NAME } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const VALID_STATUSES = [
  "Booking Confirmed",
  "Vehicle Received",
  "Under Inspection",
  "Repair in Progress",
  "Awaiting Parts",
  "Ready for Delivery",
  "Delivered",
];

export async function POST(req: NextRequest) {
  // Only a genuinely logged-in staff member (valid signed cookie) can update status
  const token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { bookingId, repairStatus, markCompleted } = await req.json();

    if (!bookingId || !repairStatus) {
      return NextResponse.json({ error: "Missing bookingId or repairStatus" }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(repairStatus)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updates: {
      repair_status: string;
      repair_status_updated_at: string;
      status?: string;
    } = {
      repair_status: repairStatus,
      repair_status_updated_at: new Date().toISOString(),
    };

    // Reaching "Delivered" also closes out the booking itself — one action, not two
    if (markCompleted) {
      updates.status = "completed";
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update(updates)
      .eq("id", bookingId);

    if (error) {
      console.error("Repair status update error:", error);
      return NextResponse.json({ error: "Could not update status" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update-repair-status route failed:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}