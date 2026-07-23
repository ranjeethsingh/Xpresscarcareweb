"use client";

import React, { useState } from "react";
import Link from "next/link";

// 14-point and 9-point General Service checklists
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

export default function PricingPage() {
  const [activeCategory, setActiveCategory] = useState<
    "general" | "wash" | "detailing" | "teflon" | "wheels" | "combos" | "monthly"
  >("general");

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans py-16 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Navigation Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 font-bold text-sm inline-flex items-center gap-1 transition"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Page Title */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-blue-400 font-bold text-xs tracking-widest uppercase">
            XPRESS CAR CARE
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
            Official Pricing Menu
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Premium Car Spa • Detailing • Wheel Care • Full Mechanical Services
          </p>
          <div className="w-16 h-1.5 bg-blue-600 mx-auto rounded-full" />
        </div>

        {/* Category Tabs */}
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
                Book as a guest
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
                Book as a guest
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
    </div>
  );
}