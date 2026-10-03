import { useState } from "react";
import { Link } from "react-router-dom";
import { IMAGES, FEATURE_GALLERY } from "../assets/images";
import { SiteNavbar } from "../components/SiteNavbar";
import { PageFooter } from "../components/PageFooter";
import { AdmissionForm } from "../components/ui/AdmissionForm";

const FEATURES = [
  {
    title: "Academic Excellence",
    desc: "Outstanding board results with dedicated faculty and a structured Play to Class 10 curriculum.",
    stat: "95%+",
    statLabel: "Pass Rate",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    hero: FEATURE_GALLERY[0].hero,
  },
  {
    title: "Science & Innovation Lab",
    desc: "Physics, Chemistry and Biology labs with weekly hands-on experiments and a yearly science fair.",
    stat: "3",
    statLabel: "Smart Labs",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    hero: FEATURE_GALLERY[1].hero,
  },
  {
    title: "Sports & Athletics",
    desc: "Cricket, football, basketball and athletics with professional coaching and district titles.",
    stat: "20+",
    statLabel: "Trophies Won",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    hero: FEATURE_GALLERY[2].hero,
  },
  {
    title: "Arts & Culture",
    desc: "Art, music, drama and yearly cultural festivals where every child discovers creativity.",
    stat: "12+",
    statLabel: "Events Yearly",
    icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
    hero: FEATURE_GALLERY[3].hero,
  },
  {
    title: "Digital Library",
    desc: "10,000+ books, e-learning resources and quiet reading spaces with internet access.",
    stat: "10K+",
    statLabel: "Books & Resources",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    hero: FEATURE_GALLERY[4].hero,
  },
  {
    title: "Safe Campus",
    desc: "CCTV-monitored, inclusive campus where every student feels welcome and protected.",
    stat: "100%",
    statLabel: "Secure Campus",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    hero: FEATURE_GALLERY[5].hero,
  },
];

const PROGRAMS = [
  {
    class: "Play – KG",
    range: "Early Learning",
    header: "bg-emerald-600",
    subjects: ["Play-based Bangla & English", "Numbers, rhymes & drawing", "Moral stories, PE & habits"],
    size: "Small classes, caring teachers",
  },
  {
    class: "Primary (1 – 5)",
    range: "Foundation",
    header: "bg-blue-700",
    subjects: ["Bangla, English, Math", "Science, ICT & environment", "Art, sports & moral studies"],
    size: "Regular tests & progress reports",
  },
  {
    class: "High School (6 – 10)",
    range: "Board Prep",
    header: "bg-violet-700",
    subjects: ["Full board curriculum", "Science lab & computer classes", "Model tests & career guidance"],
    size: "SSC-focused preparation",
  },
];

function Icon({ path, className = "w-6 h-6" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

/* Academics-page style header: centered navy title, amber divider, slate subtitle */
function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight">{title}</h2>
      <div className="mt-4 w-14 h-1 bg-amber-400 rounded-full mx-auto" />
      {sub && <p className="mt-4 text-slate-500 max-w-3xl mx-auto leading-relaxed">{sub}</p>}
    </div>
  );
}

function ArrowIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

