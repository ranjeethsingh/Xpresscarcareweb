"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamic Client-Only Imports to prevent SSR compiler hanging
const StoreMap = dynamic(() => import("@/components/StoreMap"), { ssr: false });
const HomeCTA = dynamic(() => import("@/components/HomeCTA"), { ssr: false });

// ==========================================
// AUTOMOTIVE BRAND LOGOS (SVG)
// ==========================================

const SuzukiLogo = () => (
  <svg 
    viewBox="0 0 100 80" 
    className="h-10 w-auto mx-auto text-[#E11D48]" 
    fill="currentColor"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20 15 L80 15 L35 55 L80 55 L65 70 L10 70 L55 30 L10 30 Z" />
  </svg>
);

const HyundaiLogo = () => (
  <svg 
    viewBox="0 0 120 80" 
    className="h-10 w-auto mx-auto text-[#002C5F]" 
    fill="currentColor"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="60" cy="40" rx="45" ry="25" fill="none" stroke="currentColor" strokeWidth="5.5"/>
    <path d="M43 25 C43 25 48 55 48 55 L56 55 L53 38 L67 38 L64 55 L72 55 C72 55 77 25 77 25 L69 25 C69 25 66 46 60 46 C54 46 51 25 51 25 Z" />
  </svg>
);

