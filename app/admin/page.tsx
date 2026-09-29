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

    // Live updates instead of 30s polling
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

  useInactivityLogout(handleLogout, INACTIVITY_TIMEOUT_MS, authenticated);

  const updateStatus = async (id: string, status: string) => {
    try {
      const updates: { status: string; repair_status?: string; repair_status_updated_at?: string } = { status };

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
        return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
      case "completed":
        return "bg-sky-100 text-sky-800 border-sky-300 font-bold";
      default:
        return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "border-l-emerald-500 shadow-emerald-500/5";
      case "cancelled":
        return "border-l-rose-500 shadow-rose-500/5";
      case "completed":
        return "border-l-sky-500 shadow-sky-500/5";
      default:
        return "border-l-amber-400 shadow-amber-500/5";
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
            <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-3xl">
              🔧
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">
              Admin Dashboard
            </h1>
            <p className="text-slate-400">Staff access only — enter your password to continue</p>
          </div>
          <form
            onSubmit={handleLogin}
            className="bg-white rounded-3xl p-8 shadow-2xl space-y-4"
          >
            <div>
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/20 active:scale-[0.99]"
            >
              Login
            </button>

            {/* Vibrant, Colorful Back to Home CTA */}
            <Link
              href="/"
              className="group relative flex items-center justify-center w-full py-3 px-4 rounded-xl font-extrabold text-white bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:via-rose-600 hover:to-purple-700 shadow-md shadow-rose-500/20 transition-all duration-200 active:scale-[0.99] overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="transition-transform group-hover:-translate-x-1">←</span>
                Back to Home
              </span>
            </Link>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="relative min-h-[80vh] py-12 lg:py-16 overflow-hidden">
      {/* Living background */}
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
          <div className="bg-emerald-50 border-t-4 border-emerald-500 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-3xl font-black text-emerald-700">
              {stats.confirmed}
            </div>
            <div className="text-emerald-600 text-sm font-medium mt-1">
              Confirmed
            </div>
          </div>
          <div className="bg-sky-50 border-t-4 border-sky-500 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="text-2xl mb-1">🏁</div>
            <div className="text-3xl font-black text-sky-700">
              {stats.completed}
            </div>
            <div className="text-sky-600 text-sm font-medium mt-1">
              Completed
            </div>
          </div>
          <div className="bg-rose-50 border-t-4 border-rose-500 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="text-2xl mb-1">✕</div>
            <div className="text-3xl font-black text-rose-700">
              {stats.cancelled}
            </div>
            <div className="text-rose-600 text-sm font-medium mt-1">
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
                    ? "bg-slate-950 text-white shadow-md"
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

        {/* Enhanced Responsive Grid & Colored Tiles */}
        {!loading && filteredBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className={`bg-white/95 backdrop-blur-sm border border-slate-200/80 border-l-[6px] ${getStatusBorderColor(
                  booking.status
                )} rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  {/* Card Top Banner */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl p-2 bg-slate-100 rounded-xl">
                        {booking.vehicle_type === "car" ? "🚗" : "🏍️"}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-base font-extrabold text-slate-900 truncate">
                          {booking.customer_name}
                        </h3>
                        <a
                          href={`tel:${booking.customer_phone}`}
                          className="text-blue-600 text-xs font-bold hover:underline block"
                        >
                          +91 {booking.customer_phone}
                        </a>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs capitalize border ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status || "pending"}
                    </span>
                  </div>

                  {/* Vehicle & Services Details */}
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                        Vehicle Info
                      </span>
                      <p className="font-bold text-slate-800 text-sm mt-0.5 flex items-center justify-between">
                        <span>{booking.vehicle_model}</span>
                        <span className="font-mono bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-xs font-bold">
                          {booking.vehicle_number}
                        </span>
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        Requested Services
                      </span>
                      <p className="font-semibold text-slate-700 text-xs mt-0.5">
                        {booking.service_type}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          Date & Time
                        </span>
                        <p className="font-bold text-slate-700 text-xs mt-0.5">
                          {booking.scheduled_date} <br />
                          <span className="text-slate-500 font-normal">at {booking.scheduled_time}</span>
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          Delivery Method
                        </span>
                        <p className="font-bold text-slate-700 text-xs mt-0.5 capitalize">
                          {booking.delivery_type === "onsite"
                            ? "📍 Doorstep Service"
                            : "🚚 Pickup & Drop"}
                        </p>
                      </div>
                    </div>

                    {booking.address && booking.address !== "N/A" && (
                      <div className="pt-1">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          Service Address
                        </span>
                        <p className="font-semibold text-slate-700 text-xs mt-0.5 line-clamp-2">
                          {booking.address}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Notes Section */}
                  {editingNotes === booking.id ? (
                    <div className="pt-2">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add admin notes..."
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs outline-none resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => saveNotes(booking.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNotes(null)}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    booking.admin_notes && (
                      <div className="bg-amber-50/60 rounded-xl p-2.5 border border-amber-200/60">
                        <span className="text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                          Admin Notes
                        </span>
                        <p className="text-xs mt-0.5 text-amber-900 font-medium">
                          {booking.admin_notes}
                        </p>
                      </div>
                    )
                  )}
                </div>

                {/* Actions & Status Dropdown */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  {booking.status === "pending" && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateStatus(booking.id, "confirmed")}
                        className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                      >
                        ✓ Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(booking.id, "cancelled")}
                        className="px-3 py-2 bg-rose-100 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-200 transition"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${booking.customer_phone}`}
                      className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition text-center"
                    >
                      📞 Call
                    </a>
                    <button
                      onClick={() => {
                        setEditingNotes(booking.id);
                        setNoteText(booking.admin_notes || "");
                      }}
                      className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                    >
                      📝 Notes
                    </button>
                  </div>

                  {(booking.status === "confirmed" || booking.status === "completed") && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Repair Status
                        </span>
                        <span className="text-[10px] font-bold text-blue-600">
                          {booking.repair_status || "Booking Confirmed"}
                        </span>
                      </div>

                      <select
                        value={repairStatusDraft[booking.id] ?? booking.repair_status ?? "Booking Confirmed"}
                        onChange={(e) =>
                          setRepairStatusDraft((prev) => ({ ...prev, [booking.id]: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white"
                      >
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
                            className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition disabled:opacity-60"
                          >
                            {savingRepairStatus === booking.id ? "Saving..." : "Update Stage"}
                          </button>
                        )}
                    </div>
                  )}

                  {/* Card Timestamp */}
                  <div className="text-[10px] text-slate-400 text-center pt-1">
                    📅 {new Date(booking.created_at).toLocaleDateString()} at{" "}
                    {new Date(booking.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}