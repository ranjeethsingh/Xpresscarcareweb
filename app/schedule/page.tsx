'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatDuration } from '@/lib/services';

const ALL_TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00',
];

const formatTime12 = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const getTodayString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const getMinDate = () => getTodayString();

export default function SchedulePage() {
  return (
    <ProtectedRoute>
      <ScheduleContent />
    </ProtectedRoute>
  );
}

function ScheduleContent() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedTime, setSelectedTime] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('xpress_booking');
    if (!stored) {
      router.replace('/');
      return;
    }
    const data = JSON.parse(stored);
    setBooking(data);
    // ✅ Auto populate vehicle reg from vehicle select screen
    if (data.vehicleReg) setVehicleReg(data.vehicleReg);
  }, [router]);

  // ✅ Filter out past time slots when today is selected
  const availableSlots = useMemo(() => {
    const now = new Date();
    const todayStr = getTodayString();
    const isToday = selectedDate === todayStr;

    if (!isToday) return ALL_TIME_SLOTS;

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return ALL_TIME_SLOTS.filter(slot => {
      const [slotHour] = slot.split(':').map(Number);
      // ✅ Must be at least 1 hour in the future
      if (slotHour > currentHour + 1) return true;
      if (slotHour === currentHour + 1 && currentMinute === 0) return true;
      return false;
    });
  }, [selectedDate]);

  // ✅ Reset selected time when date changes
  // so a past time slot is never carried forward
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedTime('');
    setError('');
  };

  const calcReadyBy = () => {
    if (!selectedTime || !booking?.duration) return '';
    const [h, m] = selectedTime.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m + booking.duration, 0, 0);
    const rh = d.getHours();
    const rm = d.getMinutes();
    return formatTime12(
      `${rh.toString().padStart(2, '0')}:${rm.toString().padStart(2, '0')}`
    );
  };

  const canContinue = selectedDate !== '' && selectedTime !== '' && vehicleReg.trim() !== '';

  const handleContinue = () => {
    if (!canContinue) {
      setError('Please select a date, time slot and enter vehicle registration.');
      return;
    }

    const fullVehicleDisplay = `${booking.vehicleBrand} ${booking.vehicleModel} [${vehicleReg}]`;

    const updated = {
      ...booking,
      date: selectedDate,
      time: selectedTime,
      vehicleReg,
      vehicleDisplay: fullVehicleDisplay,
      comments,
      readyBy: calcReadyBy(),
    };
    localStorage.setItem('xpress_booking', JSON.stringify(updated));
    router.push('/confirmation');
  };

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-gray-900 text-center mb-1">
          Schedule
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Pick a date and time for your service
        </p>

        {/* ── Date Picker ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">📅 Select Date</h3>
          <input
            type="date"
            value={selectedDate}
            min={getMinDate()} // ✅ Cannot select past dates
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-3 text-base font-medium text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
          />
        </div>

        {/* ── Time Slots ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">⏰ Select Time</h3>

          {/* ✅ No slots available message */}
          {availableSlots.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-2xl mb-2">⚠️</p>
              <p className="font-bold text-gray-900">No slots available for today</p>
              <p className="text-sm text-gray-500 mt-1">
                Please select tomorrow or a future date
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => { setSelectedTime(slot); setError(''); }}
                  className={`py-2.5 px-3 rounded-lg border-2 text-sm font-bold transition-all ${
                    selectedTime === slot
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {formatTime12(slot)}
                </button>
              ))}
            </div>
          )}

          {/* ✅ Duration Summary */}
          {selectedTime && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Duration</p>
                  <p className="font-bold text-gray-900">{formatDuration(booking.duration)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Start</p>
                  <p className="font-bold text-gray-900">{formatTime12(selectedTime)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Ready By</p>
                  <p className="font-bold text-blue-600">{calcReadyBy()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Vehicle Registration ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">🚗 Vehicle Registration *</h3>

          {/* ✅ Show vehicle brand + model as read-only info */}
          {booking.vehicleBrand && booking.vehicleModel && (
            <p className="text-blue-600 font-bold text-sm mb-2">
              {booking.vehicleBrand} {booking.vehicleModel}
            </p>
          )}

          <input
            type="text"
            placeholder="e.g., DL 3C AY 1111"
            value={vehicleReg}
            onChange={(e) => { setVehicleReg(e.target.value.toUpperCase()); setError(''); }}
            className="w-full border border-gray-200 rounded-lg p-3 text-base font-bold tracking-widest text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all uppercase"
          />

          {/* ✅ Auto fill hint */}
          {booking.vehicleReg && (
            <p className="text-green-600 text-xs font-bold mt-2">
              ✓ Auto-filled from your vehicle details
            </p>
          )}
        </div>

        {/* ── Comments ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">💬 Comments (optional)</h3>
          <textarea
            placeholder="Any special requests or notes for our team..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm font-medium mb-4">{error}</p>
        )}

      </div>

      {/* ── Fixed Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => router.push('/delivery')}
            className="text-gray-400 text-sm hover:text-gray-600 font-medium"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`flex-1 h-12 rounded-xl font-bold text-white transition-all ${
              canContinue
                ? 'bg-gray-900 hover:bg-gray-800 active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {canContinue ? 'Confirm Booking ✓' : 'Fill required fields'}
          </button>
        </div>
      </div>
    </div>
  );
}