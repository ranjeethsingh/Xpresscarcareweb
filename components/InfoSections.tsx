"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import StoreMap from "./StoreMap";

// ==========================================
// SVGS FOR SUPER SAVER VEHICLE PACKAGES
// ==========================================

const HatchbackSVG = () => (
  <svg viewBox="0 0 300 130" className="w-full h-24 text-slate-900" fill="currentColor">
    <path d="M15,95 L25,95 C25,83 37,73 50,73 C63,73 75,83 75,95 L215,95 C215,83 227,73 240,73 C253,73 265,83 265,95 L285,95 C292,95 295,90 295,83 C295,73 285,55 270,45 C255,35 220,33 190,33 C160,33 130,23 100,23 C85,23 55,35 40,48 C25,60 15,80 15,95 Z" />
    <path d="M102,28 C128,28 155,37 182,37 L182,58 L102,58 Z" fill="white" opacity="0.15" />
    <path d="M92,29 C78,39 52,50 42,58 L86,58 L86,29 Z" fill="white" opacity="0.15" />
    <circle cx="50" cy="95" r="16" fill="#1e293b" />
    <circle cx="50" cy="95" r="7" fill="#f1f5f9" />
    <circle cx="240" cy="95" r="16" fill="#1e293b" />
    <circle cx="240" cy="95" r="7" fill="#f1f5f9" />
  </svg>
);

const SedanSVG = () => (
  <svg viewBox="0 0 300 120" className="w-full h-24 text-slate-900" fill="currentColor">
    <path d="M10,90 L25,90 C25,78 37,68 50,68 C63,68 75,78 75,90 L215,90 C215,78 227,68 240,68 C253,68 265,78 265,90 L285,90 C293,90 295,84 295,78 C290,65 275,55 250,55 C230,55 195,33 165,33 C135,33 105,33 90,40 C70,48 45,62 25,65 C15,67 10,78 10,90 Z" />
    <path d="M102,38 C125,38 150,38 172,38 L172,58 L102,58 Z" fill="white" opacity="0.15" />
    <path d="M88,41 C76,46 58,54 48,58 L82,58 L82,41 Z" fill="white" opacity="0.15" />
    <circle cx="50" cy="90" r="16" fill="#1e293b" />
    <circle cx="50" cy="90" r="7" fill="#f1f5f9" />
    <circle cx="240" cy="90" r="16" fill="#1e293b" />
    <circle cx="240" cy="90" r="7" fill="#f1f5f9" />
  </svg>
);

const SuvSVG = () => (
  <svg viewBox="0 0 300 120" className="w-full h-24 text-slate-900" fill="currentColor">
    <path d="M10,90 L25,90 C25,78 37,68 50,68 C63,68 75,78 75,90 L215,90 C215,78 227,68 240,68 C253,68 265,78 265,90 L285,90 C293,90 295,84 295,75 L288,52 C285,45 275,40 255,40 L210,40 C190,40 160,28 130,28 C100,28 75,35 55,48 C35,58 15,68 10,90 Z" />
    <path d="M110,33 C135,33 165,33 192,33 L192,54 L110,54 Z" fill="white" opacity="0.15" />
    <path d="M95,35 C82,41 68,48 58,54 L90,54 L90,35 Z" fill="white" opacity="0.15" />
    <circle cx="50" cy="90" r="17" fill="#1e293b" />
    <circle cx="50" cy="90" r="7" fill="#f1f5f9" />
    <circle cx="240" cy="90" r="17" fill="#1e293b" />
    <circle cx="240" cy="90" r="7" fill="#f1f5f9" />
  </svg>
);

// ==========================================
// 1. SERVICE AREAS CONTENT
// ==========================================

