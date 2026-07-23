'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CompleteProfilePage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, updateProfile, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    // ✅ Load prefill data from localStorage
    const prefillStr = localStorage.getItem('xpress_prefill');
    if (prefillStr) {
      const prefill = JSON.parse(prefillStr);
      if (prefill.name) setName(prefill.name);
      if (prefill.phone) setPhone(prefill.phone);
      localStorage.removeItem('xpress_prefill');
    } else {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    setError('');
    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({ name: cleanName, phone: cleanPhone });
      router.replace('/');
    } catch (e) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">
              Confirm Your Details
            </h1>
            <p className="text-gray-500 text-sm">
              Please verify your name and mobile number before we proceed with your service.
            </p>
          </div>

          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="eg: Rajat Sharma"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              autoFocus
              className="w-full border-b-2 border-red-500 pb-2 text-lg font-medium text-gray-900 outline-none bg-transparent placeholder-gray-300 focus:border-red-600 transition-colors"
            />
          </div>

          {/* Phone Input */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Mobile Number
            </label>
            <div className="flex items-center border-b-2 border-red-500 pb-2">
              <span className="text-lg font-bold text-gray-900 mr-2">+91</span>
              <input
                type="tel"
                placeholder="00000 00000"
                maxLength={10}
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/[^0-9]/g, '')); setError(''); }}
                className="flex-1 text-lg font-medium text-gray-900 outline-none bg-transparent placeholder-gray-300"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm font-medium mb-4">{error}</p>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`w-full h-14 rounded-xl font-bold text-white text-base transition-all ${
              isSubmitting
                ? 'bg-red-300 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Confirm & Continue →'
            )}
          </button>

          {/* Sign Out */}
          <button
            onClick={async () => { await logout(); router.replace('/login'); }}
            className="w-full mt-4 text-center text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            Use a different account
          </button>

        </div>
      </div>
    </div>
  );
}