import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteNavbar } from "../components/SiteNavbar";
import { MiniFooter } from "../components/PageFooter";
import { NOTICES } from "../data/school";
import { FEATURE_GALLERY } from "../assets/images";

function tagHeader(tag: string) {
  if (tag === "Admission") return "bg-emerald-600";
  if (tag === "Exam") return "bg-amber-500";
  return "bg-indigo-700";
}

function tagPill(tag: string) {
  if (tag === "Admission") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (tag === "Exam") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-indigo-50 text-indigo-700 border-indigo-200";
}

function tagAction(tag: string) {
  if (tag === "Admission") return { label: "Apply for Admission", to: "/admission" };
  if (tag === "Exam") return { label: "Open Portal Login", to: "/login" };
  return { label: "Contact Office", to: "/contact" };
}

export function NoticesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700">
      <SiteNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={FEATURE_GALLERY[3].photos[2].src} alt="School events" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/80 to-blue-950/30" />
        <div className="relative w-full px-6 sm:px-10 lg:px-14 pt-32 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white">Notices & Events</h1>
          <div className="mt-4 w-14 h-1 bg-amber-400 rounded-full mx-auto" />
          <p className="mt-4 text-white/75 max-w-2xl mx-auto">
            Admission updates, exam routines and school events — always fresh from the office.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {NOTICES.map((n) => {
            const cta = tagAction(n.tag);
            return (
              <article key={n.title} className="rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full">
                <div className={`${tagHeader(n.tag)} px-7 py-5 flex items-center justify-between gap-3`}>
                  <div className="text-white">
                    <p className="text-2xl font-black leading-none">{n.date.split(" ")[0]} <span className="text-sm font-bold text-white/70">{n.date.split(" ")[1]}</span></p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">{n.tag}</p>
                  </div>
                  {n.date === NOTICES[0].date && (
                    <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-white text-[10px] font-black uppercase tracking-wider border border-white/30">
                      Latest
                    </span>
                  )}
                </div>
                <div className="p-7 flex flex-col flex-1">
                  <span className={`self-start px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${tagPill(n.tag)}`}>
                    {n.tag}
                  </span>
                  <h2 className="mt-3 font-black text-blue-950 text-lg leading-snug">{n.title}</h2>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{n.desc}</p>
                  <Link to={cta.to} className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-900 hover:gap-2.5 transition-all">
                    {cta.label}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* Gallery strip */}
        <h2 className="mt-14 text-2xl sm:text-3xl font-black text-blue-950 text-center">Campus Glimpses</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[FEATURE_GALLERY[0].hero, FEATURE_GALLERY[1].hero, FEATURE_GALLERY[2].hero, FEATURE_GALLERY[3].hero].map((src, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm h-44 group">
              <img src={src} alt="Campus glimpse" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/facilities" className="inline-flex px-8 py-3.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold transition">
            Explore All Facilities
          </Link>
        </div>
      </section>

      <MiniFooter />
    </div>
  );
}
