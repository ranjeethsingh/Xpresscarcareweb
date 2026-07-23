'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { carServices, bikeServices, formatDuration, generateBookingCode } from '@/lib/services';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const formatTime12 = (t: string) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return d;
  }
};

const formatMethod = (method: string) => {
  if (method === 'self-drive') return 'Self Drive';
  if (method === 'doorstep-pickup') return 'Doorstep Pickup';
  if (method === 'doorstep-pickup-drop') return 'Pickup & Drop';
  return method;
};

export default function ConfirmationPage() {
  return (
    <ProtectedRoute>
      <ConfirmationContent />
    </ProtectedRoute>
  );
}

function ConfirmationContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingCode, setBookingCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('xpress_booking');
    if (!stored) {
      router.replace('/');
      return;
    }
    setBooking(JSON.parse(stored));
  }, [router]);

  const getServiceNames = () => {
    if (!booking) return [];
    const services = booking.vehicleType === 'bike' ? bikeServices : carServices;
    const names: string[] = [];

    for (const svc of services) {
      if (booking.selectedServices?.includes(svc.id)) {
        if (svc.subOptions) {
          const sub = svc.subOptions.find((o: any) =>
            booking.selectedSubs?.includes(o.id)
          );
          if (sub) names.push(`${svc.name} - ${sub.name}`);
        } else {
          names.push(svc.name);
        }
      }
    }
    return names;
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const code = generateBookingCode();
      setBookingCode(code);

      const customerPhone = user?.phone || '';
      const customerName = user?.name || `Customer (${customerPhone})`;

      if (!customerPhone) {
        setError('Phone number is required to complete booking.');
        setIsSubmitting(false);
        return;
      }

      const serviceNames = getServiceNames();

      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        vehicle_type: booking.vehicleType,
        vehicle_model: booking.vehicleReg,
        vehicle_number: booking.vehicleReg,
        service_type: serviceNames.join(', '),
        delivery_type: booking.method,
        scheduled_date: booking.date,
        scheduled_time: booking.time,
        address: booking.pickupAddress || booking.dropAddress || 'Self Drive',
        status: 'pending',
        admin_notes: booking.comments || '',
      };

      // ✅ Submit to Supabase bookings table
      const { error: supabaseError } = await supabase
        .from('bookings')
        .insert([payload]);

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        setError('Failed to save booking. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // ✅ Clear booking data from localStorage
      localStorage.removeItem('xpress_booking');
      setIsSubmitted(true);

    } catch (e) {
      console.error('Booking error:', e);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) return null;

  // ✅ Success Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-sm p-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-500 mb-6">
              Your booking has been successfully submitted. Our team will contact you shortly.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-8">
              <p className="text-xs text-gray-500 font-medium mb-1">Booking Code</p>
              <p className="text-2xl font-black text-red-600 tracking-widest">{bookingCode}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/my-bookings')}
                className="w-full h-12 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
              >
                View My Bookings
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full h-12 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const serviceNames = getServiceNames();

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-gray-900 text-center mb-1">
          Confirm Booking
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Review your booking details before confirming
        </p>

        {/* ── Customer Details ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>👤</span> Customer Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Name</span>
              <span className="font-bold text-gray-900 text-sm">{user?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Phone</span>
              <span className="font-bold text-gray-900 text-sm">+91 {user?.phone || '—'}</span>
            </div>
          </div>
        </div>

        {/* ── Vehicle Details ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>{booking.vehicleType === 'car' ? '🚗' : '🏍️'}</span> Vehicle Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Type</span>
              <span className="font-bold text-gray-900 text-sm capitalize">{booking.vehicleType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Brand & Model</span>
              <span className="font-bold text-gray-900 text-sm">
                {booking.vehicleBrand} {booking.vehicleModel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Registration</span>
              <span className="font-bold text-gray-900 text-sm tracking-widest">{booking.vehicleReg}</span>
            </div>
          </div>
        </div>

        {/* ── Services ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>🔧</span> Selected Services
          </h3>
          <div className="space-y-2">
            {serviceNames.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                <span className="text-sm text-gray-700 font-medium">{name}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
            <span className="text-gray-500 text-sm">Total</span>
            <span className="font-black text-gray-900">₹{booking.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Duration</span>
            <span className="font-bold text-gray-900 text-sm">{formatDuration(booking.duration)}</span>
          </div>
        </div>

        {/* ── Schedule ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>📅</span> Schedule
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Date</span>
              <span className="font-bold text-gray-900 text-sm">{formatDate(booking.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Time</span>
              <span className="font-bold text-gray-900 text-sm">{formatTime12(booking.time)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Ready By</span>
              <span className="font-bold text-blue-600 text-sm">{booking.readyBy}</span>
            </div>
          </div>
        </div>

        {/* ── Delivery ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>🚛</span> Delivery Method
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Method</span>
              <span className="font-bold text-gray-900 text-sm">{formatMethod(booking.method)}</span>
            </div>
            {booking.pickupAddress && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Pickup</span>
                <span className="font-bold text-gray-900 text-sm text-right max-w-xs">{booking.pickupAddress}</span>
              </div>
            )}
            {booking.dropAddress && booking.dropAddress !== booking.pickupAddress && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Drop</span>
                <span className="font-bold text-gray-900 text-sm text-right max-w-xs">{booking.dropAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Comments ── */}
        {booking.comments && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span>💬</span> Comments
            </h3>
            <p className="text-sm text-gray-600">{booking.comments}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

      </div>

      {/* ── Fixed Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => router.push('/schedule')}
            className="text-gray-400 text-sm hover:text-gray-600 font-medium"
          >
            ← Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`flex-1 h-12 rounded-xl font-bold text-white transition-all ${
              isSubmitting
                ? 'bg-red-300 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirming...
              </span>
            ) : (
              '✓ Confirm & Submit Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}