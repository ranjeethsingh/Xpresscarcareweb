export default function StoreMap() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Xpress Car Care</h3>
          <p className="text-slate-500 text-sm mt-1">
            Gajularamaram, Hyderabad
          </p>
        </div>

        <a
          href="https://maps.app.goo.gl/2eMnBrWRLBEvnyZT7"
          target="_blank"
          rel="noreferrer"
          className="inline-flex justify-center bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition"
        >
          Open in Maps
        </a>
      </div>

      <div className="relative h-[220px] md:h-[260px] w-full">
        <iframe
          title="Xpress Car Care Location"
          src="https://www.google.com/maps?q=Xpress%20Car%20Care%20Gajularamaram%20Hyderabad&output=embed"
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>
  );
}