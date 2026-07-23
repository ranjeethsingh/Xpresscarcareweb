"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type HomeCTAProps = {
  variant?: "hero" | "final";
};

export default function HomeCTA({ variant = "hero" }: HomeCTAProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkLogin = () => {
      try {
        const user = localStorage.getItem("xpress_user");
        if (!user) {
          setIsLoggedIn(false);
          return;
        }

        const parsed = JSON.parse(user);
        setIsLoggedIn(Boolean(parsed?.phone));
      } catch {
        setIsLoggedIn(false);
      }
    };

    checkLogin();
    const interval = setInterval(checkLogin, 500);

    return () => clearInterval(interval);
  }, []);

  if (variant === "final") {
    return (
      <div className="flex justify-center gap-4">
        <Link
          href="/book"
          className="px-10 py-4 bg-white text-blue-600 font-bold rounded-full text-lg hover:bg-slate-100 transition"
        >
          {mounted && isLoggedIn ? "Book Now" : "Book as a guest"}
        </Link>

        {(!mounted || !isLoggedIn) && (
          <Link
            href="/login"
            className="px-10 py-4 bg-transparent text-white font-bold rounded-full text-lg hover:bg-white/10 transition border-2 border-white"
          >
            Login
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Link
        href="/book"
        className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-500/30"
      >
        {mounted && isLoggedIn ? "Book Now" : "Book as a guest"}
      </Link>

      {(!mounted || !isLoggedIn) && (
        <Link
          href="/login"
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-indigo-600 hover:to-purple-700 transition shadow-xl shadow-purple-500/20"
        >
          Login
        </Link>
      )}
    </div>
  );
}