'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

const deliveryOptions = [
  {
    id: 'self-drive',
    icon: '🔑',
    title: 'Self Drive',
    desc: 'Drive your vehicle to our service center',
  },
  {
    id: 'doorstep-pickup',
    icon: '🚛',
    title: 'Doorstep Pickup',
    desc: 'We pick up your vehicle from your location',
  },
  {
    id: 'doorstep-pickup-drop',
    icon: '🔄',
    title: 'Pickup & Drop',
    desc: 'We pick up and drop off your vehicle',
  },
];

export default function DeliveryPage() {
  return (
    <ProtectedRoute>
      <DeliveryContent />
    </ProtectedRoute>
  );
}

function DeliveryContent() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [method, setMethod] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLandmark, setPickupLandmark] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [dropLandmark, setDropLandmark] = useState('');
  const [sameAsPickup, setSameAsPickup] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('xpress_booking');
    if (!stored) {
      router.replace('/');
      return;
    }
    setBooking(JSON.parse(stored));
  }, [router]);

  const needsPickup = method === 'doorstep-pickup' || method === 'doorstep-pickup-drop';
  const needsDrop = method === 'doorstep-pickup-drop';

  const canContinue =
    method !== '' &&
    (!needsPickup || pickupAddress.trim() !== '') &&
    (!needsDrop || sameAsPickup || dropAddress.trim() !== '');

  const handleContinue = () => {
    if (!canContinue) {
      setError('Please fill in all required fields.');
      return;
    }

    const updated = {
      ...booking,
      method,
      pickupAddress,
      pickupLandmark,
      dropAddress: sameAsPickup ? pickupAddress : dropAddress,
      dropLandmark: sameAsPickup ? pickupLandmark : dropLandmark,
    };
    localStorage.setItem('xpress_booking', JSON.stringify(updated));
    router.push('/schedule');
  };

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-gray-900 text-center mb-1">
          Delivery Method
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          How would you like your vehicle serviced?
        </p>

        {/* Delivery Options */}
        <div className="space-y-3 mb-6">
          {deliveryOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setMethod(opt.id); setError(''); }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                method === opt.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-3xl">{opt.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{opt.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{opt.desc}</p>
              </div>
              {method === opt.id && (
                <span className="text-blue-500 font-bold text-lg">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Pickup Address */}
        {needsPickup && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <h3 className="font-bold text-gray-900 mb-4">📍 Pickup Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Pickup Address *
                </label>
                <textarea
                  placeholder="Enter your full pickup address"
                  value={pickupAddress}
                  onChange={(e) => { setPickupAddress(e.target.value); setError(''); }}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Landmark (optional)
                </label>
                <input
                  type="text"
                  placeholder="Nearby landmark"
                  value={pickupLandmark}
                  onChange={(e) => setPickupLandmark(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Drop Address */}
        {needsDrop && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <h3 className="font-bold text-gray-900 mb-4">📍 Drop Details</h3>

            {/* Same as Pickup Checkbox */}
            <button
              onClick={() => setSameAsPickup(!sameAsPickup)}
              className="flex items-center gap-3 mb-4"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                sameAsPickup ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              }`}>
                {sameAsPickup && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <span className="text-sm font-medium text-gray-700">
                Same as pickup address
              </span>
            </button>

            {!sameAsPickup && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Drop Address *
                  </label>
                  <textarea
                    placeholder="Enter your full drop address"
                    value={dropAddress}
                    onChange={(e) => { setDropAddress(e.target.value); setError(''); }}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Landmark (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Nearby landmark"
                    value={dropLandmark}
                    onChange={(e) => setDropLandmark(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm font-medium mb-4">{error}</p>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full h-14 rounded-xl font-bold text-white text-base transition-all ${
            canContinue
              ? 'bg-gray-900 hover:bg-gray-800 active:scale-95'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Continue →
        </button>

        {/* Back */}
        <button
          onClick={() => router.push('/services')}
          className="w-full mt-3 text-center text-gray-400 text-sm hover:text-gray-600"
        >
          ← Back to Services
        </button>

      </div>
    </div>
  );
}