export const ServiceAreasContent: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Our Service Areas</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          We proudly operate from our primary service hub in Gajularamaram, Hyderabad. Visit us for high-quality vehicle detailing and mechanical support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            Services Available at Gajularamaram
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-blue-600 text-sm tracking-wide uppercase">Car Wash</h4>
              <p className="text-slate-600 text-sm mt-1">Exterior Wash, Interior Cleaning, Foam Wash, Pressure Wash, Waterless Wash</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 text-sm tracking-wide uppercase">Detailing</h4>
              <p className="text-slate-600 text-sm mt-1">Interior Detailing, Exterior Detailing, Paint Decontamination, Ceramic Coating, Paint Protection (PPF), Headlight Restoration</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 text-sm tracking-wide uppercase">Garage Services</h4>
              <p className="text-slate-600 text-sm mt-1">General Service, Engine Diagnostics, Brake Service, Suspension Repairs, AC Service, Battery Replacement, Oil Change, Wheel Alignment & Balancing, Tyre Services</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 text-sm tracking-wide uppercase">Convenience Services</h4>
              <p className="text-slate-600 text-sm mt-1">Doorstep Car Wash (selected areas), Pickup & Drop Facility, Fleet Services, Corporate Car Care, Emergency Assistance, Mobile Service Availability</p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-xl">
            <h5 className="font-bold text-blue-900 text-sm mb-1">Doorstep Car Wash Policy</h5>
            <p className="text-blue-700 text-xs leading-relaxed">
              Doorstep cleaning availability is subject to schedule slots, precise distance from our Gajularamaram outlet, and vehicle accessibility requirements.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <StoreMap />
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900">Why Choose Xpress Car Care?</h4>
            <ul className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-600">
              <li className="flex items-center gap-2">🟢 Professional Technicians</li>
              <li className="flex items-center gap-2">🟢 Premium Brand Products</li>
              <li className="flex items-center gap-2">🟢 Transparent Upfront Pricing</li>
              <li className="flex items-center gap-2">🟢 Simple Digital Booking</li>
              <li className="flex items-center gap-2">🟢 Timely Service Execution</li>
              <li className="flex items-center gap-2">🟢 Genuine Spare Parts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. PRICING CONTENT (Super Saver Redesign)
// ==========================================

export const PricingContent: React.FC = () => {
  const router = useRouter();

  const superSaverFeatures = [
    "Engine Oil Replacement",
    "Oil Filter Replacement",
    "Air Filter Service/Replacement",
    "Coolant Top Up",
    "Brake Oil & Power Steering Oil Top Up",
    "Brakes Check up",
    "Suspensions Check Up",
    "Lights Checkup",
    "25 Points complete car check up",
  ];

  const packages = [
    {
      id: "package-hatchback",
      title: "Hatchback Package",
      price: "3999",
      illustration: <HatchbackSVG />,
      isPopular: false,
    },
    {
      id: "package-sedan",
      title: "Sedan Package",
      price: "4499",
      illustration: <SedanSVG />,
      isPopular: true,
    },
    {
      id: "package-suv",
      title: "SUV & Luxury Package",
      price: "5999",
      illustration: <SuvSVG />,
      isPopular: false,
    },
  ];

  const handleGetStarted = (pkg: typeof packages[0]) => {
    const bookingPayload = {
      vehicle_type: "car",
      service_type: `Super Saver ${pkg.title} (₹${pkg.price})`,
      notes: "Selected from Super Saver packages.",
    };
    localStorage.setItem("xpress_booking", JSON.stringify(bookingPayload));
    router.push("/");
  };

  return (
    <div className="space-y-16">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
          Super Saver Plans
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Periodic Car Service Packages
        </h2>
        <p className="text-slate-600 text-sm md:text-base">
          Get transparent, OEM-grade periodic car servicing. Choose your vehicle class and unlock high-quality maintenance.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto px-2">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative flex flex-col justify-between rounded-3xl transition-all duration-300 bg-white p-8 ${
              pkg.isPopular
                ? "ring-2 ring-blue-600 shadow-2xl md:-translate-y-4 z-10"
                : "border border-slate-100 shadow-md hover:shadow-xl"
            }`}
          >
            {pkg.isPopular && (
              <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Most Popular
              </span>
            )}

            <div className="space-y-6">
              {/* Image Illustration */}
              <div className="flex items-center justify-center py-4 bg-slate-50/50 rounded-2xl h-36">
                <div className="w-56 transition-transform duration-300 hover:scale-105">
                  {pkg.illustration}
                </div>
              </div>

              {/* Pricing */}
              <div className="text-center space-y-1">
                <div className="text-4xl font-black text-blue-600 tracking-tight">
                  ₹{pkg.price}
                </div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                  *Starts from
                </div>
              </div>

              <div className="border-t border-slate-100 w-full pt-4"></div>

              {/* Features List */}
              <ul className="space-y-3">
                {superSaverFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start justify-between text-sm text-slate-600">
                    <span className="font-medium pr-2 text-slate-700 leading-snug">{feature}</span>
                    <span className="text-blue-600 mt-0.5 shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 stroke-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Book Trigger */}
            <div className="pt-8">
              <button
                onClick={() => handleGetStarted(pkg)}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 ${
                  pkg.isPopular
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-98"
                    : "border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50 active:scale-98"
                }`}
              >
                Get Started
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Grid Section for General Services */}
      <div className="border-t border-slate-100 pt-16 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-slate-900">General Services Starting Rates</h3>
          <p className="text-slate-600 text-sm">Need a quick wash, basic check, or express detailing? See our primary catalog.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-800 text-base">🚗 Eco Car Wash</h4>
            <p className="text-xs text-slate-500">Fast exterior pressure foaming, clean tires, and basic dashboard dust removal.</p>
            <div className="text-xl font-bold text-blue-600">Starts @ ₹349</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-800 text-base">✨ Premium Detail</h4>
            <p className="text-xs text-slate-500">Dual-action paint polish, interior deep vacuum extraction, dashboard wax protectant treatment.</p>
            <div className="text-xl font-bold text-blue-600">Starts @ ₹1,999</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-800 text-base">🏍️ Bike Care</h4>
            <p className="text-xs text-slate-500">Thorough body wash, chain lubrication and tension adjustment, and full mechanical point checks.</p>
            <div className="text-xl font-bold text-blue-600">Starts @ ₹199</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-800 text-base">🔧 Custom Garage</h4>
            <p className="text-xs text-slate-500">Custom diagnostics, complete brake checks, oil servicing, suspension and mechanical fixes.</p>
            <div className="text-xl font-bold text-blue-600">On Inspection</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. FAQ CONTENT
