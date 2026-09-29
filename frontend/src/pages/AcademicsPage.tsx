import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteNavbar } from "../components/SiteNavbar";
import { PageFooter } from "../components/PageFooter";
import { IMAGES } from "../assets/images";

const STAGES = [
  {
    name: "Early Years",
    range: "Play – KG",
    header: "bg-emerald-600",
    soft: "bg-emerald-50 border-emerald-200",
    desc: "A joyful start built on play, rhymes and good habits.",
    points: ["Play-based Bangla & English", "Numbers, rhymes & drawing", "Moral stories, PE & daily habits", "Oral interaction, no pressure tests"],
  },
  {
    name: "Primary School",
    range: "Class 1 – 5",
    header: "bg-blue-700",
    soft: "bg-blue-50 border-blue-200",
    desc: "Strong foundations in language, math and the world around.",
    points: ["Bangla, English & Math", "Science, ICT & environment", "Art, sports & moral studies", "Regular tests with progress reports"],
  },
  {
    name: "Secondary School",
    range: "Class 6 – 10",
    header: "bg-violet-700",
    soft: "bg-violet-50 border-violet-200",
    desc: "Board-focused preparation with labs, models and guidance.",
    points: ["Full board curriculum", "Physics, Chemistry, Biology labs", "Computer classes & Olympiad prep", "Model tests & career guidance"],
  },
];

const PILLARS = [
  { title: "Academic Excellence", desc: "Strong foundation in core subjects" },
  { title: "Critical Thinking", desc: "Independent and analytical thinking" },
  { title: "Creativity", desc: "Express and explore new ideas" },
  { title: "Character & Values", desc: "Honesty, respect and empathy" },
  { title: "Physical Development", desc: "Sports, games and healthy habits" },
  { title: "Digital Literacy", desc: "Technology used responsibly" },
];

export function AcademicsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700">
      <SiteNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={IMAGES.about.students} alt="Students learning" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/80 to-blue-950/30" />
        <div className="relative w-full px-6 sm:px-10 lg:px-14 pt-32 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white">Academics</h1>
          <div className="mt-4 w-14 h-1 bg-amber-400 rounded-full mx-auto" />
          <p className="mt-4 text-white/75 max-w-2xl mx-auto">
            A complete journey from Play to Class 10 — play-based early learning, a strong
            primary foundation, and SSC-focused secondary preparation.
          </p>
        </div>
      </section>

      {/* Stages */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-14 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {STAGES.map((s) => (
          <div key={s.name} className={`rounded-3xl border-2 ${s.soft} overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all`}>
            <div className={`${s.header} px-7 py-5`}>
              <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">{s.range}</p>
              <h2 className="text-2xl font-black text-white">{s.name}</h2>
            </div>
            <div className="p-7 flex-1">
              <p className="text-sm text-slate-600">{s.desc}</p>
              <ul className="mt-5 space-y-3">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      {/* Philosophy */}
      <section className="bg-sky-50/70 border-y border-sky-100">
        <div className="w-full px-6 sm:px-10 lg:px-14 py-14 text-center">
          <h2 className="text-3xl font-black text-blue-950">Learning Beyond the Classroom</h2>
          <p className="mt-3 text-sm text-slate-500 max-w-2xl mx-auto">
            Students ask questions, explore ideas, solve problems and grow with confidence.
          </p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 text-left">
            {PILLARS.map((p, i) => (
              <div key={p.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-lg font-black text-amber-500">0{i + 1}</p>
                <h3 className="mt-1 text-sm font-black text-blue-950">{p.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment & school hours */}
      <section className="w-full px-6 sm:px-10 lg:px-14 pb-14 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="rounded-3xl bg-blue-950 p-8 sm:p-10 text-white flex flex-col">
          <h2 className="text-2xl font-black">How We Assess Students</h2>
          <div className="mt-2 w-12 h-1 bg-amber-400 rounded-full" />
          <ul className="mt-6 space-y-4">
            {[
              ["Weekly class tests", "Short tests every week to keep every lesson fresh."],
              ["Monthly assessments", "Chapter-wise exams with report cards for parents."],
              ["Term examinations", "First-term, annual and board-style model tests."],
              ["Co-curricular grades", "Sports, arts, behavior and attendance also count."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center shrink-0 font-black text-sm">
                  ✓
                </span>
                <span>
                  <span className="block font-bold">{t}</span>
                  <span className="block text-sm text-white/60">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-8 sm:p-10 flex flex-col">
          <h2 className="text-2xl font-black text-blue-950">School Hours</h2>
          <div className="mt-2 w-12 h-1 bg-amber-400 rounded-full" />
          <div className="mt-6 space-y-3">
            {[
              ["Saturday – Thursday", "9:00 AM – 4:00 PM"],
              ["Morning assembly", "9:00 AM sharp"],
              ["Friday", "Closed"],
              ["Office hours", "Sat – Thu, 9AM – 4PM"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 bg-slate-50 rounded-2xl px-5 py-3.5">
                <span className="text-sm text-slate-500">{k}</span>
                <span className="text-sm font-black text-blue-950 whitespace-nowrap">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-slate-400 leading-relaxed">
            Play and KG run shorter, joyful days. Class routines are published in the student
            portal before every term.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full px-6 sm:px-10 lg:px-14 pb-14 text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-blue-950">Ready to join Little Star School?</h2>
        <p className="mt-2 text-slate-500">Admission open 2027, Play to Class 10.</p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/admission" className="px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-500 text-blue-950 font-bold transition">
            Apply for Admission
          </Link>
          <Link to="/contact" className="px-8 py-3.5 rounded-full border-2 border-blue-950/15 text-blue-950 font-bold hover:bg-blue-50 transition">
            Contact Us
          </Link>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
