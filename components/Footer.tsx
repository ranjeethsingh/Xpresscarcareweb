"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Update URL hash without triggering Next.js router re-render
      window.history.pushState(null, "", `#${id}`);
    } else {
      // Fallback if accessed from another route
      window.location.href = `/#${id}`;
    }
  };

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand Info */}
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="text-3xl font-black tracking-tighter">
            Xpress<span className="text-blue-500">Care</span>
          </Link>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            Premium Car Spa • Detailing • Mechanical Care. Serving doorstep & workshop vehicle maintenance across Hyderabad.
          </p>
          <p className="text-slate-500 text-xs pt-4">
            © {new Date().getFullYear()} Xpress Car Care. All rights reserved.
          </p>
        </div>

        {/* Explore Column */}
        <div>
          <h3 className="text-lg font-bold text-white mb-6">Explore</h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>
              <a
                href="#services"
                onClick={(e) => scrollToSection(e, "services")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Service Areas
              </a>
            </li>
            <li>
              <a
                href="#pricing"
                onClick={(e) => scrollToSection(e, "pricing")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, "how-it-works")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                FAQs
              </a>
            </li>
          </ul>
        </div>

        {/* Support Column */}
        <div>
          <h3 className="text-lg font-bold text-white mb-6">Support</h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>
              <a href="tel:9494494671" className="hover:text-white transition-colors">
                Contact
              </a>
            </li>
            <li>
              <Link href="/careers" className="hover:text-white transition-colors">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}