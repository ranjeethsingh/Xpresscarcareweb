'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { carServices, bikeServices, formatDuration, ServiceItem } from '@/lib/services';

export default function ServicesPage() {
  return (
    <ProtectedRoute>
      <ServicesContent />
    </ProtectedRoute>
  );
}

function ServicesContent() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem('xpress_booking');
    if (!stored) {
      router.replace('/');
      return;
    }
    setBooking(JSON.parse(stored));
  }, [router]);

  const services: ServiceItem[] = booking?.vehicleType === 'bike' ? bikeServices : carServices;

  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter(s => s !== id));
      const svc = services.find(s => s.id === id);
      if (svc?.subOptions) {
        setSelectedSubs(selectedSubs.filter(sub =>
          !svc.subOptions!.some(o => o.id === sub)
        ));
      }
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const selectSub = (subId: string, parentId: string) => {
    const svc = services.find(s => s.id === parentId);
    const subIds = svc?.subOptions?.map(o => o.id) || [];
    setSelectedSubs([
      ...selectedSubs.filter(id => !subIds.includes(id)),
      subId,
    ]);
  };

  const { total, duration } = useMemo(() => {
    let t = 0, d = 0;
    for (const svc of services) {
      if (selectedServices.includes(svc.id)) {
        if (svc.subOptions) {
          for (const sub of svc.subOptions) {
            if (selectedSubs.includes(sub.id)) {
              t += sub.price;
              d += sub.durationMinutes;
            }
          }
        } else {
          t += svc.price;
          d += svc.durationMinutes;
        }
      }
    }
    return { total: t, duration: d };
  }, [selectedServices, selectedSubs, services]);

  // ✅ Check if all selected services with sub options have a sub selected
  const canContinue =
    selectedServices.length > 0 &&
    !selectedServices.some(id => {
      const svc = services.find(s => s.id === id);
      return svc?.hasSubOptions && !svc.subOptions?.some(o => selectedSubs.includes(o.id));
    });

  const handleContinue = () => {
    if (!canContinue) return;
    const updated = {
      ...booking,
      selectedServices,
      selectedSubs,
      dynamicFields,
      total,
      duration,
    };
    localStorage.setItem('xpress_booking', JSON.stringify(updated));
    router.push('/delivery');
  };

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-gray-900 text-center mb-1">
          Choose Services
        </h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Pick one or more for your {booking.vehicleType}
        </p>

        <div className="space-y-3">
          {services.map((svc) => {
            const isSelected = selectedServices.includes(svc.id);
            const selectedSub = svc.subOptions?.find(o => selectedSubs.includes(o.id));

            return (
              <div
                key={svc.id}
                className={`bg-white rounded-xl border-2 transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {/* Main Service Row */}
                <button
                  onClick={() => toggleService(svc.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  {/* Checkbox */}
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                  </div>

                  <span className="text-2xl">{svc.icon}</span>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{svc.name}</p>
                      {/* ✅ Popular badge */}
                      {svc.popular && (
                        <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {svc.hasSubOptions
                        ? selectedSub
                          ? `Selected: ${selectedSub.name}`
                          : 'Tap to choose type'
                        : svc.description}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-blue-600 text-base">
                      {svc.priceNote ? (
                        <span className="text-xs text-gray-400">{svc.priceNote}</span>
                      ) : svc.price === 0 ? '—' : `₹${svc.price}`}
                    </span>
                    <p className="text-xs text-gray-400">
                      {formatDuration(svc.durationMinutes)}
                    </p>
                  </div>
                </button>

                {/* Sub Options */}
                {svc.hasSubOptions && svc.subOptions && isSelected && (
                  <div className="border-t border-gray-100 p-3 space-y-2">
                    {svc.subOptions.map((sub) => {
                      const isSel = selectedSubs.includes(sub.id);
                      return (
                        <button
                          key={sub.id}
                          onClick={() => selectSub(sub.id, svc.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                            isSel
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          {/* Radio */}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSel ? 'border-blue-500' : 'border-gray-300'
                          }`}>
                            {isSel && (
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <span className="text-lg">{sub.icon}</span>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-gray-900">{sub.name}</p>
                            <p className="text-xs text-gray-500">{sub.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-blue-600">₹{sub.price}</p>
                            <p className="text-xs text-gray-400">{formatDuration(sub.durationMinutes)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ✅ Dynamic Field (for PPF, Decors, Accessories) */}
                {svc.hasDynamicField && isSelected && (
                  <div className="border-t border-gray-100 p-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {svc.dynamicFieldLabel}
                    </label>
                    <textarea
                      placeholder={`Enter your ${svc.dynamicFieldLabel?.toLowerCase()}...`}
                      value={dynamicFields[svc.id] || ''}
                      onChange={(e) => setDynamicFields({
                        ...dynamicFields,
                        [svc.id]: e.target.value,
                      })}
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total</p>
            <p className="text-2xl font-black text-gray-900">₹{total}</p>
            <p className="text-xs text-gray-400">Est. {formatDuration(duration)}</p>
          </div>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`px-8 py-4 rounded-xl font-bold text-white transition-all ${
              canContinue
                ? 'bg-gray-900 hover:bg-gray-800 active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}