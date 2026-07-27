"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// Background carousel photos. Add "nature-1.jpg", "animal-1.jpg", etc. here
// once those categories are added to public/backgrounds — no other code
// needs to change.
const BACKGROUND_IMAGES = [
  "/backgrounds/car-1.jpg",
  "/backgrounds/bike-1.jpg",
  "/backgrounds/car-2.jpg",
  "/backgrounds/bike-2.png",
  "/backgrounds/car-3.jpg",
  "/backgrounds/bike-3.jpg",
  "/backgrounds/car-4.jpg",
  "/backgrounds/bike-4.jpg",
  "/backgrounds/bike-5.jpg",
  "/backgrounds/bike-6.jpg",
];

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
  admin_notes: string;
  created_at: string;
  repair_status: string;
  repair_status_updated_at: string;
}


export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [repairStatusDraft, setRepairStatusDraft] = useState<Record<string, string>>({});
  const [savingRepairStatus, setSavingRepairStatus] = useState<string | null>(null);
  const [justSavedRepairStatus, setJustSavedRepairStatus] = useState<string | null>(null);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin/session");
        const result = await res.json();
        setAuthenticated(Boolean(result.authenticated));
      } catch (err) {
        console.error("Session check failed:", err);
        setAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .order("scheduled_date", { ascending: false })
          .order("scheduled_time", { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    const sortByScheduled = (list: Booking[]) =>
      [...list].sort((a, b) => {
        const dateCompare = (b.scheduled_date || "").localeCompare(a.scheduled_date || "");
        if (dateCompare !== 0) return dateCompare;
        return (b.scheduled_time || "").localeCompare(a.scheduled_time || "");
      });

    // Live updates instead of 30s polling — no more full-grid reload/flicker,
    // new bookings and status changes just patch into the existing list.
    const channel = supabase
      .channel("admin-bookings-list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
          setBookings((prev) => sortByScheduled([payload.new as Booking, ...prev]));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings" },
        (payload) => {
          setBookings((prev) =>
            sortByScheduled(
              prev.map((b) => (b.id === (payload.new as Booking).id ? (payload.new as Booking) : b))
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "bookings" },
        (payload) => {
          setBookings((prev) => prev.filter((b) => b.id !== (payload.old as Booking).id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const result = await res.json();

      if (!res.ok) {
        setPasswordError(result.error || "Incorrect password");
        return;
      }

      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      console.error("Admin login failed:", err);
      setPasswordError("Login failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setAuthenticated(false);
    }
  };

  // Auto-logout staff after 5 minutes of no activity, since this dashboard
  // shows customer contact info and lets someone change repair statuses.
  useInactivityLogout(handleLogout, INACTIVITY_TIMEOUT_MS, authenticated);

  const updateStatus = async (id: string, status: string) => {
    try {
      const updates: { status: string; repair_status?: string; repair_status_updated_at?: string } = { status };

      // Confirming a booking also starts the repair timeline — no separate manual step needed
      if (status === "confirmed") {
        updates.repair_status = "Booking Confirmed";
        updates.repair_status_updated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
      );
    } catch (err) {
      alert("Failed to update status");
      console.error(err);
    }
  };

  const updateRepairStatus = async (id: string) => {
    const repairStatus = repairStatusDraft[id];
    if (!repairStatus) return;

    // Reaching the final repair stage means the job is done — no separate "Mark Complete" click needed
    const isFinalStage = repairStatus === "Delivered";

    setSavingRepairStatus(id);
    try {
      const res = await fetch("/api/admin/update-repair-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: id,
          repairStatus,
          markCompleted: isFinalStage,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Update failed");
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                repair_status: repairStatus,
                repair_status_updated_at: new Date().toISOString(),
                ...(isFinalStage ? { status: "completed" } : {}),
              }
            : b
        )
      );

      setRepairStatusDraft((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      setJustSavedRepairStatus(id);
      setTimeout(() => setJustSavedRepairStatus((current) => (current === id ? null : current)), 2500);
    } catch (err) {
      alert("Failed to update repair status");
      console.error(err);
    } finally {
      setSavingRepairStatus(null);
    }
  };

  const saveNotes = async (id: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ admin_notes: noteText })
        .eq("id", id);

      if (error) throw error;
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, admin_notes: noteText } : b))
      );
      setEditingNotes(null);
    } catch (err) {
      alert("Failed to save notes");
      console.error(err);
    }
  };

  // Filter Bookings based on Status and Search Query (Name, Phone, Vehicle Number/Model)
  const filteredBookings = bookings.filter((b) => {
    const matchesFilter =
      filter === "all" || b.status?.toLowerCase() === filter.toLowerCase();

    const q = searchQuery.toLowerCase().trim().replace(/\s/g, "");
    if (!q) return matchesFilter;

    const nameMatch = b.customer_name?.toLowerCase().includes(q);
    const phoneMatch = b.customer_phone?.toLowerCase().includes(q);
    const numberMatch = b.vehicle_number?.toLowerCase().replace(/\s/g, "").includes(q);
    const modelMatch = b.vehicle_model?.toLowerCase().includes(q);

    return matchesFilter && (nameMatch || phoneMatch || numberMatch || modelMatch);
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "border-l-green-500";
      case "cancelled":
        return "border-l-red-500";
      case "completed":
        return "border-l-blue-500";
      default:
        return "border-l-yellow-400";
    }
  };

  const REPAIR_STAGES = [
    "Booking Confirmed",
    "Vehicle Received",
    "Under Inspection",
    "Repair in Progress",
    "Awaiting Parts",
    "Ready for Delivery",
    "Delivered",
  ];

  // Login Screen
  if (!authenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-6 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-3xl">
              🔧
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">
              Admin Dashboard
            </h1>
            <p className="text-slate-400">Staff access only — enter your password to continue</p>
          </div>
          <form
            onSubmit={handleLogin}
            className="bg-white rounded-3xl p-8 shadow-2xl"
          >
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-2">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-500/20"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="relative min-h-[80vh] py-12 lg:py-16 overflow-hidden">
      {/* Living background — real shop photos slowly cross-fading */}
      <div className="fixed inset-0 -z-10 bg-slate-950">
        {BACKGROUND_IMAGES.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${
              i === bgIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
        {/* Dark overlay so cards and text stay fully readable over any photo */}
        <div className="absolute inset-0 bg-slate-950/75" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-8 lg:p-10 mb-8 shadow-xl">
          <div className="absolute -right-10 -top-10 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -right-6 bottom-0 text-[120px] opacity-[0.07] leading-none select-none">🔧</div>
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
                XpressCare Staff
              </span>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter mb-2 text-white">
                Admin Dashboard
              </h1>
              <p className="text-slate-400 text-lg">
                Manage all bookings and customer requests.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/"
                className="px-6 py-3 rounded-full font-semibold text-white border border-white/20 hover:bg-white/10 transition backdrop-blur-sm"
              >
                ← Back to Site
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-3 rounded-full font-semibold text-white bg-red-500/90 hover:bg-red-600 transition shadow-lg shadow-red-900/30"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white border-t-4 border-slate-900 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="text-2xl mb-1">📋</div>
            <div className="text-3xl font-black">{stats.total}</div>
            <div className="text-slate-500 text-sm font-medium mt-1">Total</div>
          </div>
          <div className="bg-yellow-50 border-t-4 border-yellow-400 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="text-2xl mb-1">⏳</div>
            <div className="text-3xl font-black text-yellow-700">
              {stats.pending}
            </div>
            <div className="text-yellow-600 text-sm font-medium mt-1">
              Pending
            </div>
          </div>
          <div className="bg-green-50 border-t-4 border-green-500 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-3xl font-black text-green-700">
              {stats.confirmed}
            </div>
            <div className="text-green-600 text-sm font-medium mt-1">
              Confirmed
            </div>
          </div>
          <div className="bg-blue-50 border-t-4 border-blue-500 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="text-2xl mb-1">🏁</div>
            <div className="text-3xl font-black text-blue-700">
              {stats.completed}
            </div>
            <div className="text-blue-600 text-sm font-medium mt-1">
              Completed
            </div>
          </div>
          <div className="bg-red-50 border-t-4 border-red-500 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="text-2xl mb-1">✕</div>
            <div className="text-3xl font-black text-red-700">
              {stats.cancelled}
            </div>
            <div className="text-red-600 text-sm font-medium mt-1">
              Cancelled
            </div>
          </div>
        </div>

        {/* Search Bar & Filters Section */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 mb-8 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              🔎 Search Customer or Vehicle
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Customer Name, Mobile Number, or Registration Number (e.g. TS09AB1234)..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-3.5 text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 font-bold text-xs"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-xs font-bold capitalize transition ${
                  filter === f
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading bookings...</p>
          </div>
        )}

        {/* No Bookings Found State */}
        {!loading && filteredBookings.length === 0 && (
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl p-12 text-center">
            <div className="text-6xl mb-6">📭</div>
            <h2 className="text-2xl font-bold mb-2">No Bookings Found</h2>
            <p className="text-slate-500">
              No bookings match your filter or search query.
            </p>
          </div>
        )}

        {/* Bookings List */}
        {!loading && filteredBookings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className={`bg-white/95 backdrop-blur-sm border border-slate-200/70 border-l-4 ${getStatusBorderColor(
                  booking.status
                )} rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col`}
              >
                <div className="flex flex-col gap-3">
                  {/* Left: Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">
                        {booking.vehicle_type === "car" ? "🚗" : "🏍️"}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold tracking-tight text-slate-900 truncate">
                          {booking.customer_name}
                        </h3>
                        <a
                          href={`tel:${booking.customer_phone}`}
                          className="text-blue-600 text-xs font-semibold hover:underline"
                        >
                          +91 {booking.customer_phone}
                        </a>
                      </div>
                      <span
                        className={`ml-auto shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status || "pending"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Vehicle</span>
                        <p className="font-semibold text-slate-700 text-[13px] mt-0.5">
                          {booking.vehicle_model}{" "}
                          <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs font-bold">
                            {booking.vehicle_number}
                          </span>
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Services</span>
                        <p className="font-semibold text-slate-700 text-[13px] mt-0.5">{booking.service_type}</p>
                      </div>

                      {booking.payment_status && (
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Payment</span>
                          <p className="font-semibold text-slate-700 text-[13px] mt-0.5">
                            {booking.payment_status}
                            {booking.amount_charged ? ` — ₹${booking.amount_charged.toLocaleString()}` : ""}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-6">
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Date & Time</span>
                          <p className="font-semibold text-slate-700 text-[13px] mt-0.5">
                            {booking.scheduled_date} at {booking.scheduled_time}
                          </p>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Delivery</span>
                          <p className="font-semibold capitalize text-slate-700 text-[13px] mt-0.5">
                            {booking.delivery_type === "onsite"
                              ? "At location"
                              : "Pickup & Drop"}
                          </p>
                        </div>
                      </div>

                      {booking.address && booking.address !== "N/A" && (
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Address</span>
                          <p className="font-semibold text-slate-700 text-[13px] mt-0.5">{booking.address}</p>
                        </div>
                      )}
                    </div>

                    {/* Admin Notes Box */}
                    {editingNotes === booking.id ? (
                      <div className="mt-4">
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add admin notes..."
                          rows={3}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none text-sm"
                        />
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => saveNotes(booking.id)}
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                          >
                            Save Notes
                          </button>
                          <button
                            onClick={() => setEditingNotes(null)}
                            className="px-5 py-2 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-100 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      booking.admin_notes && (
                        <div className="mt-2 bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                            Admin Notes
                          </span>
                          <p className="text-sm mt-1 text-slate-800">{booking.admin_notes}</p>
                        </div>
                      )
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2">
                    {booking.status === "pending" && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => updateStatus(booking.id, "confirmed")}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition"
                        >
                          ✓ Confirm
                        </button>
                        <button
                          onClick={() => updateStatus(booking.id, "cancelled")}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${booking.customer_phone}`}
                        className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition text-center"
                      >
                        📞 Call
                      </a>
                      <button
                        onClick={() => {
                          setEditingNotes(booking.id);
                          setNoteText(booking.admin_notes || "");
                        }}
                        className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
                      >
                        📝 Notes
                      </button>
                    </div>

                    {(booking.status === "confirmed" || booking.status === "completed") && (
                      <div className="pt-1.5 border-t border-slate-100">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Repair Status
                        </label>

                        {(() => {
                          const currentStatus = booking.repair_status || "Booking Confirmed";
                          const stageIndex = Math.max(0, REPAIR_STAGES.indexOf(currentStatus));
                          const percent = ((stageIndex + 1) / REPAIR_STAGES.length) * 100;
                          return (
                            <div className="mt-2 mb-3">
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-blue-500 to-green-500 transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <p className="text-xs text-slate-500 mt-1 font-medium">
                                Stage {stageIndex + 1} of {REPAIR_STAGES.length} — {currentStatus}
                              </p>
                            </div>
                          );
                        })()}

                        <select
                          value={repairStatusDraft[booking.id] ?? booking.repair_status ?? "Booking Confirmed"}
                          onChange={(e) =>
                            setRepairStatusDraft((prev) => ({ ...prev, [booking.id]: e.target.value }))
                          }
                          className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 bg-white"
                        >
                          {/* "Booking Confirmed" is set automatically when you click Confirm above — not offered here to avoid re-entering the same fact twice */}
                          <option value="Vehicle Received">Vehicle Received</option>
                          <option value="Under Inspection">Under Inspection</option>
                          <option value="Repair in Progress">Repair in Progress</option>
                          <option value="Awaiting Parts">Awaiting Parts</option>
                          <option value="Ready for Delivery">Ready for Delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>

                        {repairStatusDraft[booking.id] &&
                          repairStatusDraft[booking.id] !== (booking.repair_status || "Booking Confirmed") && (
                            <button
                              onClick={() => updateRepairStatus(booking.id)}
                              disabled={savingRepairStatus === booking.id}
                              className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-60"
                            >
                              {savingRepairStatus === booking.id ? "Saving..." : "Update Status"}
                            </button>
                          )}

                        {justSavedRepairStatus === booking.id && (
                          <p className="mt-2 text-sm font-semibold text-green-600">✓ Status updated</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs font-medium flex flex-wrap gap-x-1.5 gap-y-0.5">
                  <span className="text-slate-500">
                    📅 Booked on {new Date(booking.created_at).toLocaleString()}
                  </span>
                  {booking.repair_status_updated_at && (
                    <span className="text-blue-600">
                      · 🔄 Status updated {new Date(booking.repair_status_updated_at).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}