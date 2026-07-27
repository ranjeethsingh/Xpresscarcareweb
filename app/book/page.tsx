"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Helper to guarantee Razorpay checkout script is loaded into browser window dynamically
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface SelectedService {
  name: string;
  price: number;
  category: string;
}

interface ServiceItem {
  name: string;
  price: number;
  details?: string[];
}

interface ServiceGroup {
  id: string;
  category: string;
  subtitle: string;
  items: ServiceItem[];
}

const FULL_GENERAL_CHECKLIST = [
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

const BASIC_GENERAL_CHECKLIST = [
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

const PRICING_CATALOG: ServiceGroup[] = [
  {
    id: "general",
    category: "General Service Packages",
    subtitle: "💡 Tip: Choose either Full 14-Point (includes wash & alignment) or Basic 9-Point maintenance.",
    items: [
      {
        name: "Full General Service (14-Point Check & Wash)",
        price: 5500,
        details: FULL_GENERAL_CHECKLIST,
      },
      {
        name: "Basic General Service (9-Point Check, Excludes Wash/Alignment)",
        price: 4500,
        details: BASIC_GENERAL_CHECKLIST,
      },
    ],
  },
  {
    id: "wash",
    category: "Car Wash",
    subtitle: "💡 Tip: Select 1 wash option matching your vehicle size (e.g., Body Wash vs Foam Wash).",
    items: [
      { name: "Standard Body Wash (Hatchback/Sedan)", price: 300 },
      { name: "Foam Wash (Hatchback/Sedan)", price: 500 },
      { name: "Luxury Car Body Wash", price: 400 },
      { name: "Luxury Car Foam Wash", price: 600 },
      { name: "SUV (7-Seater) Body Wash", price: 700 },
    ],
  },
  {
    id: "detailing",
    category: "Interior Detailing & Teflon",
    subtitle: "💡 Tip: Pick an interior restoration or Teflon protective coating suited for your car type.",
    items: [
      { name: "Interior Detailing (Hatchback / Sedan)", price: 4000 },
      { name: "SUV (7-Seater) Interior Detailing", price: 2000 },
      { name: "Luxury Car Interior Cleaning", price: 2500 },
      { name: "Teflon Coating - Standard Cars", price: 3500 },
      { name: "Teflon Coating - SUV (7-Seater)", price: 4500 },
      { name: "Teflon Coating - Luxury Cars", price: 5000 },
    ],
  },
  {
    id: "wheel",
    category: "Wheel Care",
    subtitle: "💡 Tip: Alignment includes FREE Nitrogen air refill for all tires.",
    items: [
      { name: "Wheel Alignment & Balancing (Free Nitrogen)", price: 500 },
      { name: "Alloy Wheel Alignment & Balancing (Free Nitrogen)", price: 700 },
      { name: "Wheel Rotation", price: 200 },
    ],
  },
  {
    id: "combos",
    category: "Combo Packages",
    subtitle: "💡 Tip: Best value bundled offers combining wash and wheel alignment.",
    items: [
      { name: "Wheel Alignment & Balancing + Body Wash", price: 899 },
      { name: "SUV Wheel Alignment & Balancing + Body Wash", price: 1299 },
    ],
  },
  {
    id: "monthly",
    category: "Monthly Subscriptions",
    subtitle: "💡 Tip: Pre-pay for 4 washes and receive 1 wash completely FREE.",
    items: [
      { name: "4 Foam Washes + 1 FREE Foam Wash", price: 2000 },
      { name: "4 Body Washes + 1 FREE Body Wash", price: 1200 },
      { name: "SUV: 4 Foam Washes + 1 FREE Foam Wash", price: 2800 },
      { name: "SUV: 4 Body Washes + 1 FREE Body Wash", price: 1600 },
    ],
  },
];

const ALL_HOURLY_TIME_SLOTS = [
  { label: "8:00 AM", hour: 8 },
  { label: "9:00 AM", hour: 9 },
  { label: "10:00 AM", hour: 10 },
  { label: "11:00 AM", hour: 11 },
  { label: "12:00 PM", hour: 12 },
  { label: "1:00 PM", hour: 13 },
  { label: "2:00 PM", hour: 14 },
  { label: "3:00 PM", hour: 15 },
  { label: "4:00 PM", hour: 16 },
  { label: "5:00 PM", hour: 17 },
  { label: "6:00 PM", hour: 18 },
  { label: "7:00 PM", hour: 19 },
  { label: "8:00 PM", hour: 20 },
  { label: "9:00 PM", hour: 21 },
  { label: "10:00 PM", hour: 22 },
  { label: "11:00 PM", hour: 23 },
];

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const minDate = getTodayDateString();

  // Selected Services State
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Customer Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [vehicleType, setVehicleType] = useState<"car" | "bike">("car");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [deliveryType, setDeliveryType] = useState<"workshop" | "pickup" | "pickup_drop">("workshop");

  // Scheduling State
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [dropDate, setDropDate] = useState("");
  const [dropTime, setDropTime] = useState("5:00 PM");

  // Address State
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupLandmark, setPickupLandmark] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [dropLandmark, setDropLandmark] = useState("");
  const [sameAsPickup, setSameAsPickup] = useState(true);

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<"pay_later" | "razorpay">("razorpay");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingReference, setBookingReference] = useState<string>("");

  // Handle URL redirect category auto-scrolling
  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat && step === 1) {
      setTimeout(() => {
        const targetElement = document.getElementById(`category-${cat}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    }
  }, [searchParams, step]);

  const availableTimeSlots = useMemo(() => {
    const todayStr = getTodayDateString();
    if (scheduledDate === todayStr) {
      const currentHour = new Date().getHours();
      return ALL_HOURLY_TIME_SLOTS.filter((slot) => slot.hour > currentHour);
    }
    return ALL_HOURLY_TIME_SLOTS;
  }, [scheduledDate]);

  useEffect(() => {
    if (availableTimeSlots.length > 0) {
      const exists = availableTimeSlots.some((s) => s.label === scheduledTime);
      if (!exists) setScheduledTime(availableTimeSlots[0].label);
    } else {
      setScheduledTime("");
    }
  }, [availableTimeSlots]);

  useEffect(() => {
    if (sameAsPickup) {
      setDropAddress(pickupAddress);
      setDropLandmark(pickupLandmark);
    }
  }, [sameAsPickup, pickupAddress, pickupLandmark]);

  useEffect(() => {
    try {
      const user = localStorage.getItem("xpress_user");
      if (user) {
        const u = JSON.parse(user);
        if (u.name) setCustomerName(u.name);
        if (u.phone) setCustomerPhone(u.phone);
        if (u.address) setPickupAddress(u.address);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const totalAmount = selectedServices.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = Math.round((totalAmount * discountPercent) / 100);
  const finalTotalAmount = totalAmount - discountAmount;

  const toggleService = (name: string, price: number, category: string) => {
    if (selectedServices.some((s) => s.name === name)) {
      setSelectedServices(selectedServices.filter((s) => s.name !== name));
    } else {
      setSelectedServices([...selectedServices, { name, price, category }]);
    }
  };

  const toggleDropdown = (e: React.MouseEvent, itemName: string) => {
    e.stopPropagation();
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const getDeliveryLabel = (type: string) => {
    switch (type) {
      case "pickup":
        return "Doorstep Pickup";
      case "pickup_drop":
        return "Doorstep Pickup & Drop";
      case "workshop":
      default:
        return "Workshop Visit";
    }
  };

  const openDatePicker = (inputId: string) => {
    const inputEl = document.getElementById(inputId) as HTMLInputElement | null;
    if (inputEl) {
      try {
        if (typeof inputEl.showPicker === "function") {
          inputEl.showPicker();
        } else {
          inputEl.focus();
        }
      } catch (e) {
        inputEl.focus();
      }
    }
  };

  // Verify and Apply Loyalty Coupon Code "LOYAL"
  const handleApplyCoupon = async () => {
    setCouponMessage(null);
    const code = couponInput.trim().toUpperCase();

    if (code !== "LOYAL") {
      setDiscountPercent(0);
      setCouponMessage({ type: "error", text: "Invalid coupon code." });
      return;
    }

    if (!customerPhone) {
      setCouponMessage({ type: "error", text: "Please enter a valid phone number in Step 2." });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("id")
        .eq("customer_phone", customerPhone);

      if (error) throw error;

      if (data && data.length >= 1) {
        setDiscountPercent(5);
        setCouponMessage({
          type: "success",
          text: "🎉 'LOYAL' applied! 5% discount granted for returning customer.",
        });
      } else {
        setDiscountPercent(0);
        setCouponMessage({
          type: "error",
          text: "Coupon 'LOYAL' is reserved for returning customers (minimum 1 prior booking).",
        });
      }
    } catch (err) {
      console.error(err);
      setCouponMessage({ type: "error", text: "Error verifying coupon eligibility." });
    }
  };

  const saveBookingToSupabase = async (
    refId: string,
    paymentStatus: string,
    amountCharged: number
  ) => {
    const serviceNames = selectedServices.map((s) => s.name).join(", ");
    const combinedAddressDetails =
      deliveryType === "workshop"
        ? "Workshop Visit (Gajularamaram)"
        : deliveryType === "pickup"
        ? `Pickup: ${pickupAddress} (Landmark: ${pickupLandmark || "N/A"})`
        : `Pickup: ${pickupAddress} (LM: ${pickupLandmark || "N/A"}) | Drop: ${dropAddress} (LM: ${dropLandmark || "N/A"}) [Drop Date: ${dropDate} @ ${dropTime}]`;

    const { error } = await supabase.from("bookings").insert([
      {
        customer_name: customerName,
        customer_phone: customerPhone,
        vehicle_type: vehicleType,
        vehicle_model: vehicleModel,
        vehicle_number: vehicleNumber.toUpperCase(),
        service_type: serviceNames,
        delivery_type: getDeliveryLabel(deliveryType),
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        address: combinedAddressDetails,
        status: "pending", // booking acceptance state — admin controls this, always starts pending
        payment_status: paymentStatus, // separate concern — how/whether they've paid
        amount_charged: amountCharged,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Supabase Insertion Error:", error.message);
      throw error;
    }
  };

  const handleBookingSubmit = async () => {
    if (!customerName || !customerPhone || !vehicleModel || !vehicleNumber || !scheduledDate || !scheduledTime) {
      alert("Please complete all required fields.");
      return;
    }

    if ((deliveryType === "pickup" || deliveryType === "pickup_drop") && !pickupAddress.trim()) {
      alert("Please enter your doorstep pickup address.");
      return;
    }

    if (deliveryType === "pickup_drop" && !dropDate) {
      alert("Please select your preferred return/drop date.");
      return;
    }

    setIsSubmitting(true);
    const refId = `XPRESS-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      if (paymentMethod === "pay_later") {
        await saveBookingToSupabase(
          refId,
          "Pending Payment (Pay After Service)",
          finalTotalAmount
        );
        setBookingReference(refId);
        setStep(4);
        setIsSubmitting(false);
        return;
      }

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        setIsSubmitting(false);
        return;
      }

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalTotalAmount }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert(`Order creation failed: ${orderData.error}`);
        setIsSubmitting(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Xpress Car Care",
        description: `Service Booking for ${vehicleModel}`,
        order_id: orderData.order_id,
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI QR / GPay / PhonePe",
                instruments: [
                  {
                    method: "upi",
                  },
                ],
              },
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              await saveBookingToSupabase(
                refId,
                `Paid Online (Razorpay ID: ${response.razorpay_payment_id})`,
                finalTotalAmount
              );
              setBookingReference(refId);
              setStep(4);
            } else {
              alert("Payment verification failed! Signature mismatch.");
            }
          } catch (e: any) {
            console.error("Error during payment handling:", e);
            alert("An error occurred while confirming your payment.");
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: customerName,
          contact: customerPhone,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
        setIsSubmitting(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error("Booking submission error:", err);
      alert(`Booking Error: ${err?.message || "Check developer console (F12) for details"}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans py-12 px-6">
      {/* CSS overlay injection ensuring 100% full-box clickable area for date inputs */}
      <style>{`
        .full-click-date::-webkit-calendar-picker-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-slate-400 hover:text-white font-bold text-sm">
            ← Back to Home
          </Link>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Step {step} of 4
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full mb-10 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* STEP 1: SELECT SERVICES */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8 space-y-2">
              <h1 className="text-3xl md:text-5xl font-black">Select Your Services</h1>
              <p className="text-slate-400 text-sm md:text-base">
                Customize your service package below.
              </p>
            </div>

            <div className="bg-blue-950/60 border border-blue-800/80 rounded-2xl p-4 mb-8 text-blue-200 text-xs md:text-sm flex items-start gap-3">
              <span className="text-xl">ℹ️</span>
              <div>
                <span className="font-bold text-white block mb-0.5">Selection Guide:</span>
                Usually, you only need to select <span className="underline decoration-blue-400 font-semibold">one option per category</span>.
              </div>
            </div>

            <div className="space-y-8">
              {PRICING_CATALOG.map((group) => (
                <div 
                  key={group.category} 
                  id={`category-${group.id}`} 
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 scroll-mt-24"
                >
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-blue-400">{group.category}</h2>
                    <p className="text-slate-400 text-xs mt-1 font-medium">{group.subtitle}</p>
                  </div>

                  <div className="grid gap-3">
                    {group.items.map((item) => {
                      const isSelected = selectedServices.some((s) => s.name === item.name);
                      const isExpanded = expandedItems[item.name];

                      return (
                        <div
                          key={item.name}
                          className={`rounded-2xl border transition-all overflow-hidden ${
                            isSelected
                              ? "bg-blue-600/10 border-blue-500"
                              : "bg-slate-800/60 border-slate-700/60 hover:border-slate-600"
                          }`}
                        >
                          <div
                            onClick={() => toggleService(item.name, item.price, group.category)}
                            className="p-4 flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                              />
                              <div>
                                <span className="font-semibold text-sm md:text-base text-white block">
                                  {item.name}
                                </span>
                                {item.details && (
                                  <button
                                    type="button"
                                    onClick={(e) => toggleDropdown(e, item.name)}
                                    className="text-xs font-bold text-blue-400 hover:text-blue-300 mt-1 inline-flex items-center gap-1"
                                  >
                                    {isExpanded ? "Hide Included Checklists ▲" : "View Included Checklists ▼"}
                                  </button>
                                )}
                              </div>
                            </div>
                            <span className="font-black text-blue-400 text-lg">
                              ₹ {item.price.toLocaleString()}
                            </span>
                          </div>

                          {item.details && isExpanded && (
                            <div className="bg-slate-900/90 border-t border-slate-800 p-4 px-6 text-sm text-slate-300 space-y-2">
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Package Inspection Points:
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {item.details.map((pt, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="text-blue-400 font-bold">✓</span>
                                    <span>{pt}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-6 mt-8 bg-blue-600 text-white p-6 rounded-3xl flex items-center justify-between shadow-2xl">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider opacity-80">
                  Selected ({selectedServices.length})
                </span>
                <div className="text-3xl font-black">₹ {totalAmount.toLocaleString()}</div>
              </div>

              <button
                disabled={selectedServices.length === 0}
                onClick={() => setStep(2)}
                className="bg-white text-blue-600 font-extrabold px-8 py-4 rounded-2xl hover:bg-slate-100 transition disabled:opacity-40"
              >
                Continue to Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CUSTOMER & VEHICLE DETAILS */}
        {step === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <h2 className="text-3xl font-black mb-6">Customer & Vehicle Details</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="9876543210"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Vehicle Type</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setVehicleType("car")}
                    className={`flex-1 py-3 rounded-xl font-bold border transition ${
                      vehicleType === "car" ? "border-blue-500 bg-blue-600/20 text-white" : "border-slate-700 bg-slate-800 text-slate-400"
                    }`}
                  >
                    🚗 Car
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleType("bike")}
                    className={`flex-1 py-3 rounded-xl font-bold border transition ${
                      vehicleType === "bike" ? "border-blue-500 bg-blue-600/20 text-white" : "border-slate-700 bg-slate-800 text-slate-400"
                    }`}
                  >
                    🏍️ Bike
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Vehicle Model *</label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. Swift, Honda City"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Registration Number *</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="TS09AB1234"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* 100% CLICKABLE DATE CONTAINER */}
              <div className="space-y-2">
                <label 
                  onClick={() => openDatePicker("scheduledDateInput")}
                  className="block text-sm font-semibold text-slate-400 cursor-pointer hover:text-blue-400 transition-colors"
                >
                  Preferred Service / Pickup Date *
                </label>

                <div 
                  onClick={() => openDatePicker("scheduledDateInput")}
                  className="relative w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <span className={`text-base font-medium ${scheduledDate ? "text-white" : "text-slate-400"}`}>
                    {scheduledDate || "Select a date"}
                  </span>

                  <span className="text-slate-400 pointer-events-none">📅</span>

                  <input
                    id="scheduledDateInput"
                    type="date"
                    min={minDate}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    style={{ colorScheme: "dark" }}
                    className="full-click-date absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">Service Preference *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType("workshop")}
                  className={`p-4 rounded-2xl font-bold border text-xs md:text-sm transition flex flex-col items-center gap-2 ${
                    deliveryType === "workshop"
                      ? "border-blue-500 bg-blue-600/20 text-white shadow-lg shadow-blue-500/10"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span>🏬 Workshop Visit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType("pickup")}
                  className={`p-4 rounded-2xl font-bold border text-xs md:text-sm transition flex flex-col items-center gap-2 ${
                    deliveryType === "pickup"
                      ? "border-blue-500 bg-blue-600/20 text-white shadow-lg shadow-blue-500/10"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span>🚗 Doorstep Pickup</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType("pickup_drop")}
                  className={`p-4 rounded-2xl font-bold border text-xs md:text-sm transition flex flex-col items-center gap-2 ${
                    deliveryType === "pickup_drop"
                      ? "border-blue-500 bg-blue-600/20 text-white shadow-lg shadow-blue-500/10"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span>🔄 Doorstep Pickup & Drop</span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Preferred Pickup Time Slot *
                </label>
                {availableTimeSlots.length > 0 ? (
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white font-medium cursor-pointer"
                  >
                    {availableTimeSlots.map((slot) => (
                      <option key={slot.label} value={slot.label}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs font-semibold">
                    ⚠️ No remaining time slots today. Please select a future date.
                  </div>
                )}
              </div>
            </div>

            {(deliveryType === "pickup" || deliveryType === "pickup_drop") && (
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
                <h3 className="text-lg font-bold text-blue-400">📍 Pickup Address Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Pickup Address *
                    </label>
                    <textarea
                      rows={2}
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="House/Plot No, Building, Street..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 resize-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Pickup Landmark
                    </label>
                    <input
                      type="text"
                      value={pickupLandmark}
                      onChange={(e) => setPickupLandmark(e.target.value)}
                      placeholder="e.g. Near Metro Station"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white"
                    />
                  </div>
                </div>

                {deliveryType === "pickup_drop" && (
                  <div className="border-t border-slate-700/80 pt-5 space-y-5">
                    <h3 className="text-lg font-bold text-emerald-400">🔄 Return / Drop-Off Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* 100% CLICKABLE RETURN DROP DATE CONTAINER */}
                      <div className="space-y-1.5">
                        <label 
                          onClick={() => openDatePicker("dropDateInput")}
                          className="block text-xs font-semibold text-slate-400 cursor-pointer hover:text-emerald-400 transition-colors"
                        >
                          Preferred Drop Date *
                        </label>

                        <div 
                          onClick={() => openDatePicker("dropDateInput")}
                          className="relative w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-colors text-sm"
                        >
                          <span className={dropDate ? "text-white" : "text-slate-400"}>
                            {dropDate || "Select a date"}
                          </span>

                          <span className="text-slate-400 pointer-events-none">📅</span>

                          <input
                            id="dropDateInput"
                            type="date"
                            min={scheduledDate || minDate}
                            value={dropDate}
                            onChange={(e) => setDropDate(e.target.value)}
                            onClick={(e) => e.currentTarget.showPicker?.()}
                            style={{ colorScheme: "dark" }}
                            className="full-click-date absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                          Preferred Drop Time Slot *
                        </label>
                        <select
                          value={dropTime}
                          onChange={(e) => setDropTime(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 text-white cursor-pointer"
                        >
                          {ALL_HOURLY_TIME_SLOTS.map((s) => (
                            <option key={`drop-${s.label}`} value={s.label}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 border border-slate-700 py-4 rounded-xl font-bold hover:bg-slate-800 transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!customerName || !customerPhone || !vehicleModel || !vehicleNumber || !scheduledDate || !scheduledTime) {
                    alert("Please fill in all mandatory fields (*)");
                    return;
                  }
                  if ((deliveryType === "pickup" || deliveryType === "pickup_drop") && !pickupAddress.trim()) {
                    alert("Please enter your doorstep pickup address.");
                    return;
                  }
                  if (deliveryType === "pickup_drop" && !dropDate) {
                    alert("Please select your preferred return/drop date.");
                    return;
                  }
                  setStep(3);
                }}
                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition shadow-lg shadow-blue-600/30"
              >
                Proceed to Payment →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT METHOD & LOYALTY COUPON */}
        {step === 3 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <h2 className="text-3xl font-black mb-2">Select Payment Method</h2>
            <p className="text-slate-400 text-sm">Choose how you wish to complete your booking payment.</p>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-3">
              <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider">Order Summary</h3>
              {selectedServices.map((s) => (
                <div key={s.name} className="flex justify-between text-sm">
                  <span className="text-slate-300">{s.name}</span>
                  <span className="font-mono text-white">₹ {s.price.toLocaleString()}</span>
                </div>
              ))}

              {discountPercent > 0 && (
                <div className="flex justify-between text-sm text-emerald-400 font-bold border-t border-slate-700/60 pt-2">
                  <span>Loyalty Discount ({discountPercent}%)</span>
                  <span>- ₹ {discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-slate-700 pt-3 flex justify-between items-center text-lg font-black">
                <span>Total Amount</span>
                <span className="text-blue-400">₹ {finalTotalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Loyalty Coupon Box */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                🏷️ Have a Coupon Code?
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code (e.g. LOYAL)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm uppercase font-mono tracking-wider outline-none focus:border-blue-500 text-white"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-md"
                >
                  Apply Code
                </button>
              </div>

              {couponMessage && (
                <p className={`text-xs font-semibold ${couponMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <label
                onClick={() => setPaymentMethod("razorpay")}
                className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === "razorpay"
                    ? "bg-blue-600/20 border-blue-500 text-white"
                    : "bg-slate-800/60 border-slate-700 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>Pay Online via Razorpay</span>
                      <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase">
                        Instant
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Supports UPI (GPay, PhonePe, Paytm), Cards & Net Banking.
                    </div>
                  </div>
                </div>
                <span className="text-xl">💳</span>
              </label>

              <label
                onClick={() => setPaymentMethod("pay_later")}
                className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === "pay_later"
                    ? "bg-blue-600/20 border-blue-500 text-white"
                    : "bg-slate-800/60 border-slate-700 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "pay_later"}
                    onChange={() => setPaymentMethod("pay_later")}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <div>
                    <div className="font-bold text-white">Pay After Service (Cash / UPI)</div>
                    <div className="text-xs text-slate-400">Pay at workshop or to driver upon completion.</div>
                  </div>
                </div>
                <span className="text-xl">💵</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 border border-slate-700 py-4 rounded-xl font-bold hover:bg-slate-800 transition"
              >
                ← Back
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleBookingSubmit}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-extrabold transition shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {isSubmitting
                  ? "Processing..."
                  : paymentMethod === "razorpay"
                  ? `Pay ₹${finalTotalAmount.toLocaleString()} & Confirm ✓`
                  : "Confirm & Complete Booking ✓"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMATION */}
        {step === 4 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto border-2 border-emerald-500">
              ✓
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-white">Booking Confirmed!</h2>
              <p className="text-slate-400 text-sm">
                Thank you, <span className="text-white font-bold">{customerName}</span>. Your service has been scheduled.
              </p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-left max-w-lg mx-auto space-y-3">
              <div className="flex justify-between border-b border-slate-700 pb-3">
                <span className="text-slate-400 text-sm">Booking ID</span>
                <span className="font-mono font-bold text-blue-400">{bookingReference}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Vehicle</span>
                <span className="font-semibold text-white">{vehicleModel} ({vehicleNumber})</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Service Date & Time</span>
                <span className="font-semibold text-white">{scheduledDate} @ {scheduledTime}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Service Preference</span>
                <span className="font-semibold text-white">{getDeliveryLabel(deliveryType)}</span>
              </div>

              {deliveryType === "pickup_drop" && dropDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Drop Date & Time</span>
                  <span className="font-semibold text-emerald-400">{dropDate} @ {dropTime}</span>
                </div>
              )}

              <div className="flex justify-between text-sm border-t border-slate-700 pt-3 font-bold">
                <span className="text-slate-300">Total Charged</span>
                <span className="text-emerald-400 text-lg">₹ {finalTotalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href={`https://wa.me/91${customerPhone}?text=${encodeURIComponent(
                  `Hello ${customerName}, thank you for booking a service with Xpress Car Care! Your Booking ID is ${bookingReference}. We will reach out shortly for confirmation.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl transition inline-flex items-center justify-center gap-2"
              >
                <span>Send confirmation on WhatsApp</span>
              </a>

              <Link
                href="/my-account"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition"
              >
                Go to My Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">Loading booking portal...</div>}>
      <BookingContent />
    </Suspense>
  );
}