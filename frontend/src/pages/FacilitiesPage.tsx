import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteNavbar } from "../components/SiteNavbar";
import { PageFooter } from "../components/PageFooter";
import { FeatureModal } from "../components/ui/FeatureModal";
import { FEATURES } from "../data/school";
import { FEATURE_GALLERY } from "../assets/images";

function Icon({ path, className = "w-6 h-6" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export function FacilitiesPage() {
  const [selected, setSelected] = useState<(typeof FEATURES)[number] | null>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700">
      <SiteNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={FEATURE_GALLERY[0].hero} alt="School facilities" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/80 to-blue-950/30" />
        <div className="relative w-full px-6 sm:px-10 lg:px-14 pt-32 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white">Facilities</h1>
          <div className="mt-4 w-14 h-1 bg-amber-400 rounded-full mx-auto" />
          <p className="mt-4 text-white/75 max-w-2xl mx-auto">
            Labs, library, sports, arts and a safe campus — tap any card for photos and details.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-14 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <button
            key={f.title}
            onClick={() => setSelected(f)}
            className="group text-left rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className="relative h-52 overflow-hidden">
              <img src={f.hero} alt={f.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-950/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                <span className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <Icon path={f.icon} className="w-5 h-5 text-white" />
                </span>
                <span className="text-right">
                  <span className="block text-2xl font-black text-white">{f.stat}</span>
                  <span className="block text-[11px] font-medium text-white/70">{f.statLabel}</span>
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-black text-blue-950 text-lg">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed line-clamp-2">{f.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700">
                View photos & details
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </button>
        ))}
      </section>

      {/* Campus info strip */}
      <section className="w-full px-6 sm:px-10 lg:px-14 pb-14">
        <div className="rounded-3xl bg-sky-50/70 border border-sky-100 px-8 py-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            ["Visit Us", "Bhendabari, Pirgonj, Rangpur"],
            ["School Hours", "Sat – Thu, 9AM – 4PM"],
            ["Transport", "Bhendabari, Pirgonj & nearby villages"],
            ["Safety", "CCTV campus • Fire drills • First aid"],
          ].map(([t, d]) => (
            <div key={t} className="flex items-center gap-4">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span>
                <span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{t}</span>
                <span className="block mt-0.5 font-bold text-blue-950">{d}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full px-6 sm:px-10 lg:px-14 pb-14 text-center">
        <div className="rounded-3xl bg-blue-950 px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">See it in person — visit our campus</h2>
          <p className="mt-2 text-white/60 text-sm">Bhendabari, Pirgonj, Rangpur • Sat – Thu, 9AM – 4PM</p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/admission" className="px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-500 text-blue-950 font-bold transition">
              Apply for Admission
            </Link>
            <Link to="/contact" className="px-8 py-3.5 rounded-full border-2 border-white/25 text-white font-bold hover:bg-white/10 transition">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <PageFooter />

      <FeatureModal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ""}
        description={selected?.desc ?? ""}
        hero={selected?.hero ?? ""}
        photos={selected?.photos ?? []}
        details={selected?.details ?? []}
        stat={selected?.stat ?? ""}
        statLabel={selected?.statLabel ?? ""}
      />
    </div>
  );
}
