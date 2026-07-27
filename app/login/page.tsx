"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import PasswordInput from "@/components/PasswordInput";
import { useAuth } from "@/context/AuthContext";

type Mode = "login" | "signup";
type Step = "form" | "otp" | "profile" | "forgot-request" | "forgot-otp" | "forgot-reset";
type OtpMethod = "phone" | "email";
type VehicleType = "car" | "bike" | "";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("form");
  const [otpMethod, setOtpMethod] = useState<OtpMethod>("phone");

  // Login fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Password fields are blank by default
  const [password, setPassword] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP
  const [otp, setOtp] = useState("");

  // Forgot password flow
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetProfileId, setResetProfileId] = useState<string | null>(null);

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");

  // Vehicle fields
  const [vehicleType, setVehicleType] = useState<VehicleType>("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRedirectMsg = error.includes("Redirecting") || error.includes("successful");

  const errorClass = isRedirectMsg
    ? "text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center font-medium"
    : "text-red-500";

  const isValidPhone = (num: string) => {
    return /^[6-9]\d{9}$/.test(num);
  };

  const cleanPhone = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 10);
  };

  const cleanVehicleReg = (value: string) => {
    return value.toUpperCase().replace(/\s/g, "");
  };

  const applyProfileToState = (profile: any) => {
    if (!profile) return;

    if (profile.phone) setPhone(profile.phone);
    if (profile.email) setEmail(profile.email);

    if (profile.first_name) {
      setFirstName(profile.first_name);
    }

    if (profile.last_name) {
      setLastName(profile.last_name);
    }

    if (profile.name && !profile.first_name) {
      const parts = profile.name.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }

    if (profile.address) setAddress(profile.address);

    if (profile.vehicle_type === "car" || profile.vehicle_type === "bike") {
      setVehicleType(profile.vehicle_type);
    }

    if (profile.vehicle_brand) setVehicleBrand(profile.vehicle_brand);
    if (profile.vehicle_model) setVehicleModel(profile.vehicle_model);
    if (profile.vehicle_reg) setVehicleReg(profile.vehicle_reg);
  };

  const lookupByEmail = async (emailAddress: string) => {
    try {
      const res = await fetch("/api/auth/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "email", email: emailAddress }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Email lookup error:", result.error);
        return null;
      }

      if (result.profile) {
        applyProfileToState(result.profile);
        return result.profile;
      }

      return null;
    } catch (err) {
      console.error("Email lookup failed:", err);
      return null;
    }
  };

  const lookupByPhone = async (phoneNumber: string) => {
    try {
      const res = await fetch("/api/auth/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "phone", phone: phoneNumber }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Phone lookup error:", result.error);
        return null;
      }

      if (result.profile) {
        applyProfileToState(result.profile);
        return result.profile;
      }

      return null;
    } catch (err) {
      console.error("Phone lookup failed:", err);
      return null;
    }
  };

  const setLoginState = async (profileId?: string, profile?: any) => {
    const source = profile || {};

    let resolvedFirstName = source.first_name || firstName || "";
    let resolvedLastName = source.last_name || lastName || "";

    if (!resolvedFirstName && source.name) {
      const parts = source.name.split(" ");
      resolvedFirstName = parts[0] || "";
      resolvedLastName = parts.slice(1).join(" ") || "";
    }

    const resolvedPhone = source.phone || phone || "";
    const resolvedEmail = source.email || email || "";
    const resolvedAddress = source.address || address || "";
    const resolvedVehicleType = source.vehicle_type || vehicleType || "";
    const resolvedVehicleBrand = source.vehicle_brand || vehicleBrand || "";
    const resolvedVehicleModel = source.vehicle_model || vehicleModel || "";
    const resolvedVehicleReg = source.vehicle_reg || vehicleReg || "";

    const fullName = `${resolvedFirstName.trim()} ${resolvedLastName.trim()}`.trim();

    const userData = {
      id: profileId || source.id || "",
      phone: resolvedPhone,
      first_name: resolvedFirstName,
      last_name: resolvedLastName,
      name: fullName || source.name || "",
      email: resolvedEmail,
      address: resolvedAddress,
      vehicle_type: resolvedVehicleType,
      vehicle_brand: resolvedVehicleBrand,
      vehicle_model: resolvedVehicleModel,
      vehicle_reg: resolvedVehicleReg,
    };

    // Password is NOT saved in localStorage
    localStorage.setItem("xpress_prefill", JSON.stringify(userData));

    // Updates AuthContext's shared state (and xpress_user in localStorage)
    // so the Navbar/logout button reflect login immediately, without needing a reload.
    await login(userData as any);
  };

  const clearAllPasswordFields = () => {
    setPassword("");
    setSignupPassword("");
    setConfirmPassword("");
  };

  const redirectToSignup = () => {
    setError("Account not found. Redirecting to Sign Up...");

    setTimeout(() => {
      setMode("signup");
      setError("");
      clearAllPasswordFields();
    }, 1500);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (otpMethod === "phone") {
      if (!isValidPhone(phone)) {
        setError("Phone number must be 10 digits starting with 6, 7, 8, or 9");
        setLoading(false);
        return;
      }
    } else {
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
    }

    if (!password) {
      setError("Please enter your password");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: otpMethod,
          phone: otpMethod === "phone" ? phone : undefined,
          email: otpMethod === "email" ? email : undefined,
          password,
        }),
      });

      const result = await res.json();

      if (res.status === 404) {
        redirectToSignup();
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(result.error || "Incorrect password");
        setLoading(false);
        return;
      }

      applyProfileToState(result.profile);
      await setLoginState(result.profile.id, result.profile);
      clearAllPasswordFields();

      router.replace("/my-account");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (otpMethod === "phone") {
        if (!isValidPhone(phone)) {
          setError("Phone number must be 10 digits starting with 6, 7, 8, or 9");
          setLoading(false);
          return;
        }

        const profile = await lookupByPhone(phone);

        if (mode === "login" && !profile) {
          setError("Account not found. Redirecting to Sign Up...");
          localStorage.setItem("xpress_otp_target", phone);

          setTimeout(() => {
            setMode("signup");
            setError("");
            setStep("otp");
          }, 1500);

          setLoading(false);
          return;
        }

        localStorage.setItem("xpress_otp_target", phone);
      } else {
        if (!email || !email.includes("@")) {
          setError("Please enter a valid email address");
          setLoading(false);
          return;
        }

        const profile = await lookupByEmail(email);

        if (mode === "login" && !profile) {
          setError("Account not found. Redirecting to Sign Up...");
          localStorage.setItem("xpress_otp_target", email);

          setTimeout(() => {
            setMode("signup");
            setError("");
            setStep("otp");
          }, 1500);

          setLoading(false);
          return;
        }

        localStorage.setItem("xpress_otp_target", email);
      }

      setStep("otp");
    } catch (err) {
      console.error("OTP flow failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      // Clear any lingering Firebase session first, so this is always a
      // fresh sign-in and never silently reuses a previous account.
      // (Not gated on auth.currentUser — that can still be null here if
      // Firebase hasn't finished hydrating the persisted session yet.)
      await signOut(auth).catch(() => {});

      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      const googleName = googleUser.displayName || "";
      const googleEmail = googleUser.email || "";

      if (googleName) {
        const parts = googleName.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }

      if (googleEmail) {
        setEmail(googleEmail);
      }

      const profile = await lookupByEmail(googleEmail);

      if (
        profile &&
        profile.phone &&
        profile.phone.length >= 10 &&
        (profile.first_name || profile.name)
      ) {
        await setLoginState(profile.id, profile);
        clearAllPasswordFields();
        router.replace("/my-account");
        return;
      }

      // New Google user OR incomplete Google profile
      setMode("signup");
      setStep("profile");
    } catch (err: any) {
      console.error("Google Sign-In failed:", err);

      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled.");
      } else {
        setError("Google Sign-In failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp !== "123456") {
      setError("Invalid OTP. Use 123456 for testing.");
      return;
    }

    setStep("profile");
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (otpMethod === "phone") {
        if (!isValidPhone(phone)) {
          setError("Phone number must be 10 digits starting with 6, 7, 8, or 9");
          setLoading(false);
          return;
        }
      } else {
        if (!email || !email.includes("@")) {
          setError("Please enter a valid email address");
          setLoading(false);
          return;
        }
      }

      const profile =
        otpMethod === "phone" ? await lookupByPhone(phone) : await lookupByEmail(email);

      if (!profile) {
        setError("No account found with that " + (otpMethod === "phone" ? "phone number" : "email"));
        setLoading(false);
        return;
      }

      setResetProfileId(profile.id);
      setResetOtp("");
      setStep("forgot-otp");
    } catch (err) {
      console.error("Forgot password lookup failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (resetOtp !== "123456") {
      setError("Invalid OTP. Use 123456 for testing.");
      return;
    }

    setNewPassword("");
    setConfirmNewPassword("");
    setStep("forgot-reset");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!resetProfileId) {
      setError("Something went wrong. Please restart the reset process.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: resetProfileId,
          newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Could not reset password");
      }

      clearAllPasswordFields();
      setNewPassword("");
      setConfirmNewPassword("");
      setResetOtp("");
      setResetProfileId(null);
      setMode("login");
      setStep("form");
      setError("Password reset successful. Please log in with your new password.");
    } catch (err: any) {
      console.error("Password reset failed:", err);
      setError(`Reset failed: ${err?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!firstName.trim()) {
      setError("First name is required");
      setLoading(false);
      return;
    }

    if (!isValidPhone(phone)) {
      setError("Phone number must be 10 digits starting with 6, 7, 8, or 9");
      setLoading(false);
      return;
    }

    if (mode === "signup" && !signupPassword) {
      setError("Please set a password");
      setLoading(false);
      return;
    }

    if (mode === "signup" && signupPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      const profileData: any = {
        name: fullName,
        phone,
        email: email || null,
        updated_at: new Date().toISOString(),
      };

      if (firstName.trim()) profileData.first_name = firstName.trim();
      if (lastName.trim()) profileData.last_name = lastName.trim();
      if (address.trim()) profileData.address = address.trim();

      if (vehicleType) profileData.vehicle_type = vehicleType;
      if (vehicleBrand) profileData.vehicle_brand = vehicleBrand.trim();
      if (vehicleModel) profileData.vehicle_model = vehicleModel.trim();

      if (vehicleReg) {
        profileData.vehicle_reg = cleanVehicleReg(vehicleReg);
      }

      // Password is sent separately (not inside profileData) so the API route
      // can hash it server-side before it ever touches the database.
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileData,
          password: signupPassword || undefined,
          phone,
          email: email || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Could not save profile");
      }

      const profileId: string = result.id;

      const savedProfile = {
        id: profileId,
        name: fullName,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone,
        email: email || "",
        address: address.trim() || "",
        vehicle_type: vehicleType || "",
        vehicle_brand: vehicleBrand.trim() || "",
        vehicle_model: vehicleModel.trim() || "",
        vehicle_reg: cleanVehicleReg(vehicleReg) || "",
      };

      await setLoginState(profileId, savedProfile);
      clearAllPasswordFields();

      router.replace("/my-account");
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(`Save failed: ${err?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2">
            {step === "form" && (mode === "login" ? "Welcome Back" : "Create Account")}
            {step === "otp" && "Verify OTP"}
            {step === "profile" &&
              (mode === "signup" ? "Create Your Account" : "Complete Your Profile")}
            {step === "forgot-request" && "Reset Password"}
            {step === "forgot-otp" && "Verify OTP"}
            {step === "forgot-reset" && "Set New Password"}
          </h1>

          <p className="text-slate-500 text-lg">
            {step === "form" &&
              (mode === "login"
                ? "Sign in to your account"
                : "Sign up to get started")}
            {step === "otp" &&
              otpMethod === "phone" &&
              `Enter the OTP sent to ${phone}`}
            {step === "otp" &&
              otpMethod === "email" &&
              `Enter the OTP sent to ${email}`}
            {step === "profile" && "Fill in your details to continue"}
            {step === "forgot-request" &&
              "Enter your phone or email to receive a reset code"}
            {step === "forgot-otp" &&
              otpMethod === "phone" &&
              `Enter the OTP sent to ${phone}`}
            {step === "forgot-otp" &&
              otpMethod === "email" &&
              `Enter the OTP sent to ${email}`}
            {step === "forgot-reset" && "Choose a new password for your account"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-sm">
          {/* FORM STEP */}
          {step === "form" && (
            <div className="space-y-6">
              {/* Login / Signup Tabs */}
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    clearAllPasswordFields();
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                    mode === "login"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    clearAllPasswordFields();
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                    mode === "signup"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 py-3.5 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-slate-400 text-sm font-medium">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Phone / Email Toggle */}
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => {
                    setOtpMethod("phone");
                    setError("");
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                    otpMethod === "phone"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  📱 Phone
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpMethod("email");
                    setError("");
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                    otpMethod === "email"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  ✉️ Email
                </button>
              </div>

              {/* LOGIN MODE */}
              {mode === "login" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  {otpMethod === "phone" ? (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(cleanPhone(e.target.value))}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        autoComplete="off"
                        className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg"
                      />
                      <p className="text-slate-400 text-xs mt-1">
                        Must start with 6, 7, 8, or 9
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        autoComplete="off"
                        className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Password
                    </label>
                    <PasswordInput
                      value={password}
                      onChange={setPassword}
                      placeholder="Enter your password"
                      name="xpress-login-password"
                      className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg"
                    />
                    <div className="text-right mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setPassword("");
                          setStep("forgot-request");
                        }}
                        className="text-blue-600 text-sm font-semibold hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  {error && <p className={`text-sm ${errorClass}`}>{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-slate-400 text-xs font-medium">
                      or login with OTP
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full bg-slate-100 text-slate-700 py-3.5 rounded-xl font-bold text-lg hover:bg-slate-200 transition"
                  >
                    Send OTP to {otpMethod === "phone" ? "Phone" : "Email"}
                  </button>
                </form>
              )}

              {/* SIGNUP MODE */}
              {mode === "signup" && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {otpMethod === "phone" ? (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(cleanPhone(e.target.value))}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        autoComplete="off"
                        className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg"
                      />
                      <p className="text-slate-400 text-xs mt-1">
                        Must start with 6, 7, 8, or 9
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        autoComplete="off"
                        className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg"
                      />
                    </div>
                  )}

                  {error && <p className={`text-sm ${errorClass}`}>{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {loading ? "Sending OTP..." : "Send OTP to Verify"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* OTP STEP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-blue-700 text-sm">
                  {otpMethod === "phone" && (
                    <>
                      OTP sent to <span className="font-bold">{phone}</span>
                    </>
                  )}
                  {otpMethod === "email" && (
                    <>
                      OTP sent to <span className="font-bold">{email}</span>
                    </>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  One-Time Password
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  autoComplete="off"
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg tracking-widest text-center font-mono"
                />

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <p className="text-slate-400 text-xs mt-2 text-center">
                  Use <span className="font-mono font-bold">123456</span> for testing
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
              >
                Verify & Continue
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setError("");
                  setOtp("");
                }}
                className="w-full text-slate-500 hover:text-slate-700 text-sm font-medium transition"
              >
                ← Back
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD: REQUEST STEP */}
          {step === "forgot-request" && (
            <form onSubmit={handleForgotRequest} className="space-y-4">
              {/* Phone / Email Toggle */}
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => {
                    setOtpMethod("phone");
                    setError("");
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                    otpMethod === "phone"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  📱 Phone
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpMethod("email");
                    setError("");
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                    otpMethod === "email"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  ✉️ Email
                </button>
              </div>

              {otpMethod === "phone" ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(cleanPhone(e.target.value))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    autoComplete="off"
                    className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="off"
                    className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg"
                  />
                </div>
              )}

              {error && <p className={`text-sm ${errorClass}`}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send Reset Code"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setError("");
                }}
                className="w-full text-slate-500 hover:text-slate-700 text-sm font-medium transition"
              >
                ← Back to Login
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD: OTP STEP */}
          {step === "forgot-otp" && (
            <form onSubmit={handleVerifyResetOtp} className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-blue-700 text-sm">
                  {otpMethod === "phone" && (
                    <>
                      OTP sent to <span className="font-bold">{phone}</span>
                    </>
                  )}
                  {otpMethod === "email" && (
                    <>
                      OTP sent to <span className="font-bold">{email}</span>
                    </>
                  )}
                </p>
              </div>

              <div>
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
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg tracking-widest text-center font-mono"
                />

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <p className="text-slate-400 text-xs mt-2 text-center">
                  Use <span className="font-mono font-bold">123456</span> for testing
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
              >
                Verify Code
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("forgot-request");
                  setError("");
                  setResetOtp("");
                }}
                className="w-full text-slate-500 hover:text-slate-700 text-sm font-medium transition"
              >
                ← Back
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD: RESET STEP */}
          {step === "forgot-reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  New Password
                </label>
                <PasswordInput
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Enter a new password"
                  name="xpress-new-password"
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm New Password
                </label>
                <PasswordInput
                  value={confirmNewPassword}
                  onChange={setConfirmNewPassword}
                  placeholder="Re-type your new password"
                  name="xpress-confirm-new-password"
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg"
                />
                {confirmNewPassword && newPassword !== confirmNewPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              {error && <p className={`text-sm ${errorClass}`}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Reset Password"}
              </button>
            </form>
          )}

          {/* PROFILE STEP */}
          {step === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    autoComplete="off"
                    className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    autoComplete="off"
                    className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(cleanPhone(e.target.value))}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  autoComplete="off"
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <p className="text-slate-400 text-xs mt-1">
                  Must start with 6, 7, 8, or 9
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="off"
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Address <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your full address"
                  rows={2}
                  autoComplete="off"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>

              {mode === "signup" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Set Password <span className="text-red-500">*</span>
                    </label>
                    <PasswordInput
                      value={signupPassword}
                      onChange={setSignupPassword}
                      placeholder="Create a password"
                      name="xpress-signup-password"
                      className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <PasswordInput
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      placeholder="Re-type your password"
                      name="xpress-confirm-password"
                      className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />

                    {confirmPassword && signupPassword !== confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  <p className="text-slate-400 text-xs">
                    Use this password to login without OTP next time
                  </p>
                </>
              )}

              {/* Vehicle Details */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-bold mb-1">Vehicle Details</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Optional — you can add this later
                </p>

                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setVehicleType("car")}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition ${
                      vehicleType === "car"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    🚗 Car
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicleType("bike")}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition ${
                      vehicleType === "bike"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    🏍️ Bike
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={vehicleBrand}
                      onChange={(e) => setVehicleBrand(e.target.value)}
                      placeholder="e.g. Maruti"
                      autoComplete="off"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Swift"
                      autoComplete="off"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                    placeholder="e.g. HR12GH1234"
                    autoComplete="off"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono tracking-wider"
                  />
                </div>
              </div>

              {error && <p className={`text-sm ${errorClass}`}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : mode === "signup"
                  ? "Create Account"
                  : "Save & Continue"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8">
          <Link href="/" className="text-blue-600 font-semibold hover:underline">
            ← Back to Home
          </Link>
          <span className="mx-3">|</span>
          <Link href="/book" className="text-blue-600 font-semibold hover:underline">
            Book as guest
          </Link>
        </p>
      </div>
    </div>
  );
}