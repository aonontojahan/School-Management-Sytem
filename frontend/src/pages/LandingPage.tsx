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

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Roles", href: "#roles" },
    { label: "Pricing", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Support", href: "#contact" },
    { label: "Status", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const handler = () => setY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return y;
}

function SectionHeader({ badge, title, desc }: { badge: string; title: string; desc?: string }) {
  return (
    <div className="text-center mb-14">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">{badge}</p>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{title}</h2>
      {desc && <p className="mt-3 text-slate-500 max-w-lg mx-auto">{desc}</p>}
    </div>
  );
}

function Icon({ path, className = "w-6 h-6" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export function LandingPage() {
  const scrollY = useScrollY();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrollY > 20 ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-200">
                S
              </div>
              <span className="font-extrabold text-slate-900 text-[15px] hidden sm:block">SchoolMS</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
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
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-300 transition-all duration-200"
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
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 mt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section id="home" className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
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
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              Sign in to Dashboard
              <Icon path="M13 7l5 5m0 0l-5 5m5-5H6" className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-center"
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
          <SectionHeader
            badge="Features"
            title="Everything you need"
            desc="A complete toolkit to run your school efficiently — from daily roll calls to annual reports."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className={`w-12 h-12 rounded-xl ${f.color} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon path={f.icon} />
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
          <SectionHeader
            badge="Role-Based Access"
            title="Built for every role"
            desc="Each user sees exactly what they need — no clutter, no confusion."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map((r) => (
              <div key={r.role} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
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
          <SectionHeader
            badge="How It Works"
            title="Up and running in minutes"
          />

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
                    <Icon path={t.icon} className="w-5 h-5 text-emerald-300 shrink-0" />
                    <span className="text-sm text-white/90">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Get in Touch"
            title="Contact us"
            desc="Have questions? We'd love to hear from you."
          />

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@school.edu"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us more about your inquiry..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                />
              </div>
              <div className="mt-6 flex justify-end">
                <button className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition-all duration-200 flex items-center gap-2">
                  Send Message
                  <Icon path="M13 7l5 5m0 0l-5 5m5-5H6" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 sm:p-14 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to get started?</h2>
              <p className="mt-4 text-indigo-100 text-lg">Sign in to access your school dashboard.</p>
              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Sign in to Dashboard
                  <Icon path="M13 7l5 5m0 0l-5 5m5-5H6" className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer id="contact" className="border-t border-slate-200 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-14">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-900/30">
                  S
                </div>
                <span className="font-extrabold text-white text-lg">SchoolMS</span>
              </Link>
              <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-sm">
                A comprehensive school management platform for administrators, teachers, students, and guardians.
                Streamline your school operations with modern technology.
              </p>
              <div className="mt-5 flex items-center gap-3">
                {/* Social Icons */}
                {[
                  { label: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                  { label: "Twitter", path: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
                  { label: "GitHub", path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    title={social.label}
                  >
                    <Icon path={social.path} className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-3">
                {FOOTER_LINKS.product.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-3">
                {FOOTER_LINKS.resources.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <Icon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-400">admin@schoolms.com</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon path="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-400">+880 123 456 789</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-400">Dhaka, Bangladesh</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              &copy; {currentYear} School Management System. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {FOOTER_LINKS.legal.map((link) => (
                <a key={link.label} href={link.href} className="text-xs text-slate-500 hover:text-white transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
