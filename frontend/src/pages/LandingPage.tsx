import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Attendance Tracking",
    desc: "Real-time daily attendance with PRESENT/ABSENT/LATE tracking, per-class reports, and monthly analytics.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    title: "Exam Management",
    desc: "Create exams, schedule routines, record marks, auto-calculate grades, GPA, and class positions.",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    title: "Fee Management",
    desc: "Bulk invoice generation, partial payments, due tracking, and automated monthly fee notifications.",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "bg-rose-50 text-rose-600 border-rose-200",
  },
  {
    title: "Salary Management",
    desc: "Define salary structures, auto-generate monthly payments, mark paid, and send teacher notifications.",
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
    color: "bg-violet-50 text-violet-600 border-violet-200",
  },
  {
    title: "Assignments",
    desc: "Create assignments, track submissions, auto-mark missing work, and notify students of deadlines.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    color: "bg-sky-50 text-sky-600 border-sky-200",
  },
  {
    title: "Financial Reports",
    desc: "Monthly revenue charts, fee vs salary analytics, yearly trends, and exportable financial summaries.",
    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
];

const ROLES = [
  {
    role: "Administrator",
    color: "from-red-500 to-red-600",
    shadow: "shadow-red-200",
    items: ["Full system control", "Manage students & teachers", "View all reports & analytics", "Fee & salary management"],
  },
  {
    role: "Teacher",
    color: "from-emerald-500 to-emerald-600",
    shadow: "shadow-emerald-200",
    items: ["Mark daily attendance", "Record exam marks", "Create assignments", "View salary details"],
  },
  {
    role: "Student",
    color: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-200",
    items: ["View class schedule", "Track attendance & grades", "Check fee invoices", "Submit assignments"],
  },
  {
    role: "Guardian",
    color: "from-amber-500 to-amber-600",
    shadow: "shadow-amber-200",
    items: ["Monitor child's attendance", "View academic progress", "Track fee payments", "Receive notifications"],
  },
];

const STATS = [
  { value: "5", label: "Classes (5–9)" },
  { value: "4", label: "User Roles" },
  { value: "100%", label: "Automated" },
  { value: "24/7", label: "Access" },
];

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const handler = () => setY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return y;
}

export function LandingPage() {
  const scrollY = useScrollY();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrollY > 20 ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-200">
                S
              </div>
              <span className="font-extrabold text-slate-900 text-[15px] hidden sm:block">School Management System</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Features</a>
              <a href="#roles" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Roles</a>
              <a href="#about" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">About</a>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
              >
                Sign in
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-indigo-200 transition"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Features</a>
              <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Roles</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">About</a>
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition">Sign in</Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-50 via-white to-white rounded-full blur-3xl opacity-70" />
          <div className="absolute top-20 right-0 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-40" />
          <div className="absolute top-40 left-0 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-700">School Management Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            One platform for the{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              whole school
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Manage attendance, exams, fees, salaries, and assignments — all in one place.
            Built for administrators, teachers, students, and guardians.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all text-center"
            >
              Sign in to Dashboard
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all text-center"
            >
              Explore Features
            </a>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Everything you need</h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">A complete toolkit to run your school efficiently — from daily roll calls to annual reports.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className={`w-12 h-12 rounded-xl ${f.color} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ────────────────────────────────────────────────────────── */}
      <section id="roles" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Role-Based Access</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Built for every role</h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">Each user sees exactly what they need — no clutter, no confusion.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map((r) => (
              <div key={r.role} className={`bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}>
                <div className={`bg-gradient-to-r ${r.color} p-5 text-white ${r.shadow} shadow-lg`}>
                  <h3 className="font-bold text-lg">{r.role}</h3>
                </div>
                <ul className="p-5 space-y-3">
                  {r.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Up and running in minutes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Sign In", desc: "Log in with your school credentials. Admins, teachers, students, and guardians each get their own dashboard." },
              { step: "02", title: "Set Up", desc: "Admins create classes, subjects, and assign teachers. Fee types and salary structures are configured once." },
              { step: "03", title: "Manage Daily", desc: "Mark attendance, record exam marks, track fees, and generate reports — everything syncs automatically." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg mx-auto mb-4 shadow-lg shadow-indigo-200">
                  {s.step}
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{s.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About / Tech Stack ───────────────────────────────────────────── */}
      <section id="about" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 sm:p-14 text-white overflow-hidden relative">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-3">About the System</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                  Modern school management,<br />built with modern tech.
                </h2>
                <p className="mt-4 text-indigo-100 leading-relaxed">
                  A full-stack web application built with FastAPI, React, and PostgreSQL.
                  Features JWT authentication, role-based access control, automated monthly cron jobs, and real-time notifications.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {["FastAPI", "React", "TypeScript", "PostgreSQL", "Tailwind CSS", "JWT Auth"].map((t) => (
                    <span key={t} className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-semibold text-white/90">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", label: "JWT-secured API with refresh tokens" },
                  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Role-based access control (RBAC)" },
                  { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", label: "Automated monthly fee & salary generation" },
                  { icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", label: "Real-time in-app notifications" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                    <svg className="w-5 h-5 text-emerald-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                    </svg>
                    <span className="text-sm text-white/90">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Ready to get started?</h2>
          <p className="mt-4 text-slate-500 text-lg">Sign in to access your school dashboard.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
            >
              Sign in to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-black text-xs">S</div>
              <span className="font-bold text-slate-900 text-sm">School Management System</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-sm text-slate-500 hover:text-indigo-600 transition">Features</a>
              <a href="#roles" className="text-sm text-slate-500 hover:text-indigo-600 transition">Roles</a>
              <a href="#about" className="text-sm text-slate-500 hover:text-indigo-600 transition">About</a>
            </div>
            <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} School Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