const HondaLogo = () => (
  <svg 
    viewBox="0 0 100 80" 
    className="h-10 w-auto mx-auto text-slate-900" 
    stroke="currentColor" 
    strokeWidth="5"
    fill="none"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15 15 C15 10 20 5 30 5 L70 5 C80 5 85 10 85 15 L85 65 C85 75 75 78 70 78 L30 78 C25 78 15 75 15 65 Z" strokeLinecap="round" />
    <path d="M32 20 L35 63 M68 20 L65 63 M33 42 C40 41.5 60 41.5 67 42" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

const ToyotaLogo = () => (
  <svg 
    viewBox="0 0 120 80" 
    className="h-10 w-auto mx-auto text-[#EB0A1E]" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="5"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="60" cy="40" rx="48" ry="28" />
    <ellipse cx="60" cy="27" rx="30" ry="13" strokeWidth="4" />
    <ellipse cx="60" cy="40" rx="10" ry="28" strokeWidth="4" />
  </svg>
);

const TataLogo = () => (
  <svg 
    viewBox="0 0 120 80" 
    className="h-10 w-auto mx-auto text-[#005a9c]" 
    fill="none"
    stroke="currentColor"
    strokeWidth="5.5"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="60" cy="40" rx="45" ry="25" />
    <path d="M60 22 C51.5 24.5 45.5 39 45.5 53.5 C52 51.5 55.5 39 60 30 C64.5 39 68 51.5 74.5 53.5 C74.5 39 68.5 24.5 60 22 Z" fill="currentColor" />
  </svg>
);

const NissanLogo = () => (
  <svg 
    viewBox="0 0 100 80" 
    className="h-10 w-auto mx-auto text-slate-900" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="5.5"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="40" r="28" />
    <rect x="5" y="32" width="90" height="16" fill="white" stroke="currentColor" strokeWidth="4.5" />
    <text x="50" y="44" fontSize="10" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="currentColor" stroke="none">NISSAN</text>
  </svg>
);

// ==========================================
// STATIC DATA
// ==========================================

const UNIFIED_SERVICES = [
  {
    title: "Car Periodic Service",
    image: "/images/car-periodic-service.jpg",
    desc: "Car Maintenance By Experts",
    badge: "Flat ₹ 499/- Off",
  },
  {
    title: "Car AC Repair & Service",
    image: "/images/car-ac-repair.jpg",
    desc: "Trusted & Reliable Work",
    badge: "10K+ Services Done",
  },
  {
    title: "Car Wash & Cleaning",
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&h=400&q=80",
    desc: "Service Anytime & Anywhere",
    badge: "Get 15% Off",
  },
  {
    title: "Car Tyre & Wheel Repair",
    image: "/images/car-tyre-repair.jpg",
    desc: "Quick & Instant Service",
    badge: "Get 15% Off",
  },
  {
    title: "Car Denting & Painting",
    image: "/images/car-denting-painting.jpg",
    desc: "Feel Like New One",
    badge: "Customize Packages",
  },
  {
    title: "Premium Car Detailing",
    image: "/images/premium-detailing.jpg",
    desc: "Mirror Gloss & Showroom Shine",
    badge: "Premium Polish Included",
  },
  {
    title: "Bike Service & Tuning",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&h=400&q=80",
    desc: "Expert Mechanical Tuning",
    badge: "Starts at ₹ 199/- Only",
  },
  {
    title: "24/7 Roadside Assistance",
    image: "/images/roadside-assistance.jpg",
    desc: "Emergency Towing & Flat Tyres",
    badge: "* Charges Applicable",
  },
];

const BRANDS = [
  { component: <SuzukiLogo /> },
  { component: <HyundaiLogo /> },
  { component: <HondaLogo /> },
  { component: <ToyotaLogo /> },
  { component: <TataLogo /> },
  { component: <NissanLogo /> },
];

const fullGeneralServiceChecklist = [
  "Engine oil",
  "Oil filter",
  "Air filter",
  "AC Filter",
  "Wiper liquid",
  "Steering oil checkup",
  "Disc brake oil checkup",
  "Coolant checkup",
  "Brakes checkup",
  "Wheel alignment & balancing",
  "Car wash",
  "Wiper blades checkup",
  "Vacuum",
  "Electrical checkup",
];

const basicGeneralServiceChecklist = [
  "Engine oil",
  "Oil filter",
  "Air filter",
  "AC Filter",
  "Wiper liquid",
  "Steering oil checkup",
  "Disc brake oil checkup",
  "Coolant checkup",
  "Brakes checkup",
];

function HomeContent() {
  const brandScrollContainer = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<
    "general" | "wash" | "detailing" | "teflon" | "wheels" | "combos" | "monthly"
  >("general");

  // State for Price Menu Fullscreen Lightbox & Interactive Image Zoom
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Lock / Unlock body scroll when Tariff Price Menu Lightbox opens or closes
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  const scrollBrands = (direction: "left" | "right") => {
    if (brandScrollContainer.current) {
      const scrollAmount = 320;
      brandScrollContainer.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-white font-sans text-slate-800">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold tracking-wider uppercase mb-6">
              Now Serving Hyderabad
            </div>

            <h1 className="text-6xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9] mb-8">
              Vehicle care,
              <br />
              <span className="text-blue-600">reimagined.</span>
            </h1>

            <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
              Skip the workshop. We bring professional-grade cleaning and
              maintenance to your doorstep. Simple, transparent, and built for
              you.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <HomeCTA variant="hero" />
              <button
                onClick={() => {
                  setIsZoomed(false);
                  setIsMenuOpen(true);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-4 rounded-2xl transition flex items-center gap-2 text-sm md:text-base shadow-lg"
              >
                <span>📜 View Price Tariff Menu</span>
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 w-full h-[500px] relative rounded-[2rem] overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=2070&auto=format&fit=crop"
              alt="Professional car care service"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ================= OFFICIAL PRICE MENU HIGHLIGHT ================= */}
      <section className="py-16 bg-slate-950 text-white px-6 border-y border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          
          <div className="flex-1 space-y-6">
            <span className="bg-blue-600/20 text-blue-400 text-xs font-black uppercase px-4 py-1.5 rounded-full tracking-widest border border-blue-500/30 inline-block">
              Official Rate Card
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              100% Transparent Pricing Guaranteed
            </h2>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed">
              Explore our official rate menu for foam washes, Teflon coatings, wheel care, detailing, and multi-wash monthly packages.
            </p>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span> Free Nitrogen Air with Wheel Alignment & Balancing
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span> Monthly Subscriptions: Buy 4 Washes, Get 1 FREE
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  setIsZoomed(false);
                  setIsMenuOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/30 transition flex items-center gap-2"
              >
                <span>🔍 Click to View Official Tariff Card</span>
              </button>

              <Link
                href="/book"
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-8 py-4 rounded-2xl transition"
              >
                Book Service Online →
              </Link>
            </div>
          </div>

          <div 
            className="flex-1 w-full max-w-sm cursor-pointer group" 
            onClick={() => {
              setIsZoomed(false);
              setIsMenuOpen(true);
            }}
          >
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700 hover:border-blue-500 shadow-2xl transition duration-300 transform group-hover:scale-[1.02]">
              <Image
                src="/price-menu.png"
                alt="Xpress Car Care Price Menu"
                width={500}
                height={700}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition" />
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-center">
                <span className="text-xs font-bold text-blue-400">Click image to expand rate card ↗</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SERVICES GRID ================= */}
      <section id="services" className="py-24 bg-white border-t border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Top Car & Bike Services In Hyderabad
            </h2>
            <div className="w-16 h-1.5 bg-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {UNIFIED_SERVICES.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
              >
                <div className="w-full h-48 overflow-hidden bg-slate-100 rounded-t-3xl relative">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-2">
                    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {service.badge}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-xl leading-snug pt-1">
                      {service.title}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {service.desc}
                    </p>
                  </div>

                  <Link
                    href="/book"
                    className="text-blue-600 hover:text-blue-700 text-xs font-black tracking-widest uppercase transition-colors inline-flex items-center gap-1 self-start"
                  >
                    Select Service <span className="text-sm">›</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BRANDS SLIDER ================= */}
      <section className="py-20 bg-slate-50 border-y border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight uppercase">
              BRANDS WE SERVICE
            </h2>
            <p className="text-slate-500 text-sm md:text-base">
              We have the expertise for all major car manufacturers.
            </p>
            <div className="w-12 h-[3px] bg-blue-600 mx-auto" />
          </div>

          <div className="relative flex items-center">
            <button
              onClick={() => scrollBrands("left")}
              className="absolute left-0 z-10 p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-sm transition-colors text-slate-600 font-bold"
              aria-label="Scroll left"
            >
              ←
            </button>

            <div
              ref={brandScrollContainer}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory px-12 py-4 w-full no-scrollbar"
            >
              {BRANDS.map((brand, index) => (
                <div
                  key={index}
                  className="w-[200px] bg-white border border-slate-200/80 rounded-2xl shadow-sm flex-shrink-0 flex items-center justify-center p-6 h-28 snap-center hover:shadow-md transition-shadow"
                >
                  <div className="w-full text-center">
                    {brand.component}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollBrands("right")}
              className="absolute right-0 z-10 p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-sm transition-colors text-slate-600 font-bold"
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* ================= STORE LOCATION MAP ================= */}
      <section className="py-16 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-4">
                Visit Our Store
              </h2>

              <p className="text-slate-300 max-w-2xl leading-relaxed">
                Xpress Car Care is currently serving customers from our store in{" "}
                <span className="font-bold text-white">
                  Gajularamaram, Hyderabad
                </span>
                . You can visit us directly or use our pickup and drop facility
                where available.
              </p>

              <div className="mt-6 flex flex-col xl:flex-row xl:items-center gap-3 xl:gap-6 text-slate-300 text-sm">
                <p>
                  <span className="font-semibold text-white">Phone:</span>{" "}
                  <a href="tel:9494494671" className="hover:text-white transition">
                    9494494671
                  </a>{" "}
                  /{" "}
                  <a href="tel:9849969073" className="hover:text-white transition">
                    9849969073
                  </a>
                </p>

                <p>
                  <span className="font-semibold text-white">Email:</span>{" "}
                  <a href="mailto:xpresscarcare26@gmail.com" className="hover:text-white transition">
                    xpresscarcare26@gmail.com
                  </a>
                </p>

                <p>
                  <span className="font-semibold text-white">Website:</span>{" "}
                  <a
                    href="https://Xpresscarcare.online"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition"
                  >
                    Xpresscarcare.online
                  </a>
                </p>
              </div>
            </div>

            <div className="text-slate-950">
              <StoreMap />
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRUST BAR ================= */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-4xl font-black mb-2">50k+</div>
            <div className="text-slate-500 font-medium">Services Completed</div>
          </div>

          <div>
            <div className="text-4xl font-black mb-2">4.9/5</div>
            <div className="text-slate-500 font-medium">Customer Rating</div>
          </div>

          <div>
            <div className="text-4xl font-black mb-2">30m</div>
            <div className="text-slate-500 font-medium">Avg Response Time</div>
          </div>

          <div>
            <div className="text-4xl font-black mb-2">100%</div>
            <div className="text-slate-500 font-medium">Satisfaction</div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-5xl font-extrabold tracking-tighter mb-16 text-center">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Book Online</h3>
              <p className="text-slate-600">
                Choose your service, pick a time slot, and confirm your booking in minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">We Come to You</h3>
              <p className="text-slate-600">
                Our professional team arrives at your location with all the equipment needed.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Enjoy the Results</h3>
              <p className="text-slate-600">
                Sit back and relax while we transform your vehicle. 100% satisfaction guaranteed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRICING SECTION ================= */}
      <section id="pricing" className="py-24 bg-slate-900 text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center space-y-3 mb-12">
            <span className="text-blue-400 font-bold text-xs tracking-widest uppercase">
              XPRESS CAR CARE
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Service Price List
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
              Premium Car Spa • Detailing • Wheel Care • Full Mechanical Services
            </p>
            <div className="w-16 h-1.5 bg-blue-600 mx-auto rounded-full" />
          </div>

          {/* Pricing Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12">
            {[
              { id: "general", label: "⚙️ General Service" },
              { id: "wash", label: "🚗 Car Wash" },
              { id: "detailing", label: "✨ Interior Detailing" },
              { id: "teflon", label: "🛡️ Teflon Coating" },
              { id: "wheels", label: "⚙️ Wheel Alignment" },
              { id: "combos", label: "🎁 Combo Packages" },
              { id: "monthly", label: "📅 Monthly Packages" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-5 py-2.5 rounded-full font-bold text-xs md:text-sm transition-all ${
                  activeCategory === cat.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 1. GENERAL SERVICE */}
          {activeCategory === "general" && (
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-slate-800 rounded-3xl p-8 border-2 border-blue-500 relative flex flex-col justify-between shadow-2xl">
                <span className="absolute -top-3.5 right-6 bg-blue-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                  Full Package
                </span>
                <div>
                  <h3 className="text-2xl font-black text-white">General Service</h3>
                  <p className="text-blue-400 text-xs font-semibold mt-1 mb-4">Complete 14-point maintenance & wash</p>
                  <div className="text-4xl font-black text-white mb-6">₹ 5,500</div>

                  <ul className="space-y-2.5 border-t border-slate-700/60 pt-6 mb-8 text-sm text-slate-300">
                    {fullGeneralServiceChecklist.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <span className="text-blue-400 font-bold">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/book"
                  className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition shadow-lg shadow-blue-600/30"
                >
                  Book Service Now
                </Link>
              </div>

              <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white">General Service</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-1 mb-4">9-point service (Without car wash & alignment)</p>
                  <div className="text-4xl font-black text-white mb-6">₹ 4,500</div>

                  <ul className="space-y-2.5 border-t border-slate-700/60 pt-6 mb-8 text-sm text-slate-300">
                    {basicGeneralServiceChecklist.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <span className="text-slate-400 font-bold">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/book"
                  className="w-full text-center bg-slate-700 hover:bg-slate-600 text-white py-3.5 rounded-xl font-bold transition"
                >
                  Book Service Now
                </Link>
              </div>
            </div>
          )}

          {/* 2. CAR WASH */}
          {activeCategory === "wash" && (
            <div className="max-w-4xl mx-auto bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-700">
              <h3 className="text-2xl font-black mb-6 text-white flex items-center gap-2">
                🚗 Car Wash Rates
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-xs uppercase font-bold text-slate-400">
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 font-semibold text-slate-200">
                    <tr>
                      <td className="py-4 px-4">Body Wash</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 300</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">Foam Wash</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 500</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">Luxury Car Body Wash</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 400</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">Luxury Car Foam Wash</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 600</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">SUV (7-Seater Vehicles) Body Wash</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 700</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. INTERIOR DETAILING */}
          {activeCategory === "detailing" && (
            <div className="max-w-4xl mx-auto bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-700">
              <h3 className="text-2xl font-black mb-2 text-white">✨ Interior Detailing</h3>
              <p className="text-amber-400 text-xs font-semibold mb-6">
                ⚠️ Note: Verified price menu for detailing services.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-xs uppercase font-bold text-slate-400">
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 font-semibold text-slate-200">
                    <tr>
                      <td className="py-4 px-4">Interior Detailing (Sedan/Hatchback)</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 4,000</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">SUV (7-Seater Vehicles) Interior Detailing</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 2,000</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">Luxury Car Interior Cleaning</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 2,500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. TEFLON COATING */}
          {activeCategory === "teflon" && (
            <div className="max-w-4xl mx-auto bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-700">
              <h3 className="text-2xl font-black mb-6 text-white">🛡️ Teflon Coating</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-xs uppercase font-bold text-slate-400">
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 font-semibold text-slate-200">
                    <tr>
                      <td className="py-4 px-4">Standard Cars</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 3,500</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">SUV (7-Seater Vehicles)</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 4,500</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">Luxury Cars</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 5,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. WHEEL ALIGNMENT */}
          {activeCategory === "wheels" && (
            <div className="max-w-4xl mx-auto bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-700">
              <h3 className="text-2xl font-black mb-6 text-white">⚙️ Wheel Alignment & Balancing</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-xs uppercase font-bold text-slate-400">
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 font-semibold text-slate-200">
                    <tr>
                      <td className="py-4 px-4">
                        Wheel Alignment & Balancing
                        <span className="block text-xs text-green-400 font-bold">Includes FREE Nitrogen Air</span>
                      </td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 500</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">
                        Alloy Wheel Alignment & Balancing
                        <span className="block text-xs text-green-400 font-bold">Includes FREE Nitrogen Air</span>
                      </td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 700</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">Wheel Rotation</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 200</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">Wheel Rotation (With Alignment & Balancing)</td>
                      <td className="py-4 px-4 text-right text-green-400 font-bold">FREE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. COMBOS */}
          {activeCategory === "combos" && (
            <div className="max-w-4xl mx-auto bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-700">
              <h3 className="text-2xl font-black mb-6 text-white">🎁 Combo Package</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-xs uppercase font-bold text-slate-400">
                      <th className="py-3 px-4">Package</th>
                      <th className="py-3 px-4 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 font-semibold text-slate-200">
                    <tr>
                      <td className="py-4 px-4">Wheel Alignment & Balancing + Body Wash</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 899</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">SUV (7-Seater Vehicles) Wheel Alignment & Balancing + Body Wash</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 1,299</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. MONTHLY */}
          {activeCategory === "monthly" && (
            <div className="max-w-4xl mx-auto bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-700">
              <h3 className="text-2xl font-black mb-6 text-white">📅 Monthly Packages</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-xs uppercase font-bold text-slate-400">
                      <th className="py-3 px-4">Package</th>
                      <th className="py-3 px-4 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 font-semibold text-slate-200">
                    <tr>
                      <td className="py-4 px-4">4 Foam Washes + 1 FREE Foam Wash</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 2,000</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">4 Body Washes + 1 FREE Body Wash</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 1,200</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">4 SUV (7-Seater Vehicles) Foam Washes + 1 FREE Foam Wash</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 2,800</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4">4 SUV (7-Seater Vehicles) Body Washes + 1 FREE Body Wash</td>
                      <td className="py-4 px-4 text-right text-blue-400 font-bold">₹ 1,600</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tighter">
            Ready to get started?
          </h2>

          <p className="text-blue-100 text-lg mb-10">
            Join over 500+ satisfied customers today.
          </p>

          <HomeCTA variant="final" />
        </div>
      </section>

      {/* ================= FIXED INTERACTIVE LIGHTBOX MODAL ================= */}
      {isMenuOpen && (
        <div 
          onClick={() => {
            setIsMenuOpen(false);
            setIsZoomed(false);
          }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-full max-w-5xl flex flex-col items-center cursor-default"
          >
            {/* Top Bar with Controls */}
            <div className="w-full flex items-center justify-between pb-3 text-white border-b border-slate-800 mb-3">
              <div className="text-xs md:text-sm text-slate-300 font-medium">
                💡 <span className="font-bold text-blue-400">Click image</span> to toggle 1.5x Magnified Zoom
              </div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsZoomed(false);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold border border-slate-600 transition"
                aria-label="Close modal"
              >
                ✕ Close
              </button>
            </div>

            {/* Scrollable Viewport Container */}
            <div className="w-full max-h-[78vh] overflow-auto rounded-2xl bg-slate-900 border border-slate-800 flex justify-center p-2 md:p-6 no-scrollbar">
              <div 
                onClick={() => setIsZoomed(!isZoomed)}
                className={`transition-all duration-300 ease-in-out ${
                  isZoomed 
                    ? "cursor-zoom-out w-[1200px] max-w-none" 
                    : "cursor-zoom-in w-full max-w-3xl"
                }`}
              >
                <Image
                  src="/price-menu.png"
                  alt="Xpress Car Care Official Price Menu"
                  width={1000}
                  height={1450}
                  className="w-full h-auto object-contain rounded-xl shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs md:text-sm text-white font-bold px-5 py-2.5 rounded-xl transition"
              >
                {isZoomed ? "🔍 Fit Screen" : "🔍 Magnify Image (1.5x)"}
              </button>

              <a
                href="/price-menu.png"
                download="Xpress_Car_Care_Price_Menu.png"
                className="bg-blue-600 hover:bg-blue-700 text-xs md:text-sm text-white font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/30"
              >
                📥 Download Rate Card
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white text-slate-800">Loading Xpress Care...</div>}>
      <HomeContent />
    </Suspense>
  );
}