// ==========================================

export const FAQContent: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I book an appointment?",
      a: "You can book directly from our homepage! Select your vehicle type, choose your service and preferred delivery type (Self Drive-In or Pickup), enter your details, and submit. We will verify and lock in your service instantly.",
    },
    {
      q: "How long does a general service take?",
      a: "A regular eco car wash takes about 30 to 45 minutes. Super Saver periodic maintenance plans or custom garage services typically take 3 to 5 hours, depending on current floor occupancy and parts availability.",
    },
    {
      q: "Is pickup and drop facility available?",
      a: "Yes! We offer convenient vehicle pickup and drop options across various neighborhoods near Gajularamaram. You can configure your pickup settings directly during your booking flow.",
    },
    {
      q: "What payment methods are supported?",
      a: "We support cash, major UPI apps (GPay, PhonePe, Paytm), and direct card swiping at our storefront counter during pickup.",
    },
    {
      q: "What brand of products do you use?",
      a: "We use top-grade, industry-standard car care products including premium wash soaps, microfiber towels, and synthetic engine oils matching OEM requirements.",
    },
    {
      q: "Do I need to sign up to book a service?",
      a: "No! Guest booking is fully supported. However, creating a free account allows you to securely save your vehicles, track service history, and access quick invoice downloads.",
    },
    {
      q: "Do you service electric vehicles (EVs) and premium models?",
      a: "Yes! Our technicians are professionally trained to service all categories including Electric Vehicles, luxury sedans, hatchbacks, and performance bikes.",
    },
    {
      q: "What if I am not satisfied with the wash?",
      a: "Customer happiness is our primary focus. If you notice any missed spots or are unhappy with the output, point it out immediately to our manager or write to us, and we will happily resolve it.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
        <p className="text-slate-600">Everything you need to know about our vehicle repair and detailing workflows.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex justify-between items-center p-5 text-left text-slate-800 font-bold hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <span className={`text-blue-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-50 bg-slate-50/20">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 4. CONTACT CONTENT
// ==========================================

export const ContactContent: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Get in Touch</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Reach out directly to our management team or navigate to our store location for fast support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Direct Contact Numbers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Ajay Singh</p>
                <a href="tel:9494494671" className="text-lg font-bold text-blue-600 hover:underline">
                  94944 94671
                </a>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Munna Singh</p>
                <a href="tel:9849969073" className="text-lg font-bold text-blue-600 hover:underline">
                  98499 69073
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Email & Web Support</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-bold text-slate-700">Official Email:</span>{" "}
                <a href="mailto:xpresscarcare26@gmail.com" className="text-blue-600 hover:underline">
                  xpresscarcare26@gmail.com
                </a>
              </p>
              <p>
                <span className="font-bold text-slate-700">Website URL:</span>{" "}
                <a href="https://Xpresscarcare.online" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Xpresscarcare.online
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <StoreMap />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. CAREERS CONTENT
// ==========================================

export const CareersContent: React.FC = () => {
  const openings = [
    {
      title: "Car Wash Technician",
      type: "Full-Time",
      desc: "Perform high-pressure exterior washing, clean interior upholstery, and detail glass components diligently.",
    },
    {
      title: "Car Detailer",
      type: "Full-Time",
      desc: "Apply paint restoration finishes, professional rubbing polishes, ceramic coatings, and wrap protectant layers.",
    },
    {
      title: "Automotive Mechanic",
      type: "Full-Time",
      desc: "Identify mechanical engine/brake issues, general oils change, suspension adjustments, and air conditioning diagnostics.",
    },
    {
      title: "Service Advisor",
      type: "Full-Time",
      desc: "Greet client drive-ins, prepare repair job cards, suggest repair options, and update overall delivery pipelines.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Join Our Team</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Love automobiles? Work with a modern car and bike workshop setting in Hyderabad and grow your career with experts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {openings.map((job, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-extrabold text-slate-800 text-lg">{job.title}</h3>
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {job.type}
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{job.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-8 text-center space-y-6">
        <h3 className="text-xl font-bold">Ready to Start Your Journey?</h3>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          If you hold a valid driver's license, have relevant mechanic or detailing experience, send your resume to our hr panel directly.
        </p>
        <div>
          <a
            href="mailto:xpresscarcare26@gmail.com"
            className="inline-block bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold text-sm px-8 py-3 rounded-xl uppercase tracking-wider"
          >
            Email Resume
          </a>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. TERMS & CONDITIONS CONTENT
// ==========================================

export const TermsContent: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-8 text-slate-700">
      <div className="space-y-2 border-b border-slate-100 pb-6 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Terms & Conditions</h2>
        <p className="text-slate-500 text-sm">Last updated: July 2026</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h3 className="font-extrabold text-slate-900 text-base">1. Agreement to Terms</h3>
          <p>By booking a service on Xpress Car Care, you agree to comply with our workshop operations guidelines. All online booking details reflect actual service slot registrations.</p>
        </section>

        <section className="space-y-2">
          <h3 className="font-extrabold text-slate-900 text-base">2. Vehicle Condition & Belongings</h3>
          <p>Clients must remove all personal belongings, cash, and luxury gadgets from the vehicle before handing it over for detailing or wash services. Xpress Car Care is not responsible for lost personal assets inside the vehicle.</p>
        </section>

        <section className="space-y-2">
          <h3 className="font-extrabold text-slate-900 text-base">3. Disclaimer on Paint Wraps & Pre-existing Damage</h3>
          <p>Xpress Car Care washes and details vehicles utilizing high-pressure jets and industry formulations. We are not liable for lifting old or loose paint films, third-party wraps, custom decals, or pre-existing structural issues.</p>
        </section>

        <section className="space-y-2">
          <h3 className="font-extrabold text-slate-900 text-base">4. Delivery Delays & Cancellations</h3>
          <p>We work to deliver all washed and repaired vehicles on time. Delays caused due to complex diagnostic steps, delayed parts procurement, power failures, or extreme weather are handled transparently. Booking slots can be rescheduled or cancelled freely without penalties.</p>
        </section>

        <section className="space-y-2">
          <h3 className="font-extrabold text-slate-900 text-base">5. Service Warranty</h3>
          <p>Our general oil changes and diagnostic services come with a limited satisfaction guarantee. If any mechanical performance issues occur directly related to parts we installed, you may contact our management center within 7 days for verification and rework support.</p>
        </section>
      </div>
    </div>
  );
};