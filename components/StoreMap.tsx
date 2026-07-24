"use client";

import React, { useState } from "react";

export default function StoreMap() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-[350px] md:h-[400px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative bg-slate-900">
      {/* Loading Indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center space-y-3 z-10">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">Loading Workshop Location Map...</p>
        </div>
      )}

      <iframe
        title="Xpress Car Care Location"
        src="https://maps.google.com/maps?q=Gajularamaram%20Road,%20Jeedimetla,%20Hyderabad,%20Telangana%20500055&t=&z=15&ie=UTF8&iwloc=near&output=embed"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full block"
      />
    </div>
  );
}