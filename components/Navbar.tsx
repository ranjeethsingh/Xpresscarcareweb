"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // The admin dashboard is a separate, staff-only area — the
  // customer-facing navbar (Login, My Account, Book Now, etc.)
  // doesn't apply there and would just be confusing to show.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isLoggedIn = Boolean(user && user.phone);
  const userName = user?.first_name || user?.name || "User";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        {/* Brand Logo with Image & Route to Home */}
{/* USE THIS EMBEDDED SVG LOGO INSTEAD */}
<Link href="/" className="flex items-center gap-3">
  <div className="w-11 h-11 bg-slate-950 rounded-xl flex items-center justify-center p-2 shadow-md shadow-blue-500/10 border border-slate-800">
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full text-blue-600 fill-current"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15 20 L35 20 L85 80 L65 80 Z" />
      <path d="M85 20 L65 20 L15 80 L35 80 Z" opacity="0.6" />
      <circle cx="50" cy="50" r="12" className="text-blue-400" />
    </svg>
  </div>
  <span className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900">
    Xpress<span className="text-blue-600">Care</span>
  </span>
</Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-slate-700 text-sm md:text-base">
          <Link href="/#services" className="hover:text-blue-600 transition">
            Services
          </Link>
          <Link href="/#how-it-works" className="hover:text-blue-600 transition">
            How It Works
          </Link>

          {mounted && isLoggedIn ? (
            <Link href="/my-account" className="hover:text-blue-600 transition">
              My Account
            </Link>
          ) : (
            <Link href="/admin" className="hover:text-blue-600 transition">
              Admin
            </Link>
          )}
        </div>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-4">
          {!mounted ? (
            <>
              <Link href="/login" className="text-slate-700 hover:text-blue-600 font-semibold px-4 py-2 transition">
                Login
              </Link>
              <Link href="/book" className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition shadow-md shadow-blue-500/20">
                Book as a guest
              </Link>
            </>
          ) : isLoggedIn ? (
            <>
              <span className="text-sm font-semibold text-slate-700">
                Hi, {userName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-100 transition border border-red-200"
              >
                Logout
              </button>
              <Link href="/book" className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition shadow-md shadow-blue-500/20">
                Book Now
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-700 hover:text-blue-600 font-semibold px-4 py-2 transition">
                Login
              </Link>
              <Link href="/book" className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition shadow-md shadow-blue-500/20">
                Book as a guest
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 hover:text-blue-600 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-6 py-6 flex flex-col gap-4 font-semibold text-slate-800">
          <Link href="/#services" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
            Services
          </Link>
          <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
            How It Works
          </Link>

          {mounted && isLoggedIn ? (
            <>
              <Link href="/my-account" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                My Account
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-left text-red-600 py-1"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                Admin
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                Login
              </Link>
            </>
          )}

          <Link
            href="/book"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-2 bg-blue-600 text-white text-center py-3 rounded-full font-bold shadow-md shadow-blue-500/20"
          >
            {mounted && isLoggedIn ? "Book Now" : "Book as a guest"}
          </Link>
        </div>
      )}
    </header>
  );
}
