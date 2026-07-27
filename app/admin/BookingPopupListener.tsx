// app/admin/BookingPopupListener.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Booking = {
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
};

export default function BookingPopupListener() {
  const [incoming, setIncoming] = useState<Booking | null>(null);
  const [deciding, setDeciding] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const beepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel('admin-new-bookings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: 'status=eq.pending', // only fire for genuinely new, undecided bookings
        },
        (payload) => {
          setIncoming(payload.new as Booking);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      stopRinging();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ring continuously while a booking is waiting for a decision, stop the moment
  // it's handled or dismissed.
  useEffect(() => {
    if (incoming) {
      startRinging();
    } else {
      stopRinging();
    }
    return () => stopRinging();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming]);

  const playBeep = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gain.gain.value = 0.2;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.error('Could not play alert sound:', e);
    }
  };

  const startRinging = () => {
    playBeep();
    beepIntervalRef.current = setInterval(playBeep, 1500);
  };

  const stopRinging = () => {
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
  };

  const handleDecision = async (id: string, decision: 'confirmed' | 'cancelled') => {
    setDeciding(true);
    try {
      const updates: {
        status: string;
        repair_status?: string;
        repair_status_updated_at?: string;
      } = { status: decision };

      // Match the same behavior as the main dashboard's Confirm button —
      // confirming here also starts the repair timeline in one step.
      if (decision === 'confirmed') {
        updates.repair_status = 'Booking Confirmed';
        updates.repair_status_updated_at = new Date().toISOString();
      }

      const { error } = await supabase.from('bookings').update(updates).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to update booking:', err);
      alert('Something went wrong saving this decision. Please handle it from the dashboard list below.');
    } finally {
      setDeciding(false);
      setIncoming(null);
    }
  };

  if (!incoming) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border-4 border-blue-500">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🔔</span>
          <h3 className="text-lg font-black text-slate-900">New Booking Request</h3>
        </div>

        <div className="space-y-2 text-sm mb-6">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 shrink-0">Customer</span>
            <span className="font-bold text-slate-900 text-right">{incoming.customer_name}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 shrink-0">Phone</span>
            <a href={`tel:${incoming.customer_phone}`} className="font-bold text-blue-600 text-right">
              +91 {incoming.customer_phone}
            </a>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 shrink-0">Vehicle</span>
            <span className="font-bold text-slate-900 text-right">
              {incoming.vehicle_model} ({incoming.vehicle_number})
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 shrink-0">Services</span>
            <span className="font-bold text-slate-900 text-right">{incoming.service_type}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 shrink-0">Date & Time</span>
            <span className="font-bold text-slate-900 text-right">
              {incoming.scheduled_date} at {incoming.scheduled_time}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500 shrink-0">Delivery</span>
            <span className="font-bold text-slate-900 text-right">{incoming.delivery_type}</span>
          </div>
          {incoming.address && incoming.address !== 'N/A' && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 shrink-0">Address</span>
              <span className="font-bold text-slate-900 text-right">{incoming.address}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleDecision(incoming.id, 'confirmed')}
            disabled={deciding}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
          >
            {deciding ? 'Saving...' : '✓ Accept'}
          </button>
          <button
            onClick={() => handleDecision(incoming.id, 'cancelled')}
            disabled={deciding}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
          >
            {deciding ? 'Saving...' : '✕ Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}