export function LandingPage() {
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700 scroll-smooth">
      <SiteNavbar />

      {/* ── Hero — VIDEO UNCHANGED, text centered ──────────────────────────── */}
      <section id="home" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden isolate">
        {/* Video Background */}
        <div className="absolute inset-0 z-[-1] bg-slate-950">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src="/video/hero.mp4"
          />
          {/* Dark overlay — slightly stronger so centered text stays readable */}
          <div className="absolute inset-0 bg-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/80" />
          {/* Animated gradient mesh */}
          <div className="absolute inset-0 animate-gradient-1 bg-[radial-gradient(ellipse_at_20%_50%,rgba(99,102,241,0.3),transparent_60%)]" />
          <div className="absolute inset-0 animate-gradient-2 bg-[radial-gradient(ellipse_at_80%_20%,rgba(139,92,246,0.25),transparent_60%)]" />
          <div className="absolute inset-0 animate-gradient-3 bg-[radial-gradient(ellipse_at_60%_80%,rgba(59,130,246,0.2),transparent_60%)]" />
          {/* Floating orbs */}
          <div className="absolute top-[15%] left-[10%] w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[15%] w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="w-full px-4 sm:px-8 lg:px-12 py-24">
          <div className="max-w-none text-center">
            {/* School name — center, wide */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02] text-white drop-shadow-2xl">
              Little Star{" "}
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                School
              </span>
            </h1>

            <p className="mt-5 text-xl sm:text-2xl font-semibold text-white tracking-wide">
              Nurturing Minds, Building Futures
            </p>

            <p className="mt-5 text-base sm:text-xl text-white/75 max-w-6xl mx-auto leading-relaxed">
              Welcome to the official website of Little Star School, Bhendabari, Pirgonj, Rangpur —
              a fully automated school management system for students, teachers and admin.
              Attendance, results, fees, routines and notices — everything runs online, from Play to Class 10.
            </p>

            {/* Simple info line */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[15px] font-medium text-white/80">
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Bhendabari, Pirgonj, Rangpur
              </span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-white/40" />
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Play – Class 10
              </span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-white/40" />
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                5+ Years of Excellence
              </span>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowAdmissionForm(true)}
                className="group w-full sm:w-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-900/40 hover:shadow-emerald-500/30 transition-all duration-300 text-center flex items-center justify-center gap-2 hover:scale-105 text-base"
              >
                Apply for Admission 2027
                <Icon path="M13 7l5 5m0 0l-5 5m5-5H6" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#programs"
                className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 text-center whitespace-nowrap text-base"
              >
                Explore School
              </a>
            </div>


          </div>
        </div>

      </section>

      {/* ── About preview ────────────────────────────────────────────────── */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-16 sm:py-20 bg-white">
        <SectionHead
          title="Welcome to Little Star School"
          sub="A modern school in Bhendabari, Pirgonj, Rangpur — quality education from Play to Class 10, run on a fully automated campus system."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="relative rounded-3xl overflow-hidden group min-h-[300px] shadow-lg shadow-blue-100">
            <img src={IMAGES.about.campus} alt="Little Star School campus" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-950/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-xs font-bold text-amber-300 uppercase tracking-[0.2em]">Bhendabari, Pirgonj, Rangpur</p>
              <p className="mt-1 text-lg font-extrabold text-white">Play to Class 10 • 5+ Years of Excellence</p>
            </div>
          </div>
          <div className="rounded-3xl bg-sky-50/70 border border-sky-100 p-8 sm:p-10 flex flex-col justify-center">
            <h3 className="text-2xl font-black text-blue-950">A Place Where Every Child Shines</h3>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Dedicated teachers, a safe and caring campus, and engaging learning experiences help
              our students grow academically, socially, creatively and morally — with attendance,
              results, fees and notices managed online for students, teachers and admin.
            </p>
            <div className="mt-6">
              <Link to="/about" className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold transition">
                Discover Our School <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Programs preview ─────────────────────────────────────────────── */}
      <section id="programs" className="w-full px-6 sm:px-10 lg:px-14 py-16 sm:py-20 bg-sky-50/70 border-y border-sky-100 scroll-mt-16">
        <SectionHead
          title="Academic Programs"
          sub="A complete journey from Play to Class 10 — play-based early learning, a strong primary foundation, and SSC-focused secondary preparation."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PROGRAMS.map((p) => (
            <div key={p.class} className="rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full">
              <div className={`${p.header} px-7 py-5`}>
                <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">{p.range}</p>
                <h3 className="text-xl font-black text-white">{p.class}</h3>
              </div>
              <div className="p-7 flex flex-col flex-1">
                <ul className="space-y-2.5">
                  {p.subjects.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs font-semibold text-slate-400">{p.size}</p>
                <button onClick={() => setShowAdmissionForm(true)} className="mt-auto pt-6">
                  <span className="block w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-700 hover:text-white text-blue-800 text-sm font-bold transition text-center">
                    Apply for {p.class}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/academics" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold transition">
            View Full Academics <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* ── Facilities preview ───────────────────────────────────────────── */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-16 sm:py-20 bg-white">
        <SectionHead
          title="School Facilities"
          sub="Labs, library, sports, arts and a safe campus — everything your child needs to learn and grow."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              to="/facilities"
              className="group rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full"
            >
              <div className="relative h-48 overflow-hidden shrink-0">
                <img src={f.hero} alt={f.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                  <span className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <Icon path={f.icon} className="w-5 h-5 text-white" />
                  </span>
                  <span className="text-right">
                    <span className="block text-xl font-black text-white leading-none">{f.stat}</span>
                    <span className="block text-[11px] font-medium text-white/70 mt-1">{f.statLabel}</span>
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-black text-blue-950">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed line-clamp-2">{f.desc}</p>
                <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700">
                  Explore facility <ArrowIcon className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/facilities" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold transition">
            Explore All Facilities <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* ── Admission CTA ────────────────────────────────────────────────── */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-16 sm:py-20 bg-white">
        <div className="rounded-3xl bg-blue-950 px-8 py-12 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-100">
          <div className="text-center lg:text-left">
            <p className="text-xs font-bold text-amber-300 uppercase tracking-[0.2em]">Admissions Open 2027 — Limited Seats</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-white">Give Your Child the Best Start</h2>
            <p className="mt-2 text-white/60">Play to Class 10 in Bhendabari, Pirgonj, Rangpur. Apply in 2 minutes — no payment needed.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setShowAdmissionForm(true)}
              className="px-8 py-4 bg-amber-400 hover:bg-amber-500 text-blue-950 font-extrabold rounded-2xl transition-all shadow-xl"
            >
              Apply Now — Free
            </button>
            <Link to="/admission" className="px-8 py-4 rounded-2xl border-2 border-white/25 text-white font-bold text-center hover:bg-white/10 transition-all">
              How Admission Works
            </Link>
          </div>
        </div>
      </section>

      <PageFooter />

      {/* ── Admission Form Modal ──────────────────────────────────────────── */}
      {showAdmissionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" onClick={() => setShowAdmissionForm(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full h-[85vh] bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AdmissionForm onClose={() => setShowAdmissionForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
