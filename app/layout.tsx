import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";


export const metadata: Metadata = {
  title: "Xpress Care | Professional Vehicle Services",
  description:
    "Premium car wash, detailing, bike care, and garage services in Hyderabad.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-950 antialiased font-sans">
        <AuthProvider>
          <ScrollToTop />
          <Navbar />

          <main>{children}</main>

          <footer className="bg-slate-950 text-white py-20">
            <div className="max-w-7xl mx-auto px-6">
              {/* Main footer layout */}
              <div className="grid lg:grid-cols-[minmax(0,2.8fr)_minmax(150px,0.55fr)_minmax(220px,0.65fr)] gap-8 items-start">
                {/* Brand / Contact */}
                <div>
                  <Link
                    href="/"
                    scroll={true}
                    className="inline-block text-3xl font-black tracking-tighter mb-5 leading-none"
                  >
                    Xpress<span className="text-blue-500">Care</span>
                  </Link>

                  <p className="text-slate-400 max-w-2xl leading-relaxed mb-9">
                    Premium car wash, detailing, bike care, and garage services
                    in Hyderabad. Professional service, transparent pricing, and
                    convenient online booking.
                  </p>

                  {/* Contact details */}
                  <div className="grid md:grid-cols-[220px_minmax(260px,1fr)_180px] gap-8 text-sm">
                    <div>
                      <p className="font-semibold text-white mb-2">Phone</p>

                      <div className="flex items-center gap-2 text-slate-400 whitespace-nowrap">
                        <a
                          href="tel:9494494671"
                          className="hover:text-white transition"
                        >
                          9494494671
                        </a>

                        <span>/</span>

                        <a
                          href="tel:9849969073"
                          className="hover:text-white transition"
                        >
                          9849969073
                        </a>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-white mb-2">Email</p>

                      <a
                        href="mailto:xpresscarcare26@gmail.com"
                        className="text-slate-400 hover:text-white transition whitespace-nowrap"
                      >
                        xpresscarcare26@gmail.com
                      </a>
                    </div>

                    <div>
                      <p className="font-semibold text-white mb-2">Website</p>

                      <a
                        href="https://Xpresscarcare.online"
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white transition whitespace-nowrap"
                      >
                        Xpresscarcare.online
                      </a>
                    </div>
                  </div>
                </div>

                {/* Explore */}
                <div className="lg:pt-8 lg:ml-6">
                  <h4 className="font-bold mb-6 text-white text-lg leading-none">
                    Explore
                  </h4>

                  <ul className="space-y-4 text-slate-400 text-sm">
                    <li>
                      <Link
                        href="/service-areas"
                        scroll={true}
                        className="hover:text-white transition"
                      >
                        Service Areas
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/pricing"
                        scroll={true}
                        className="hover:text-white transition"
                      >
                        Pricing
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/faqs"
                        scroll={true}
                        className="hover:text-white transition"
                      >
                        FAQs
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Support */}
                <div className="lg:pt-8 lg:ml-10">
                  <h4 className="font-bold mb-6 text-white text-lg leading-none">
                    Support
                  </h4>

                  <ul className="space-y-4 text-slate-400 text-sm">
                    <li>
                      <Link
                        href="/contact"
                        scroll={true}
                        className="hover:text-white transition"
                      >
                        Contact
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/careers"
                        scroll={true}
                        className="hover:text-white transition"
                      >
                        Careers
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/terms-and-conditions"
                        scroll={true}
                        className="hover:text-white transition whitespace-nowrap"
                      >
                        Terms & Conditions
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Copyright */}
              <div className="mt-14 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
                <p>
                  © {new Date().getFullYear()} Xpress Car Care. All rights
                  reserved.
                </p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}