"use client";

import React, { useState } from "react";

export default function StoreMap() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-[350px] md:h-[400px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative bg-slate-900 group">
      {/* Loading Indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center space-y-3 z-10">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">Loading Workshop Location Map...</p>
        </div>
      )}

      {/* Google Maps Embed */}
      <iframe
        title="Xpress Car Care Location"
        src="https://maps.google.com/maps?q=17.5165,78.4184&t=&z=16&ie=UTF8&iwloc=B&output=embed"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full block"
      />

      {/* Interactive Overlay Badge with Direct Link */}
      <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs text-white z-20 shadow-lg">
        <div className="min-w-0 pr-2">
          <p className="font-extrabold text-white text-sm truncate">Xpress Car Care Workshop</p>
          <p className="text-slate-400 text-[11px] truncate">Opp. HP Petrol Pump, Devender Nagar, Gajularamaram, Hyderabad</p>
        </div>
        <a
          href="https://www.google.com/maps/place/Xpress+Car+Care/@17.5199193,78.4166974,595a,48.9y,363.44h,106.38t/data=!3m7!1e1!3m5!1sbccLSVktOdymeLBWWAL9Bw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-16.377965945028933%26panoid%3DbccLSVktOdymeLBWWAL9Bw%26yaw%3D3.4409939486251346!7i16384!8i8192!4m6!3m5!1s0x3bcb8f8b3ee93ec3:0xf0beb6afe3a31858!8m2!3d17.5199924!4d78.4168634!16s%2Fg%2F11ytknzsl6?entry=ttu&g_ep=EgoyMDI2MDcyMi4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-md"
        >
          Open Maps ↗
        </a>
      </div>
    </div>
  );
}