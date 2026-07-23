"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const user = localStorage.getItem("xpress_user");

        if (user) {
          const u = JSON.parse(user);

          if (u.phone) {
            setIsLoggedIn(true);
            setUserName(u.first_name || u.name || "User");
          } else {
            setIsLoggedIn(false);
            setUserName("");
          }
        } else {
          setIsLoggedIn(false);
          setUserName("");
        }
      } catch {
        setIsLoggedIn(false);
        setUserName("");
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 500);

    return () => clearInterval(interval);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("xpress_user");
    localStorage.removeItem("xpress_prefill");
    localStorage.removeItem("xpress_otp_target");

    setIsLoggedIn(false);
    setUserName("");

    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo with Image & Route to /services */}
        <Link href="/services" className="flex items-center gap-3">
          <Image
            src="/logo.png" 
            alt="Xpress Car Care Logo"
            width={45}
            height={45}
            className="object-contain"
            priority
          />
          <span className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900">
            Xpress<span className="text-blue-600">Care</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
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
              <Link
                href="/login"
                className="text-slate-700 hover:text-blue-600 font-semibold px-4 py-2 transition"
              >
                Login
              </Link>
              <Link
                href="/book"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
              >
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
              <Link
                href="/book"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
              >
                Book Now
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-700 hover:text-blue-600 font-semibold px-4 py-2 transition"
              >
                Login
              </Link>
              <Link
                href="/book"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
              >
                Book as a guest
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-6 py-6 flex flex-col gap-4 font-semibold text-slate-800">
          <Link
            href="/#services"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-blue-600 py-1"
          >
            Services
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-blue-600 py-1"
          >
            How It Works
          </Link>

          {mounted && isLoggedIn ? (
            <>
              <Link
                href="/my-account"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-600 py-1"
              >
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
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-600 py-1"
              >
                Admin
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-600 py-1"
              >
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