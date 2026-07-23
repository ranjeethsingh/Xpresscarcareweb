"use client";

import { useState, useEffect } from "react";
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
  admin_notes: string;
  created_at: string;
}

const ADMIN_PASSWORD = "xpress2024";

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

  useEffect(() => {
    const auth = sessionStorage.getItem("xpress_admin_auth");
    if (auth === "true") setAuthenticated(true);
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
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
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem("xpress_admin_auth", "true");
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem("xpress_admin_auth");
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    } catch (err) {
      alert("Failed to update status");
      console.error(err);
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

  // Login Screen
  if (!authenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-500">Enter your password to continue</p>
          </div>
          <form
            onSubmit={handleLogin}
            className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm"
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
              className="w-full bg-slate-950 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition"
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
    <div className="min-h-[80vh] py-12 lg:py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 text-lg">
              Manage all bookings and customer requests.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-6 py-3 rounded-full font-semibold text-slate-600 border border-slate-200 hover:bg-slate-100 transition bg-white"
            >
              ← Back to Site
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-full font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition bg-white"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
            <div className="text-3xl font-black">{stats.total}</div>
            <div className="text-slate-500 text-sm font-medium mt-1">Total</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
            <div className="text-3xl font-black text-yellow-700">
              {stats.pending}
            </div>
            <div className="text-yellow-600 text-sm font-medium mt-1">
              Pending
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-3xl font-black text-green-700">
              {stats.confirmed}
            </div>
            <div className="text-green-600 text-sm font-medium mt-1">
              Confirmed
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
            <div className="text-3xl font-black text-blue-700">
              {stats.completed}
            </div>
            <div className="text-blue-600 text-sm font-medium mt-1">
              Completed
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="text-3xl font-black text-red-700">
              {stats.cancelled}
            </div>
            <div className="text-red-600 text-sm font-medium mt-1">
              Cancelled
            </div>
          </div>
        </div>

        {/* Search Bar & Filters Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 shadow-sm space-y-4">
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
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
            <div className="text-6xl mb-6">📭</div>
            <h2 className="text-2xl font-bold mb-2">No Bookings Found</h2>
            <p className="text-slate-500">
              No bookings match your filter or search query.
            </p>
          </div>
        )}

        {/* Bookings List */}
        {!loading && filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 hover:shadow-md transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Left: Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {booking.vehicle_type === "car" ? "🚗" : "🏍️"}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {booking.customer_name}
                        </h3>
                        <a
                          href={`tel:${booking.customer_phone}`}
                          className="text-blue-600 text-sm font-semibold hover:underline"
                        >
                          +91 {booking.customer_phone}
                        </a>
                      </div>
                      <span
                        className={`ml-auto px-4 py-1.5 rounded-full text-xs font-bold capitalize border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status || "pending"}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 text-xs font-semibold uppercase">Vehicle Details</span>
                        <p className="font-semibold text-slate-900">
                          {booking.vehicle_model}{" "}
                          <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs font-bold">
                            {booking.vehicle_number}
                          </span>
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-500 text-xs font-semibold uppercase">Services</span>
                        <p className="font-semibold text-slate-900">{booking.service_type}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 text-xs font-semibold uppercase">Date & Time</span>
                        <p className="font-semibold text-slate-900">
                          {booking.scheduled_date} at {booking.scheduled_time}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-500 text-xs font-semibold uppercase">Delivery</span>
                        <p className="font-semibold capitalize text-slate-900">
                          {booking.delivery_type === "onsite"
                            ? "At location"
                            : "Pickup & Drop"}
                        </p>
                      </div>

                      {booking.address && booking.address !== "N/A" && (
                        <div className="md:col-span-2">
                          <span className="text-slate-500 text-xs font-semibold uppercase">Address</span>
                          <p className="font-semibold text-slate-900">{booking.address}</p>
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
                        <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                            Admin Notes
                          </span>
                          <p className="text-sm mt-1 text-slate-800">{booking.admin_notes}</p>
                        </div>
                      )
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-3 lg:min-w-[180px]">
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(booking.id, "confirmed")}
                          className="w-full px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition"
                        >
                          ✓ Confirm
                        </button>
                        <button
                          onClick={() => updateStatus(booking.id, "cancelled")}
                          className="w-full px-5 py-2.5 bg-red-100 text-red-700 rounded-xl text-sm font-bold hover:bg-red-200 transition"
                        >
                          ✕ Cancel
                        </button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => updateStatus(booking.id, "completed")}
                        className="w-full px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition"
                      >
                        ✓ Mark Complete
                      </button>
                    )}
                    <a
                      href={`tel:${booking.customer_phone}`}
                      className="w-full px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition text-center"
                    >
                      📞 Call Customer
                    </a>
                    <button
                      onClick={() => {
                        setEditingNotes(booking.id);
                        setNoteText(booking.admin_notes || "");
                      }}
                      className="w-full px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition"
                    >
                      📝 Notes
                    </button>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                  Booked on {new Date(booking.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}