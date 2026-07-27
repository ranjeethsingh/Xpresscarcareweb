"use client";

import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
  created_at: string;
}

interface Vehicle {
  id: string;
  profile_id: string | null;
  customer_phone: string;
  vehicle_type: "car" | "bike";
  brand: string | null;
  model: string | null;
  registration_number: string | null;
  created_at: string;
  updated_at: string;
}

type AccountTab =
  | "profile"
  | "bookings"
  | "pricing"
  | "contact"
  | "terms"
  | "faqs";

type VehicleType = "car" | "bike" | "";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  disabled?: boolean;
};

function PasswordInput({
  value,
  onChange,
  placeholder = "Enter password",
  className = "",
  name = "xpress-password-no-autofill",
  disabled = false,
}: PasswordInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const maskedValue = "*".repeat(value.length);

  const setCaret = (position: number) => {
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(position, position);
    });
  };

  const replaceSelection = (insertText: string) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;

    const nextValue = value.slice(0, start) + insertText + value.slice(end);

    onChange(nextValue);
    setCaret(start + insertText.length);
  };

  const handleBeforeInput = (e: FormEvent<HTMLInputElement>) => {
    const nativeEvent = e.nativeEvent as InputEvent;
    const inputText = nativeEvent.data;

    if (!inputText) return;

    e.preventDefault();
    replaceSelection(inputText);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;

    if (e.key === "Backspace") {
      e.preventDefault();

      if (start !== end) {
        const nextValue = value.slice(0, start) + value.slice(end);
        onChange(nextValue);
        setCaret(start);
        return;
      }

      if (start > 0) {
        const nextValue = value.slice(0, start - 1) + value.slice(start);
        onChange(nextValue);
        setCaret(start - 1);
      }

      return;
    }

    if (e.key === "Delete") {
      e.preventDefault();

      if (start !== end) {
        const nextValue = value.slice(0, start) + value.slice(end);
        onChange(nextValue);
        setCaret(start);
        return;
      }

      if (start < value.length) {
        const nextValue = value.slice(0, start) + value.slice(start + 1);
        onChange(nextValue);
        setCaret(start);
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData("text");
    if (!pastedText) return;

    replaceSelection(pastedText);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={maskedValue}
      onChange={() => {}}
      onBeforeInput={handleBeforeInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={placeholder}
      name={name}
      disabled={disabled}
      autoComplete="new-password"
      autoCorrect="off"
      autoCapitalize="none"
      spellCheck={false}
      className={className}
    />
  );
}

// Checklists for General Service
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

function PricingContent() {
  const [activeCategory, setActiveCategory] = useState<
    "general" | "wash" | "detailing" | "teflon" | "wheels" | "combos" | "monthly"
  >("general");

  return (
    <section id="pricing" className="bg-slate-900 text-white p-6 md:p-10 rounded-3xl">
      <div className="text-center space-y-3 mb-10">
        <span className="text-blue-400 font-bold text-xs tracking-widest uppercase">
          XPRESS CAR CARE
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
          Service Price List
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
          Premium Car Spa • Detailing • Wheel Care • Full Mechanical Services
        </p>
        <div className="w-16 h-1.5 bg-blue-600 mx-auto rounded-full" />
      </div>

      {/* Pricing Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10">
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
              Book Service
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
              Book Service
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
    </section>
  );
}

function ContactContent() {
  return (
    <section>
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter mb-4">
        Contact Us
      </h1>

      <p className="text-slate-500 text-lg mb-10">
        Reach out to Xpress Car Care for bookings, service enquiries, or support.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-5">Phone</h2>

          <div className="space-y-4">
            <a
              href="tel:9494494671"
              className="block text-lg font-semibold text-blue-600 hover:underline"
            >
              9494494671 — Ajay Singh
            </a>

            <a
              href="tel:9849969073"
              className="block text-lg font-semibold text-blue-600 hover:underline"
            >
              9849969073 — Munna Singh
            </a>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-5">Online</h2>

          <div className="space-y-4">
            <a
              href="mailto:xpresscarcare26@gmail.com"
              className="block text-lg font-semibold text-blue-600 hover:underline"
            >
              xpresscarcare26@gmail.com
            </a>

            <a
              href="https://Xpresscarcare.online"
              target="_blank"
              rel="noreferrer"
              className="block text-lg font-semibold text-blue-600 hover:underline"
            >
              Xpresscarcare.online
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-slate-50 border border-slate-200 rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-4">Store Location</h2>
        <p className="text-slate-600 mb-6">Gajularamaram, Hyderabad</p>

        <a
          href="https://maps.app.goo.gl/2eMnBrWRLBEvnyZT7"
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition"
        >
          Open in Google Maps
        </a>
      </div>
    </section>
  );
}

function FAQContent() {
  const faqs = [
    [
      "Do I need to book an appointment?",
      "Appointments are recommended, but walk-ins are welcome subject to availability.",
    ],
    [
      "How long does a service take?",
      "A car wash typically takes 30–60 minutes. Detailing and garage services may require additional time.",
    ],
    [
      "Do you offer pickup & drop?",
      "Yes, pickup and drop services are available in selected areas.",
    ],
    [
      "What payment methods do you accept?",
      "We accept UPI, debit/credit cards, net banking, and cash.",
    ],
    [
      "Do you use safe, high-quality products?",
      "Yes, we use premium automotive-grade products that are safe for your vehicle.",
    ],
    [
      "Can I book online?",
      "Yes, appointments can be booked through our website, phone, or WhatsApp.",
    ],
    [
      "Do you service all car brands?",
      "Yes, we service most Indian and international car brands, including EVs.",
    ],
    [
      "What if I'm not satisfied with the service?",
      "Please contact us within 24 hours, and we'll review your concern and work toward a suitable resolution.",
    ],
  ];

  return (
    <section>
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter mb-4">
        Frequently Asked Questions
      </h1>

      <p className="text-slate-500 text-lg mb-10">
        Quick answers to common questions about Xpress Car Care.
      </p>

      <div className="space-y-4">
        {faqs.map(([question, answer], index) => (
          <div
            key={question}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold mb-2">
              {index + 1}. {question}
            </h2>
            <p className="text-slate-600">{answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TermsContent() {
  const sections = [
    {
      title: "1. Acceptance of Service",
      body: [
        "By booking or using our services, you agree to abide by these Terms & Conditions.",
      ],
    },
    {
      title: "2. Vehicle Condition",
      body: [
        "Customers are requested to remove all valuables before handing over the vehicle.",
        "We are not responsible for any loss or damage to personal belongings left inside the vehicle.",
        "Existing scratches, dents, paint defects, cracked windshields, damaged trims, or other pre-existing damages should be informed before service.",
      ],
    },
    {
      title: "3. Personal Belongings",
      body: [
        "Please remove cash, jewelry, electronics, important documents, and other valuables.",
        "We shall not be liable for loss of personal items.",
      ],
    },
    {
      title: "4. Liability",
      body: [
        "We exercise utmost care while handling every vehicle.",
        "However, we are not responsible for damage arising from pre-existing defects, weak or loose body parts, mirrors, trims, badges, antennas, spoilers, poor repainting, non-OEM paint, or mechanical/electrical failures unrelated to our service.",
      ],
    },
    {
      title: "5. Paint & Wrap Disclaimer",
      body: [
        "Vehicles with matte paint, vinyl wraps, ceramic coatings, Paint Protection Film (PPF), or freshly painted panels must be disclosed before service.",
        "We are not responsible for damage caused due to improper prior installation or manufacturer defects.",
      ],
    },
    {
      title: "6. Delays",
      body: [
        "Service timings are estimates only and may vary depending on weather, vehicle condition, operational requirements, or high customer volume.",
      ],
    },
    {
      title: "7. Cancellation & Rescheduling",
      body: [
        "Appointments may be cancelled or rescheduled up to a specified time before the booking.",
        "Advance payments, if any, may be adjusted or refunded as per company policy.",
      ],
    },
    {
      title: "8. Payment",
      body: [
        "Payment is due upon completion of service unless prepaid.",
        "Prices are subject to change without prior notice.",
        "Additional work requested by the customer will be charged separately.",
      ],
    },
    {
      title: "9. Refusal of Service",
      body: [
        "We reserve the right to refuse service for unsafe vehicles, excessively dirty or hazardous vehicles, biohazard contamination, illegal substances, or abusive behaviour towards staff.",
      ],
    },
    {
      title: "10. Satisfaction Policy",
      body: [
        "If you are dissatisfied with the service, kindly notify us before leaving our premises or within 24 hours of service completion.",
        "We will inspect the concern and, where appropriate, offer a reasonable resolution.",
      ],
    },
    {
      title: "11. Force Majeure",
      body: [
        "We shall not be liable for delays or inability to provide services due to events beyond our control, including natural disasters, strikes, power failures, government restrictions, or severe weather.",
      ],
    },
    {
      title: "12. Photography",
      body: [
        "We may photograph vehicles before and after service for quality assurance and promotional purposes.",
        "Registration numbers and personal information will not be intentionally disclosed without consent.",
      ],
    },
    {
      title: "13. Warranty",
      body: [
        "Our services improve the appearance of your vehicle but do not guarantee permanent removal of stains, scratches, oxidation, or defects beyond the scope of the selected service.",
      ],
    },
    {
      title: "14. Governing Law",
      body: [
        "These Terms & Conditions shall be governed by the laws of India, and any disputes shall be subject to the jurisdiction of the courts where the business is registered.",
      ],
    },
  ];

  const disclaimers = [
    "We are not responsible for factory-defective or previously repaired paint.",
    "Engine washing is carried out only at the customer's request and risk.",
    "Loose accessories or aftermarket fittings are the customer's responsibility.",
    "Interior shampooing may require additional drying time.",
    "Certain stains, odours, pet hair, and water spots may not be removable completely.",
    "We reserve the right to revise pricing after inspecting the vehicle if its condition differs significantly from the selected package.",
    "Promotional offers cannot be combined unless explicitly stated.",
    "Memberships and packages are non-transferable and non-refundable unless otherwise specified.",
  ];

  return (
    <section>
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter mb-4">
        Terms & Conditions
      </h1>

      <p className="text-slate-500 text-lg mb-10">
        Please read these terms carefully before booking or using our services.
      </p>

      <div className="space-y-5">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold mb-3">{section.title}</h2>

            <div className="space-y-2 text-slate-600">
              {section.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-slate-50 border border-slate-200 rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-4">Additional Disclaimers</h2>

        <ul className="space-y-2 text-slate-600">
          {disclaimers.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function MyAccountPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AccountTab | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [profileId, setProfileId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [originalProfile, setOriginalProfile] = useState<any>({});

  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Forgot-current-password: verify via OTP instead of the old password
  const [passwordMode, setPasswordMode] = useState<"current" | "otp">("current");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resetOtp, setResetOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehicleError, setVehicleError] = useState("");
  const [savingVehicle, setSavingVehicle] = useState(false);

  const [vehicleType, setVehicleType] = useState<VehicleType>("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [clearingAllBookings, setClearingAllBookings] = useState(false);

  const isValidPhone = (num: string) => /^[6-9]\d{9}$/.test(num);
  const cleanPhone = (value: string) => value.replace(/\D/g, "").slice(0, 10);
  const cleanReg = (value: string) => value.toUpperCase().replace(/\s/g, "");

  const cleanVehicleType = (value: any): VehicleType => {
    if (value === "car" || value === "bike") return value;
    return "";
  };

  const fetchVehicles = async (targetPhone: string) => {
    setVehiclesLoading(true);

    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("customer_phone", targetPhone)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVehicles(data || []);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const fetchBookings = async (targetPhone: string) => {
    setBookingsLoading(true);

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("customer_phone", targetPhone)
        // Only show bookings the customer hasn't hidden from their own view.
        // Rows are never actually deleted here — admins can still see everything.
        .or("hidden_by_customer.is.null,hidden_by_customer.eq.false")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const migrateLegacyVehicle = async (source: any, userData: any) => {
    try {
      const legacyType = cleanVehicleType(source.vehicle_type);
      const legacyBrand = source.vehicle_brand || "";
      const legacyModel = source.vehicle_model || "";
      const legacyReg = cleanReg(source.vehicle_reg || "");

      if (!legacyType && !legacyBrand && !legacyModel && !legacyReg) return;
      if (!userData.phone) return;

      let query = supabase
        .from("vehicles")
        .select("id")
        .eq("customer_phone", userData.phone)
        .limit(1);

      if (legacyReg) {
        query = query.eq("registration_number", legacyReg);
      } else {
        query = query
          .eq("vehicle_type", legacyType || "car")
          .eq("brand", legacyBrand)
          .eq("model", legacyModel);
      }

      const { data: existing } = await query.maybeSingle();

      if (existing) return;

      await supabase.from("vehicles").insert({
        profile_id: userData.id || null,
        customer_phone: userData.phone,
        vehicle_type: legacyType || "car",
        brand: legacyBrand || null,
        model: legacyModel || null,
        registration_number: legacyReg || null,
      });
    } catch (err) {
      console.error("Legacy vehicle migration failed:", err);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = localStorage.getItem("xpress_user");

        if (!storedUser) {
          router.replace("/login");
          return;
        }

        const localUser = JSON.parse(storedUser);
        const localPhone = localUser.phone || "";
        const localEmail = localUser.email || "";

        if (!localPhone && !localEmail) {
          router.replace("/login");
          return;
        }

        let profile = null;

        if (localPhone) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("phone", localPhone)
            .maybeSingle();

          profile = data;
        }

        if (!profile && localEmail) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", localEmail)
            .maybeSingle();

          profile = data;
        }

        const source = profile || localUser;

        let resolvedFirstName = source.first_name || "";
        let resolvedLastName = source.last_name || "";

        if (!resolvedFirstName && source.name) {
          const parts = source.name.split(" ");
          resolvedFirstName = parts[0] || "";
          resolvedLastName = parts.slice(1).join(" ") || "";
        }

        const freshUser = {
          id: source.id || "",
          name: source.name || `${resolvedFirstName} ${resolvedLastName}`.trim(),
          first_name: resolvedFirstName,
          last_name: resolvedLastName,
          phone: source.phone || localPhone || "",
          email: source.email || localEmail || "",
          address: source.address || "",
          vehicle_type: cleanVehicleType(source.vehicle_type),
          vehicle_brand: source.vehicle_brand || "",
          vehicle_model: source.vehicle_model || "",
          vehicle_reg: source.vehicle_reg || "",
        };

        setProfileId(freshUser.id);
        setFirstName(freshUser.first_name);
        setLastName(freshUser.last_name);
        setPhone(freshUser.phone);
        setEmail(freshUser.email);
        setAddress(freshUser.address);
        setOriginalProfile(freshUser);

        localStorage.setItem("xpress_user", JSON.stringify(freshUser));
        localStorage.setItem("xpress_prefill", JSON.stringify(freshUser));

        await migrateLegacyVehicle(source, freshUser);

        if (freshUser.phone) {
          await fetchVehicles(freshUser.phone);
          await fetchBookings(freshUser.phone);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        router.replace("/login");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleEditProfile = () => {
    setOriginalProfile({
      id: profileId,
      first_name: firstName,
      last_name: lastName,
      phone,
      email,
      address,
    });

    setIsEditingProfile(true);
    setProfileError("");
    setProfileSaved(false);
  };

  const handleCancelProfile = () => {
    setProfileId(originalProfile.id || "");
    setFirstName(originalProfile.first_name || "");
    setLastName(originalProfile.last_name || "");
    setPhone(originalProfile.phone || "");
    setEmail(originalProfile.email || "");
    setAddress(originalProfile.address || "");

    setIsEditingProfile(false);
    setProfileError("");
  };

  const handleSaveProfile = async () => {
    setProfileError("");
    setSavingProfile(true);

    if (!firstName.trim()) {
      setProfileError("First name is required");
      setSavingProfile(false);
      return;
    }

    if (!isValidPhone(phone)) {
      setProfileError("Phone number must be 10 digits starting with 6, 7, 8, or 9");
      setSavingProfile(false);
      return;
    }

    try {
      const oldPhone = originalProfile.phone || phone;
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      const profileData = {
        name: fullName,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        phone,
        email: email || null,
        address: address.trim() || null,
        updated_at: new Date().toISOString(),
      };

      let finalProfileId = profileId;

      if (profileId) {
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", profileId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("profiles")
          .insert(profileData)
          .select("id")
          .single();

        if (error) throw error;

        finalProfileId = data.id;
        setProfileId(data.id);
      }

      if (oldPhone && oldPhone !== phone) {
        await supabase
          .from("vehicles")
          .update({ customer_phone: phone })
          .eq("customer_phone", oldPhone);

        await supabase
          .from("bookings")
          .update({ customer_phone: phone })
          .eq("customer_phone", oldPhone);
      }

      const userData = {
        id: finalProfileId,
        name: fullName,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone,
        email: email || "",
        address: address.trim() || "",
      };

      localStorage.setItem("xpress_user", JSON.stringify(userData));
      localStorage.setItem("xpress_prefill", JSON.stringify(userData));

      setOriginalProfile(userData);
      setIsEditingProfile(false);
      setProfileSaved(true);

      await fetchVehicles(phone);
      await fetchBookings(phone);

      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) {
      console.error("Profile save failed:", err);
      setProfileError(`Save failed: ${err?.message || "Unknown error"}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const clearPasswordFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordMode("current");
    setOtpSent(false);
    setOtpVerified(false);
    setResetOtp("");
    setSendingOtp(false);
  };

  const handleSendPasswordResetOtp = async () => {
    setPasswordError("");
    setSendingOtp(true);

    try {
      if (!phone && !email) {
        setPasswordError("No phone number or email on file to send a code to.");
        setSendingOtp(false);
        return;
      }

      // Simulated OTP send (same test-mode pattern used elsewhere in this app).
      // Replace with a real SMS/email OTP provider when going to production.
      setOtpSent(true);
    } catch (err) {
      console.error("Failed to send OTP:", err);
      setPasswordError("Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyPasswordResetOtp = () => {
    setPasswordError("");

    if (resetOtp !== "123456") {
      setPasswordError("Invalid OTP. Use 123456 for testing.");
      return;
    }

    setOtpVerified(true);
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSaved(false);
    setSavingPassword(true);

    if (!profileId) {
      setPasswordError("Please save your profile before changing password.");
      setSavingPassword(false);
      return;
    }

    if (!newPassword) {
      setPasswordError("Please enter a new password.");
      setSavingPassword(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New password and confirm password do not match.");
      setSavingPassword(false);
      return;
    }

    if (passwordMode === "otp" && !otpVerified) {
      setPasswordError("Please verify the OTP first.");
      setSavingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          currentPassword,
          newPassword,
          passwordMode,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setPasswordError(result.error || "Password change failed");
        setSavingPassword(false);
        return;
      }

      clearPasswordFields();
      setPasswordFormOpen(false);
      setPasswordSaved(true);

      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err: any) {
      console.error("Password change failed:", err);
      setPasswordError(`Password change failed: ${err?.message || "Unknown error"}`);
    } finally {
      setSavingPassword(false);
    }
  };

  const resetVehicleForm = () => {
    setEditingVehicleId(null);
    setVehicleType("");
    setVehicleBrand("");
    setVehicleModel("");
    setVehicleReg("");
    setVehicleError("");
  };

  const handleAddVehicle = () => {
    resetVehicleForm();
    setVehicleFormOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setVehicleType(vehicle.vehicle_type);
    setVehicleBrand(vehicle.brand || "");
    setVehicleModel(vehicle.model || "");
    setVehicleReg(vehicle.registration_number || "");
    setVehicleError("");
    setVehicleFormOpen(true);
  };

  const handleCancelVehicle = () => {
    resetVehicleForm();
    setVehicleFormOpen(false);
  };

  const handleSaveVehicle = async () => {
    setVehicleError("");
    setSavingVehicle(true);

    if (!phone) {
      setVehicleError("Profile phone number is required before adding vehicles.");
      setSavingVehicle(false);
      return;
    }

    if (!vehicleType) {
      setVehicleError("Please select Car or Bike.");
      setSavingVehicle(false);
      return;
    }

    if (!vehicleBrand.trim()) {
      setVehicleError("Vehicle brand is required.");
      setSavingVehicle(false);
      return;
    }

    if (!vehicleModel.trim()) {
      setVehicleError("Vehicle model is required.");
      setSavingVehicle(false);
      return;
    }

    if (!vehicleReg.trim()) {
      setVehicleError("Registration number is required.");
      setSavingVehicle(false);
      return;
    }

    try {
      const vehicleData = {
        profile_id: profileId || null,
        customer_phone: phone,
        vehicle_type: vehicleType,
        brand: vehicleBrand.trim(),
        model: vehicleModel.trim(),
        registration_number: cleanReg(vehicleReg),
        updated_at: new Date().toISOString(),
      };

      if (editingVehicleId) {
        const { error } = await supabase
          .from("vehicles")
          .update(vehicleData)
          .eq("id", editingVehicleId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("vehicles").insert(vehicleData);
        if (error) throw error;
      }

      resetVehicleForm();
      setVehicleFormOpen(false);
      await fetchVehicles(phone);
    } catch (err: any) {
      console.error("Vehicle save failed:", err);
      setVehicleError(`Vehicle save failed: ${err?.message || "Unknown error"}`);
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    const confirmed = window.confirm("Remove this vehicle from your account?");
    if (!confirmed) return;

    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId);
      if (error) throw error;
      await fetchVehicles(phone);
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      alert("Failed to delete vehicle.");
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    const confirmed = window.confirm("Remove this booking from your history? You can always contact us if you need it back.");
    if (!confirmed) return;

    setDeletingBookingId(bookingId);

    try {
      // Soft delete: hide from the customer's view only. The row stays in the
      // database untouched so admins retain full booking history.
      const { error } = await supabase
        .from("bookings")
        .update({ hidden_by_customer: true })
        .eq("id", bookingId);
      if (error) throw error;

      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (err) {
      console.error("Failed to remove booking:", err);
      alert("Failed to remove booking. Please try again.");
    } finally {
      setDeletingBookingId(null);
    }
  };

  const handleClearAllBookings = async () => {
    if (bookings.length === 0) return;

    const confirmed = window.confirm(
      `Remove all ${bookings.length} booking${bookings.length === 1 ? "" : "s"} from your history? You can always contact us if you need them back.`
    );
    if (!confirmed) return;

    setClearingAllBookings(true);

    try {
      // Soft delete: hide from the customer's view only. Rows stay in the
      // database untouched so admins retain full booking history.
      const { error } = await supabase
        .from("bookings")
        .update({ hidden_by_customer: true })
        .eq("customer_phone", phone);
      if (error) throw error;

      setBookings([]);
    } catch (err) {
      console.error("Failed to clear bookings:", err);
      alert("Failed to clear booking history. Please try again.");
    } finally {
      setClearingAllBookings(false);
    }
  };

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

  const savedCars = vehicles.filter((v) => v.vehicle_type === "car");
  const savedBikes = vehicles.filter((v) => v.vehicle_type === "bike");

  const servicedCars = bookings.filter((b) => b.vehicle_type?.toLowerCase() === "car");
  const servicedBikes = bookings.filter((b) => b.vehicle_type?.toLowerCase() === "bike");

  const accountCards: {
    id: AccountTab;
    label: string;
    icon: string;
    description: string;
    color: string;
  }[] = [
    {
      id: "profile",
      label: "Profile",
      icon: "👤",
      description: "Manage personal details, password, and saved vehicles.",
      color: "bg-blue-50 text-blue-700",
    },
    {
      id: "bookings",
      label: "My Bookings",
      icon: "📋",
      description: "View appointments, booking status, and service history.",
      color: "bg-green-50 text-green-700",
    },
    {
      id: "pricing",
      label: "Pricing",
      icon: "💰",
      description: "Check prices for car wash, detailing, wheel care, and general service.",
      color: "bg-amber-50 text-amber-700",
    },
    {
      id: "contact",
      label: "Contact",
      icon: "☎️",
      description: "Call us, email us, or find our store location.",
      color: "bg-purple-50 text-purple-700",
    },
    {
      id: "terms",
      label: "Terms & Conditions",
      icon: "📄",
      description: "Read service policies, liability terms, and customer guidelines.",
      color: "bg-slate-100 text-slate-700",
    },
    {
      id: "faqs",
      label: "FAQs",
      icon: "❓",
      description: "Find answers to common booking and service questions.",
      color: "bg-indigo-50 text-indigo-700",
    },
  ];

  const activeCard = accountCards.find((item) => item.id === activeTab);

  if (loadingProfile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] py-12 lg:py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Account Landing */}
        {!activeTab && (
          <>
            <div className="mb-10">
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tighter mb-3">
                My Account
              </h1>

              <p className="text-slate-500 text-lg max-w-3xl">
                {firstName
                  ? `Hi ${firstName}, choose what you want to manage today.`
                  : "Choose what you want to manage today."}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {accountCards.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="group text-left rounded-3xl p-7 min-h-[190px] transition-all duration-300 border bg-white text-slate-900 border-slate-200 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${item.color}`}
                    >
                      {item.icon}
                    </div>

                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                      →
                    </div>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight mb-3">
                    {item.label}
                  </h2>

                  <p className="text-sm leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 text-center">
              <h2 className="text-2xl font-bold text-blue-700 mb-2">
                What would you like to manage?
              </h2>
              <p className="text-blue-600">
                Select one of the cards above to open that section separately.
              </p>
            </div>
          </>
        )}

        {/* Selected Section */}
        {activeTab && (
          <main className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                onClick={() => setActiveTab(null)}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-semibold transition"
              >
                ← Back to My Account
              </button>

              {activeCard && (
                <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-full px-5 py-3 shadow-sm w-fit">
                  <span className="text-xl">{activeCard.icon}</span>
                  <span className="font-bold text-slate-900">{activeCard.label}</span>
                </div>
              )}
            </div>

            {activeTab === "profile" && (
              <div className="space-y-8">
                <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Personal Details</h2>
                      <p className="text-slate-500 text-sm mt-1">
                        View and manage your account information.
                      </p>
                    </div>

                    {!isEditingProfile && (
                      <button
                        onClick={handleEditProfile}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition"
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>

                      {isEditingProfile ? (
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-blue-50/30"
                        />
                      ) : (
                        <p className="text-base py-2 text-slate-900">
                          {firstName || "Not set"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Last Name
                      </label>

                      {isEditingProfile ? (
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-blue-50/30"
                        />
                      ) : (
                        <p className="text-base py-2 text-slate-900">
                          {lastName || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>

                      {isEditingProfile ? (
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(cleanPhone(e.target.value))}
                          maxLength={10}
                          placeholder="Enter 10-digit mobile number"
                          className="w-full px-4 py-3 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-blue-50/30 font-mono"
                        />
                      ) : (
                        <p className="text-base py-2 text-slate-900 font-mono">
                          {phone ? `+91 ${phone}` : "Not set"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email
                      </label>

                      {isEditingProfile ? (
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-blue-50/30"
                        />
                      ) : (
                        <p className="text-base py-2 text-slate-900">
                          {email || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Address
                    </label>

                    {isEditingProfile ? (
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition resize-none bg-blue-50/30"
                      />
                    ) : (
                      <p className="text-base py-2 text-slate-900">
                        {address || "Not set"}
                      </p>
                    )}
                  </div>

                  {isEditingProfile && (
                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={handleCancelProfile}
                        className="flex-1 py-4 rounded-2xl font-bold text-lg border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="flex-1 py-4 rounded-2xl font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
                      >
                        {savingProfile ? "Saving to Supabase..." : "Save Changes"}
                      </button>
                    </div>
                  )}

                  {profileSaved && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm font-semibold mt-6">
                      ✅ Profile and mobile number updated successfully in database!
                    </div>
                  )}

                  {profileError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mt-6">
                      {profileError}
                    </div>
                  )}
                </section>

                <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Password</h2>
                      <p className="text-slate-500 text-sm mt-1">
                        Change your login password. Passwords are never saved in your browser.
                      </p>
                    </div>

                    {!passwordFormOpen && (
                      <button
                        onClick={() => {
                          setPasswordFormOpen(true);
                          clearPasswordFields();
                          setPasswordError("");
                          setPasswordSaved(false);
                        }}
                        className="text-blue-600 font-semibold hover:text-blue-700"
                      >
                        Change Password
                      </button>
                    )}
                  </div>

                  {passwordFormOpen && (
                    <div className="space-y-5">
                      <div className="flex bg-slate-100 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordMode("current");
                            setPasswordError("");
                          }}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                            passwordMode === "current"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500"
                          }`}
                        >
                          I know my password
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPasswordMode("otp");
                            setPasswordError("");
                            setOtpSent(false);
                            setOtpVerified(false);
                            setResetOtp("");
                          }}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                            passwordMode === "otp"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500"
                          }`}
                        >
                          Forgot password? Use OTP
                        </button>
                      </div>

                      {passwordMode === "current" && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Current Password
                          </label>
                          <PasswordInput
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            placeholder="Enter current password"
                            name="xpress-current-password"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                          />
                        </div>
                      )}

                      {passwordMode === "otp" && !otpVerified && (
                        <div className="bg-slate-50 rounded-xl p-5 space-y-4">
                          {!otpSent ? (
                            <>
                              <p className="text-slate-600 text-sm">
                                We&apos;ll send a verification code to{" "}
                                <span className="font-semibold">
                                  {phone ? `+91 ${phone}` : email || "your registered contact"}
                                </span>
                                .
                              </p>
                              <button
                                type="button"
                                onClick={handleSendPasswordResetOtp}
                                disabled={sendingOtp}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50"
                              >
                                {sendingOtp ? "Sending..." : "Send OTP"}
                              </button>
                            </>
                          ) : (
                            <>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">
                                One-Time Password
                              </label>
                              <input
                                type="text"
                                value={resetOtp}
                                onChange={(e) => setResetOtp(e.target.value)}
                                placeholder="6-digit OTP"
                                maxLength={6}
                                autoComplete="off"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-center tracking-widest font-mono"
                              />
                              <p className="text-slate-400 text-xs text-center">
                                Use <span className="font-mono font-bold">123456</span> for testing
                              </p>
                              <button
                                type="button"
                                onClick={handleVerifyPasswordResetOtp}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition"
                              >
                                Verify Code
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {passwordMode === "otp" && otpVerified && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm font-semibold text-center">
                          ✅ Code verified. Set your new password below.
                        </div>
                      )}

                      {(passwordMode === "current" ||
                        (passwordMode === "otp" && otpVerified)) && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              New Password
                            </label>
                            <PasswordInput
                              value={newPassword}
                              onChange={setNewPassword}
                              placeholder="Enter new password"
                              name="xpress-new-password"
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Confirm New Password
                            </label>
                            <PasswordInput
                              value={confirmNewPassword}
                              onChange={setConfirmNewPassword}
                              placeholder="Re-type new password"
                              name="xpress-confirm-new-password"
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                          </div>
                        </>
                      )}

                      {passwordError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                          {passwordError}
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            setPasswordFormOpen(false);
                            clearPasswordFields();
                            setPasswordError("");
                          }}
                          className="flex-1 py-3 rounded-xl font-bold border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
                        >
                          Cancel
                        </button>

                        {(passwordMode === "current" ||
                          (passwordMode === "otp" && otpVerified)) && (
                          <button
                            onClick={handleChangePassword}
                            disabled={savingPassword}
                            className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                          >
                            {savingPassword ? "Saving..." : "Save Password"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {passwordSaved && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm font-semibold">
                      ✅ Password changed successfully.
                    </div>
                  )}
                </section>

                <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Saved Vehicles</h2>
                      <p className="text-slate-500 text-sm mt-1">
                        Add multiple cars and bikes to your account.
                      </p>
                    </div>

                    {!vehicleFormOpen && (
                      <button
                        onClick={handleAddVehicle}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition"
                      >
                        + Add Vehicle
                      </button>
                    )}
                  </div>

                  {vehicleFormOpen && (
                    <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                      <h3 className="text-lg font-bold mb-4">
                        {editingVehicleId ? "Edit Vehicle" : "Add New Vehicle"}
                      </h3>

                      <div className="flex gap-4 mb-6">
                        <button
                          type="button"
                          onClick={() => setVehicleType("car")}
                          className={`flex-1 py-4 rounded-2xl border-2 font-bold text-lg transition ${
                            vehicleType === "car"
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          🚗 Car
                        </button>

                        <button
                          type="button"
                          onClick={() => setVehicleType("bike")}
                          className={`flex-1 py-4 rounded-2xl border-2 font-bold text-lg transition ${
                            vehicleType === "bike"
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          🏍️ Bike
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Brand <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={vehicleBrand}
                            onChange={(e) => setVehicleBrand(e.target.value)}
                            placeholder="e.g. Maruti, Honda"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Model <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={vehicleModel}
                            onChange={(e) => setVehicleModel(e.target.value)}
                            placeholder="e.g. Swift, Activa"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Registration Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={vehicleReg}
                          onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                          placeholder="e.g. TS09AB1234"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white font-mono tracking-wider"
                        />
                      </div>

                      {vehicleError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6">
                          {vehicleError}
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button
                          onClick={handleCancelVehicle}
                          className="flex-1 py-3 rounded-xl font-bold border border-slate-300 text-slate-600 hover:bg-white transition"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleSaveVehicle}
                          disabled={savingVehicle}
                          className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {savingVehicle
                            ? "Saving..."
                            : editingVehicleId
                            ? "Save Vehicle"
                            : "Add Vehicle"}
                        </button>
                      </div>
                    </div>
                  )}

                  {vehiclesLoading && (
                    <div className="text-center py-12">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-slate-500">Loading vehicles...</p>
                    </div>
                  )}

                  {!vehiclesLoading && vehicles.length === 0 && !vehicleFormOpen && (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl">
                      <div className="text-5xl mb-4">🚘</div>
                      <h3 className="text-xl font-bold mb-2">No Vehicles Saved</h3>
                      <p className="text-slate-500 mb-6">
                        Add your cars and bikes to make booking faster.
                      </p>
                      <button
                        onClick={handleAddVehicle}
                        className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition"
                      >
                        Add Your First Vehicle
                      </button>
                    </div>
                  )}

                  {savedCars.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-slate-700 mb-4">
                        🚗 Cars ({savedCars.length})
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        {savedCars.map((vehicle) => (
                          <div key={vehicle.id} className="border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-lg font-bold">
                                  {vehicle.brand} {vehicle.model}
                                </p>
                                <p className="text-sm text-slate-500 font-mono mt-1">
                                  {vehicle.registration_number}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditVehicle(vehicle)}
                                  className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                                  title="Edit"
                                >
                                  ✏️
                                </button>

                                <button
                                  onClick={() => handleDeleteVehicle(vehicle.id)}
                                  className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {savedBikes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-700 mb-4">
                        🏍️ Bikes ({savedBikes.length})
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        {savedBikes.map((vehicle) => (
                          <div key={vehicle.id} className="border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-lg font-bold">
                                  {vehicle.brand} {vehicle.model}
                                </p>
                                <p className="text-sm text-slate-500 font-mono mt-1">
                                  {vehicle.registration_number}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditVehicle(vehicle)}
                                  className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                                  title="Edit"
                                >
                                  ✏️
                                </button>

                                <button
                                  onClick={() => handleDeleteVehicle(vehicle.id)}
                                  className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {(servicedCars.length > 0 || servicedBikes.length > 0) && (
                  <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">
                      Already Serviced Vehicles
                    </h2>

                    {servicedCars.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-700 mb-4">
                          🚗 Serviced Cars ({servicedCars.length})
                        </h3>

                        <div className="space-y-3">
                          {servicedCars.map((b) => (
                            <div key={b.id} className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                              <div>
                                <p className="font-bold">{b.vehicle_model}</p>
                                <p className="text-sm text-slate-500 font-mono">
                                  {b.vehicle_number}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-sm text-slate-600">
                                  {b.service_type}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {b.scheduled_date}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {servicedBikes.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-slate-700 mb-4">
                          🏍️ Serviced Bikes ({servicedBikes.length})
                        </h3>

                        <div className="space-y-3">
                          {servicedBikes.map((b) => (
                            <div key={b.id} className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                              <div>
                                <p className="font-bold">{b.vehicle_model}</p>
                                <p className="text-sm text-slate-500 font-mono">
                                  {b.vehicle_number}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-sm text-slate-600">
                                  {b.service_type}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {b.scheduled_date}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <section>
                <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
                  <h1 className="text-4xl font-extrabold tracking-tighter">
                    My Bookings
                  </h1>

                  {!bookingsLoading && bookings.length > 0 && (
                    <button
                      onClick={handleClearAllBookings}
                      disabled={clearingAllBookings}
                      className="text-red-600 border border-red-200 hover:bg-red-50 px-5 py-2.5 rounded-full text-sm font-bold transition disabled:opacity-50"
                    >
                      {clearingAllBookings ? "Clearing..." : "🗑️ Clear All History"}
                    </button>
                  )}
                </div>

                {bookingsLoading && (
                  <div className="text-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Loading bookings...</p>
                  </div>
                )}

                {!bookingsLoading && bookings.length === 0 && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                    <div className="text-6xl mb-6">📋</div>
                    <h2 className="text-2xl font-bold mb-4">No Bookings Yet</h2>
                    <p className="text-slate-500 mb-8">
                      You haven&apos;t booked any services yet.
                    </p>

                    <button
                      onClick={() => router.push("/book")}
                      className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition"
                    >
                      Book Your First Service
                    </button>
                  </div>
                )}

                {!bookingsLoading && bookings.length > 0 && (
                  <div className="space-y-6">
                    {bookings.map((b) => (
                      <div key={b.id} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {b.vehicle_type === "car" ? "🚗" : "🏍️"}
                              </span>

                              <div>
                                <h3 className="text-xl font-bold">
                                  {b.vehicle_model}
                                </h3>
                                <p className="text-slate-500 text-sm font-mono">
                                  {b.vehicle_number}
                                </p>
                              </div>
                            </div>

                            <div className="text-slate-600">
                              <p>
                                <span className="font-semibold">Services:</span>{" "}
                                {b.service_type}
                              </p>
                              <p>
                                <span className="font-semibold">Date:</span>{" "}
                                {b.scheduled_date} at {b.scheduled_time}
                              </p>
                              <p>
                                <span className="font-semibold">Delivery:</span>{" "}
                                {b.delivery_type}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-start lg:items-end gap-3">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${getStatusColor(b.status)}`}>
                              {b.status || "pending"}
                            </span>

                            <span className="text-slate-400 text-sm">
                              Booked on {new Date(b.created_at).toLocaleDateString()}
                            </span>

                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              disabled={deletingBookingId === b.id}
                              className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50"
                            >
                              {deletingBookingId === b.id ? "Deleting..." : "🗑️ Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "pricing" && <PricingContent />}
            {activeTab === "contact" && <ContactContent />}
            {activeTab === "terms" && <TermsContent />}
            {activeTab === "faqs" && <FAQContent />}
          </main>
        )}
      </div>
    </div>
  );
}