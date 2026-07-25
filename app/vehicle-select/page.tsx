"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VehicleSelectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlType = searchParams.get("type") === "bike" ? "bike" : "car";

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [reg, setReg] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("@xpress_prefill") || localStorage.getItem("xpress_prefill");
      if (raw) {
        const parsed = JSON.parse(raw);
        setBrand(parsed.vehicleBrand || "");
        setModel(parsed.vehicleModel || "");
        setReg(parsed.vehicleReg || "");
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const handleContinue = () => {
    const cleanReg = reg.trim().toUpperCase();
    const cleanBrand = brand.trim();
    const cleanModel = model.trim();

    const payload = {
      vehicleType: urlType,
      vehicleBrand: cleanBrand,
      vehicleModel: cleanModel,
      vehicleReg: cleanReg,
    };

    localStorage.setItem("xpress_prefill", JSON.stringify(payload));
    localStorage.setItem("@xpress_prefill", JSON.stringify(payload));

    router.push("/services");
  };

  return (
    <section className="min-h-[85vh] bg-paper-pure">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <div className="grid lg:grid-cols-12 gap-0 lg:gap-0 min-h-[85vh]">
          
          {/* LEFT IMAGE — Full height, sharp (Awwwards editorial split) */}
          <aside className="lg:col-span-7 relative h-[50vh] lg:h-auto lg:min-h-[85vh]">
            <img
              src={
                urlType === "car"
                  ? "https://images.unsplash.com/photo-1494976387174-0f1968a95829?q=80&w=1600&q=95&auto=format&fit=crop"
                  : "https://images.unsplash.com/photo-1558981852-426c6c22a060?q=80&w=1600&q=95&auto=format&fit=crop"
              }
              alt={urlType}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-deep/20 to-transparent lg:from-ink-deep/40" />
            
            <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-12 bg-white/95 backdrop-blur-md px-8 py-8 rounded-2xl shadow-2xl max-w-[20rem]">
              <h3 className="text-ink font-extrabold text-3xl tracking-tighter mb-2">
                {urlType === "car" ? "Car Service" : "Bike Service"}
              </h3>
              <p className="text-ink/40 text-xs font-extrabold uppercase tracking-[0.2em]">
                URL Param: <code className="text-coral font-mono">?type={urlType}</code>
              </p>
            </div>
          </aside>

          {/* RIGHT FORM — Clean, minimal (Octopus / British Gas precision) */}
          <main className="lg:col-span-5 bg-paper-pure flex flex-col justify-center px-8 lg:px-16 py-16 lg:py-24">
            <div className="max-w-md">
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tighter text-ink mb-4">
                Your Vehicle
              </h1>
              <div className="w-16 h-1 bg-coral rounded-full mb-8" />

              <p className="text-ink/40 text-base lg:text-lg leading-relaxed mb-14">
                Enter details cleanly. Brand, model, and registration number are passed separately — no concatenated strings. Clean plate format: <span className="font-mono text-xs text-ink bg-paper px-1 rounded">HR12GH12356</span>.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleContinue();
                }}
                className="space-y-10"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="brand" className="block text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-ink/20 mb-3">
                      Brand
                    </label>
                    <input
                      id="brand"
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Tata, Honda, RE"
                      className="w-full bg-transparent border-b-2 border-ink/10 focus:border-ink px-0 py-3 text-ink font-bold placeholder:text-ink/10 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="model" className="block text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-ink/20 mb-3">
                      Model
                    </label>
                    <input
                      id="model"
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Tiago, City"
                      className="w-full bg-transparent border-b-2 border-ink/10 focus:border-ink px-0 py-3 text-ink font-bold placeholder:text-ink/10 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg" className="block text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-ink/20 mb-3">
                    Registration Number
                  </label>
                  <input
                    id="reg"
                    type="text"
                    value={reg}
                    onChange={(e) => setReg(e.target.value.toUpperCase())}
                    placeholder="HR12GH12356"
                    className="w-full bg-transparent border-b-2 border-ink/10 focus:border-ink px-0 py-3 text-ink font-extrabold tracking-[0.15em] text-xl placeholder:text-ink/10 focus:outline-none transition-colors"
                  />
                  <p className="text-[0.7rem] text-ink/20 mt-4">
                    Clean plate only — passed as <code>vehicleReg</code>. Not combined with brand/model.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-ink text-white py-5 rounded-full text-sm font-extrabold uppercase tracking-[0.15em] hover:bg-ink-deep transition shadow-2xl shadow-ink/10"
                >
                  Continue to Services
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

export default function VehicleSelectPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center">Loading...</div>}>
      <VehicleSelectContent />
    </Suspense>
  );
}