import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { IMAGES, FEATURE_GALLERY } from "../assets/images";
import { SiteNavbar } from "../components/SiteNavbar";
import { MiniFooter } from "../components/PageFooter";

function Icon({ path, className = "w-6 h-6" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-bold tracking-[0.22em] text-blue-700 uppercase">{children}</p>;
}

/* Playful doodles in the sample's vibe — light blue outline shapes */
function StarDoodle({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function CapDoodle({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
    </svg>
  );
}

const STATS = [
  { value: "5+", label: "Years of Excellence", bg: "bg-sky-100 text-sky-600", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07" },
  { value: "13", label: "Academic Levels", bg: "bg-amber-100 text-amber-600", icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" },
  { value: "3", label: "Learning Stages", bg: "bg-violet-100 text-violet-600", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { value: "6", label: "Core Values", bg: "bg-emerald-100 text-emerald-600", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

const VALUES = [
  { bg: "bg-emerald-100 text-emerald-600", title: "Integrity", desc: "Honesty and ethical behavior", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { bg: "bg-violet-100 text-violet-600", title: "Respect", desc: "Value and appreciate everyone", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { bg: "bg-amber-100 text-amber-600", title: "Discipline", desc: "Responsibility and consistency", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { bg: "bg-emerald-100 text-emerald-600", title: "Excellence", desc: "Continuous improvement", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { bg: "bg-pink-100 text-pink-600", title: "Empathy", desc: "Understand and care for others", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07" },
  { bg: "bg-orange-100 text-orange-600", title: "Curiosity", desc: "Ask, explore and discover", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
];

const STAGES = [
  { name: "Early Years", header: "bg-pink-100 text-pink-700", classes: ["Play", "Nursery", "KG"] },
  { name: "Primary School", header: "bg-emerald-100 text-emerald-700", classes: ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"] },
  { name: "Secondary School", header: "bg-sky-100 text-sky-700", classes: ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"] },
];

const PILLARS = [
  { bg: "bg-blue-100 text-blue-700", title: "Academic Excellence", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { bg: "bg-amber-100 text-amber-600", title: "Critical Thinking", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { bg: "bg-pink-100 text-pink-600", title: "Creativity & Innovation", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { bg: "bg-emerald-100 text-emerald-600", title: "Character & Values", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07" },
  { bg: "bg-sky-100 text-sky-600", title: "Physical Development", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { bg: "bg-orange-100 text-orange-600", title: "Digital Literacy", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
];

const FACILITIES = [
  { img: FEATURE_GALLERY[0].hero, label: "Modern Classrooms" },
  { img: FEATURE_GALLERY[4].hero, label: "Library" },
  { img: FEATURE_GALLERY[4].photos[1].src, label: "Computer Lab" },
  { img: FEATURE_GALLERY[1].hero, label: "Science Laboratory" },
  { img: FEATURE_GALLERY[2].hero, label: "Playground" },
  { img: FEATURE_GALLERY[3].photos[3].src, label: "Activity Rooms" },
];

const TEACHER_POINTS = [
  "Qualified and experienced faculty",
  "Subject-based instruction",
  "Individual student support",
  "Regular assessment and feedback",
  "Parent-teacher communication",
  "Continuous professional development",
];

export function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  return (
    <div className="min-h-screen bg-white font-sans text-slate-700 scroll-smooth">
      <SiteNavbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <img src={IMAGES.about.campus} alt="Little Star School campus" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/75 to-blue-950/25" />
        <div className="relative w-full px-6 sm:px-10 lg:px-14 pt-32 pb-20 sm:pb-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">About</h1>
            <h1 className="text-4xl sm:text-5xl font-black text-amber-300 leading-tight">Little Star School</h1>
            <div className="mt-4 w-14 h-1 bg-amber-400 rounded-full mx-auto" />
            <p className="mt-4 text-[15px] sm:text-base text-white/75 leading-relaxed max-w-xl mx-auto">
              Nurturing young minds, building bright futures through quality education,
              strong values, and endless opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* ── Who we are ───────────────────────────────────────────────────── */}
      <section id="story" className="w-full px-6 sm:px-10 lg:px-14 py-14 sm:py-16 scroll-mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-lg shadow-blue-100 border border-slate-100">
            <img src={IMAGES.about.campus} alt="School building" className="w-full h-72 lg:h-80 object-cover" loading="lazy" />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-blue-950 leading-tight">
              A Place Where Every Child Shines
            </h2>
            <div className="mt-3 w-14 h-1 bg-amber-400 rounded-full" />
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              Little Star School is a modern educational institution committed to providing quality
              education for children from Play to Class 10. We believe that every child has unique
              abilities, interests and potential. Through dedicated teachers, a supportive environment
              and engaging learning experiences, we help our students grow academically, socially,
              creatively and morally.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="bg-sky-50/70 border-y border-sky-100">
        <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 py-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-center justify-center gap-3">
              <span className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center shrink-0`}>
                <Icon path={s.icon} className="w-5 h-5" />
              </span>
              <span className="text-left">
                <span className="block text-xl font-black text-blue-950 leading-none">{s.value}</span>
                <span className="block text-[11px] text-slate-500 font-medium mt-1">{s.label}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission & Vision ─────────────────────────────────────────────── */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission */}
        <div className="group relative bg-white rounded-3xl border border-sky-100 shadow-[0_18px_50px_-20px_rgba(30,58,138,0.35)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(30,58,138,0.45)] transition-all duration-300">
          <div className="h-2 bg-gradient-to-r from-blue-800 via-blue-600 to-sky-400" />
          <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full bg-sky-100/70 blur-2xl" />
          <div className="relative p-8 sm:p-10">
            <div className="flex items-center gap-5">
              <span className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1.2" fill="currentColor" />
                </svg>
              </span>
              <div>
                <h3 className="text-2xl font-black text-blue-950">Our Mission</h3>
                <p className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase mt-1">What drives us every day</p>
              </div>
            </div>
            <div className="relative mt-6 pl-6 border-l-4 border-blue-100">
              <p className="text-[15px] text-slate-600 leading-[1.9]">
                To provide accessible, quality education that develops knowledgeable, confident,
                disciplined and compassionate individuals prepared to contribute positively to society.
              </p>
            </div>
          </div>
        </div>
        {/* Vision */}
        <div className="group relative bg-white rounded-3xl border border-amber-100 shadow-[0_18px_50px_-20px_rgba(217,119,6,0.35)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(217,119,6,0.45)] transition-all duration-300">
          <div className="h-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300" />
          <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full bg-amber-100/80 blur-2xl" />
          <div className="relative p-8 sm:p-10">
            <div className="flex items-center gap-5">
              <span className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-200 group-hover:scale-105 transition-transform">
                <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" className="w-8 h-8" />
              </span>
              <div>
                <h3 className="text-2xl font-black text-blue-950">Our Vision</h3>
                <p className="text-xs font-bold tracking-[0.2em] text-amber-500 uppercase mt-1">Where we are heading</p>
              </div>
            </div>
            <div className="relative mt-6 pl-6 border-l-4 border-amber-200">
              <p className="text-[15px] text-slate-600 leading-[1.9]">
                To become a trusted educational institution where every student is encouraged to
                discover their potential, pursue excellence and develop into a responsible citizen
                capable of making a positive difference in the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values + quote photo ─────────────────────────────────────────── */}
      <section id="values" className="w-full px-6 sm:px-10 lg:px-14 pb-14 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-blue-950">What We Stand For</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-xl">
              Our values guide everything we do at Little Star School. We strive to create a
              community built on integrity, respect, discipline and care.
            </p>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {VALUES.map((v) => (
                <div key={v.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center hover:shadow-md transition">
                  <span className={`w-10 h-10 rounded-full ${v.bg} flex items-center justify-center mx-auto`}>
                    <Icon path={v.icon} className="w-5 h-5" />
                  </span>
                  <p className="mt-2 text-[13px] font-black text-blue-950">{v.title}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img src={FEATURE_GALLERY[0].photos[2].src} alt="Student learning" className="w-full h-80 sm:h-96 object-cover" loading="lazy" />
            </div>
            <div className="absolute -bottom-5 left-5 right-5 sm:left-auto sm:right-8 sm:w-72 rounded-2xl bg-blue-950 text-white p-5 shadow-xl">
              <p className="text-lg font-black leading-snug">“Every child has the potential to shine.”</p>
              <StarDoodle className="w-5 h-5 text-amber-300 mt-2" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Academic journey ─────────────────────────────────────────────── */}
      <section id="journey" className="w-full px-6 sm:px-10 lg:px-14 py-14 scroll-mt-16 relative overflow-hidden">
        <CapDoodle className="hidden xl:block absolute right-16 top-10 w-16 h-16 text-sky-200" />
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-blue-950">From Early Years to Bright Futures</h2>
          <p className="mt-2 text-sm text-slate-500">A complete educational journey from Play to Class 10.</p>
        </div>
        <div className="mt-8 flex flex-col lg:flex-row items-stretch gap-3 max-w-6xl mx-auto">
          {STAGES.map((stage, i) => (
            <div key={stage.name} className="flex-1 flex flex-col lg:flex-row items-stretch gap-3">
              <div className="flex-1 rounded-2xl border border-slate-100 shadow-sm overflow-hidden bg-white">
                <p className={`py-2.5 text-center text-sm font-black ${stage.header}`}>{stage.name}</p>
                <div className="p-4 space-y-0 text-center">
                  {stage.classes.map((c) => (
                    <p key={c} className="py-1.5 text-[13px] font-medium text-slate-600 border-b border-slate-50 last:border-0">
                      {c}
                    </p>
                  ))}
                </div>
              </div>
              {i < STAGES.length - 1 && (
                <div className="flex items-center justify-center">
                  <span className="rotate-90 lg:rotate-0 w-9 h-9 rounded-full bg-blue-600/80 text-white flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Philosophy ───────────────────────────────────────────────────── */}
      <section id="philosophy" className="bg-sky-50/70 border-y border-sky-100 scroll-mt-16">
        <div className="w-full px-6 sm:px-10 lg:px-14 py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4">
            <h2 className="text-3xl font-black text-blue-950 leading-tight">Learning Beyond the Classroom</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              At Little Star School, education is more than textbooks and examinations. We aim to
              create an environment where students can ask questions, explore ideas, solve problems,
              collaborate with others and develop confidence.
            </p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {PILLARS.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                <span className={`w-11 h-11 rounded-full ${p.bg} flex items-center justify-center mx-auto`}>
                  <Icon path={p.icon} className="w-5 h-5" />
                </span>
                <p className="mt-2 text-xs font-black text-blue-950 leading-snug">{p.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Facilities ───────────────────────────────────────────────────── */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-14">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-blue-950">A Supportive Environment for Learning</h2>
        </div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {FACILITIES.map((f) => (
            <div key={f.label} className="group rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all bg-white">
              <div className="h-36 sm:h-40 overflow-hidden">
                <img src={f.img} alt={f.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <p className="py-2.5 text-center text-xs font-bold text-blue-950">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Teachers ─────────────────────────────────────────────────────── */}
      <section className="w-full px-6 sm:px-10 lg:px-14 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100">
              <img src={FEATURE_GALLERY[0].photos[1].src} alt="Teacher with students" className="w-full h-72 object-cover" loading="lazy" />
            </div>
          </div>
          <div className="lg:col-span-4">
            <Eyebrow>Our Teachers</Eyebrow>
            <h2 className="mt-2 text-3xl font-black text-blue-950 leading-tight">Dedicated Teachers, Inspiring Mentors</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Our teachers play a central role in creating a positive learning environment. They
              guide students, identify individual strengths and provide continuous academic support.
            </p>
            <Link to="/login" className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-500 text-blue-950 text-sm font-bold transition">
              Meet Our Teachers
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <div className="lg:col-span-4 rounded-2xl bg-sky-50/80 border border-sky-100 p-6">
            <ul className="space-y-3">
              {TEACHER_POINTS.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[13px] font-medium text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Principal's message ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-blue-950">
        <img src={IMAGES.about.campus} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-10" />
        <div className="relative w-full px-6 sm:px-10 lg:px-14 py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-w-[240px]">
              <img src={IMAGES.about.founder} alt="Principal" className="w-full h-64 object-cover" loading="lazy" />
            </div>
          </div>
          <div className="lg:col-span-9">
            <p className="text-xs font-bold tracking-[0.22em] text-amber-300 uppercase">Principal's Message</p>
            <p className="mt-3 text-lg sm:text-xl text-white font-medium leading-relaxed max-w-3xl">
              “Every child has the potential to shine. Our responsibility is to provide the
              environment, guidance and opportunities that help them discover that potential.”
            </p>
            <div className="mt-5">
              <p className="text-sm font-black text-white">Mr. Ahmed Rahman</p>
              <p className="text-xs text-white/60">Principal, Little Star School</p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a href="/#admission" className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-amber-400 hover:bg-amber-500 text-blue-950 text-sm font-bold transition">
                Apply for Admission
              </a>
              <Link to="/" className="inline-flex items-center justify-center px-7 py-3 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
      <MiniFooter />
    </div>
  );
}
