"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_number: string;
  service_type: string;
  delivery_type: string;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  status: string;
  payment_status: string;
  amount_charged: number;
  repair_status: string;
  repair_status_updated_at: string;
  created_at: string;
}

const REPAIR_STAGES = [
  "Booking Confirmed",
  "Vehicle Received",
  "Under Inspection",
  "Repair in Progress",
  "Awaiting Parts",
  "Ready for Delivery",
  "Delivered",
];

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [toast, setToast] = useState<{ id: string; message: string } | null>(null);

  // Keep a ref of the latest bookings so the realtime callback always compares
  // against current data, not a stale closure from when the listener was set up.
  const bookingsRef = useRef<Booking[]>([]);
  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);

  useEffect(() => {
    try {
      const user = localStorage.getItem("xpress_user");
      if (user) {
        const u = JSON.parse(user);
        if (u.phone) setPhone(u.phone);
      }
      const prefill = localStorage.getItem("xpress_prefill");
      if (prefill && !phone) {
        const p = JSON.parse(prefill);
        if (p.phone) setPhone(p.phone);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!phone) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("customer_phone", phone)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    // Live updates — no more needing to reload the page to see admin's decision
    // or repair progress. Also pops a toast so the change isn't easy to miss.
    const channel = supabase
      .channel(`my-bookings-${phone}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `customer_phone=eq.${phone}`,
        },
        (payload) => {
          const updated = payload.new as Booking;
          const previous = bookingsRef.current.find((b) => b.id === updated.id);

          setBookings((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
          );

          if (previous && previous.status !== updated.status) {
            const label =
              updated.status === "confirmed"
                ? "Your booking has been confirmed! ✅"
                : updated.status === "cancelled"
                ? "Your booking was declined."
                : updated.status === "completed"
                ? "Your service is complete! 🎉"
                : `Booking status updated to ${updated.status}`;
            setToast({ id: updated.id, message: label });
          } else if (previous && previous.repair_status !== updated.repair_status) {
            setToast({
              id: updated.id,
              message: `Repair update: ${updated.repair_status}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [phone]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="min-h-[80vh] py-12 lg:py-20">
      {/* Toast notification for live status changes */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-white border border-slate-200 shadow-xl rounded-2xl px-6 py-4 max-w-sm animate-in slide-in-from-top-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-bold text-slate-900 text-sm">{toast.message}</p>
              <button
                onClick={() => setToast(null)}
                className="text-xs text-slate-400 hover:text-slate-600 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter mb-2">
            My Bookings
          </h1>
          <p className="text-slate-500 text-lg">
            View and manage all your service appointments.
          </p>
        </div>

        {/* Phone lookup */}
        {!phone && !loading && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 shadow-sm text-center">
            <h2 className="text-2xl font-bold mb-4">Find Your Bookings</h2>
            <p className="text-slate-500 mb-8">
              Enter your phone number to view your booking history.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="tel"
                placeholder="10-digit phone number"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading your bookings...</p>
          </div>
        )}

        {/* No bookings */}
        {!loading && phone && bookings.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="text-6xl mb-6">📋</div>
            <h2 className="text-2xl font-bold mb-4">No Bookings Yet</h2>
            <p className="text-slate-500 mb-8">
              You haven&apos;t booked any services yet. Get started now!
            </p>
            <Link
              href="/book"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition"
            >
              Book Your First Service
            </Link>
          </div>
        )}

        {/* Bookings List */}
        {!loading && bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const showRepairTracker =
                booking.status === "confirmed" || booking.status === "completed";
              const stageIndex = showRepairTracker
                ? Math.max(0, REPAIR_STAGES.indexOf(booking.repair_status || "Booking Confirmed"))
                : 0;
              const percent = ((stageIndex + 1) / REPAIR_STAGES.length) * 100;

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {booking.vehicle_type === "car" ? "🚗" : "🏍️"}
                        </span>
                        <div>
                          <h3 className="text-xl font-bold">
                            {booking.vehicle_model}
                          </h3>
                          <p className="text-slate-500 text-sm font-mono">
                            {booking.vehicle_number}
                          </p>
                        </div>
                      </div>
                      <div className="text-slate-600">
                        <p>
                          <span className="font-semibold">Services:</span>{" "}
                          {booking.service_type}
                        </p>
                        <p>
                          <span className="font-semibold">Date:</span>{" "}
                          {booking.scheduled_date} at {booking.scheduled_time}
                        </p>
                        <p>
                          <span className="font-semibold">Delivery:</span>{" "}
                          {booking.delivery_type === "onsite"
                            ? "At your location"
                            : "Pickup & Drop"}
                        </p>
                        {booking.address && booking.address !== "N/A" && (
                          <p>
                            <span className="font-semibold">Address:</span>{" "}
                            {booking.address}
                          </p>
                        )}
                        {booking.payment_status && (
                          <p>
                            <span className="font-semibold">Payment:</span>{" "}
                            {booking.payment_status}
                            {booking.amount_charged
                              ? ` — ₹${booking.amount_charged.toLocaleString()}`
                              : ""}
                          </p>
                        )}
                      </div>

                      {/* Repair progress — only meaningful once admin has confirmed */}
                      {showRepairTracker && (
                        <div className="pt-2">
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            Repair Progress
                          </span>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-1.5">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-blue-500 to-green-500 transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-medium">
                            {booking.repair_status || "Booking Confirmed"} · Stage{" "}
                            {stageIndex + 1} of {REPAIR_STAGES.length}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status || "pending"}
                      </span>
                      <span className="text-slate-400 text-sm">
                        Booked on{" "}
                        {new Date(booking.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
