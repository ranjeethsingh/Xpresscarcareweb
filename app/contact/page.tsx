import { ContactContent } from "@/components/InfoSections";

export default function ContactPage() {
  return (
    <div className="min-h-[80vh] py-12 lg:py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        <ContactContent />
      </div>
    </div>
  );
}