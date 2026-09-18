import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IMAGES, FEATURE_GALLERY } from "../assets/images";
import { FeatureModal } from "../components/ui/FeatureModal";
import { AdmissionForm } from "../components/ui/AdmissionForm";

const FEATURES = [
  {
    title: "Academic Excellence",
    desc: "Our students consistently achieve outstanding results in national examinations. With a dedicated faculty and structured curriculum, we ensure every student reaches their full potential.",
    stat: "95%+",
    statLabel: "Pass Rate",
    gradient: "from-blue-600 to-indigo-700",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    hero: FEATURE_GALLERY[0].hero,
    photos: FEATURE_GALLERY[0].photos,
    details: [
      "95%+ pass rate in national board exams",
      "Dedicated faculty with advanced degrees",
      "Structured curriculum from Class 5 to 9",
      "Regular parent-teacher progress meetings",
      "Remedial classes for struggling students",
      "Honors program for advanced learners",
    ],
  },
  {
    title: "Science & Innovation Lab",
    desc: "Fully equipped science laboratories for Physics, Chemistry, and Biology. Students engage in hands-on experiments and innovative research projects throughout the year.",
    stat: "3",
    statLabel: "Smart Labs",
    gradient: "from-emerald-600 to-teal-600",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    hero: FEATURE_GALLERY[1].hero,
    photos: FEATURE_GALLERY[1].photos,
    details: [
      "3 fully equipped science laboratories",
      "Physics, Chemistry, and Biology labs",
      "Weekly hands-on experiment sessions",
      "Annual science fair and innovation expo",
      "STEM enrichment programs",
      "Digital microscopes and modern equipment",
    ],
  },
  {
    title: "Sports & Athletics",
    desc: "A champion in district-level sports tournaments. Our athletic program includes cricket, football, basketball, swimming, and athletics with professional coaching.",
    stat: "20+",
    statLabel: "Trophies Won",
    gradient: "from-orange-500 to-red-500",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    hero: FEATURE_GALLERY[2].hero,
    photos: FEATURE_GALLERY[2].photos,
    details: [
      "20+ district-level tournament trophies",
      "Cricket, football, basketball, and athletics",
      "Professional coaching staff",
      "Annual sports day and inter-school meets",
      "Fitness and physical education classes",
      "Swimming pool and running track",
    ],
  },
  {
    title: "Arts & Cultural Programs",
    desc: "Celebrating creativity through art exhibitions, music recitals, drama performances, and annual cultural festivals. Every child discovers their artistic side.",
    stat: "12+",
    statLabel: "Events Yearly",
    gradient: "from-purple-600 to-pink-600",
    icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
    hero: FEATURE_GALLERY[3].hero,
    photos: FEATURE_GALLERY[3].photos,
    details: [
      "12+ cultural events every year",
      "Art exhibitions and music recitals",
      "Annual cultural festival and drama nights",
      "Dance, painting, and craft workshops",
      "Debate and public speaking clubs",
      "Field trips to museums and galleries",
    ],
  },
  {
    title: "Digital Library",
    desc: "Over 10,000 books, digital resources, and e-learning materials. A quiet, modern reading space with internet access for research and self-study.",
    stat: "10K+",
    statLabel: "Books & Resources",
    gradient: "from-amber-500 to-orange-500",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    hero: FEATURE_GALLERY[4].hero,
    photos: FEATURE_GALLERY[4].photos,
    details: [
      "10,000+ books and digital resources",
      "E-learning materials and online databases",
      "Quiet reading zones and study carrels",
      "High-speed internet for research",
      "Book clubs and reading challenges",
      "Inter-library loan partnerships",
    ],
  },
  {
    title: "Safe & Inclusive Campus",
    desc: "CCTV-monitored campus with strict safety protocols. We foster an inclusive environment where every student feels welcome, respected, and valued.",
    stat: "100%",
    statLabel: "Secure Campus",
    gradient: "from-rose-500 to-pink-600",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    hero: FEATURE_GALLERY[5].hero,
    photos: FEATURE_GALLERY[5].photos,
    details: [
      "24/7 CCTV surveillance across campus",
      "Strict visitor check-in protocols",
      "Anti-bullying and inclusion programs",
      "Counseling and mental health support",
      "Fire safety and emergency drills",
      "Wheelchair-accessible facilities",
    ],
  },
];

const STATS = [
  { value: "500+", label: "Students" },
  { value: "30+", label: "Expert Teachers" },
  { value: "95%", label: "Pass Rate" },
  { value: "20+", label: "Years Legacy" },
];

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Admission", href: "#admission" },
  { label: "Contact", href: "#contact" },
];

const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Admission", href: "#admission" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  resources: [
    { label: "School Calendar", href: "#" },
    { label: "Student Portal", href: "#" },
    { label: "Parent Guide", href: "#" },
    { label: "Support", href: "#contact" },
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
  const [selectedFeature, setSelectedFeature] = useState<(typeof FEATURES)[number] | null>(null);
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrollY > 20
            ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100"
            : "bg-slate-950/80 backdrop-blur-md border-b border-white/10"
        }`}
      >
        <div className="w-full px-6 sm:px-10 lg:px-14">
          <div className="flex items-center justify-between h-16">
            {/* Logo — Left */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-200">
                S
              </div>
              <span className={`font-extrabold text-[15px] hidden sm:block ${scrollY > 20 ? "text-slate-900" : "text-white"}`}>School Management System</span>
            </Link>

            {/* Right side — Nav + Login */}
            <div className="flex items-center gap-1">
              {/* Nav Links */}
              <div className="hidden lg:flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      scrollY > 20
                        ? "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Divider */}
              <div className={`hidden lg:block w-px h-6 mx-2 ${scrollY > 20 ? "bg-slate-200" : "bg-white/20"}`} />

              {/* Login Button */}
              <Link
                to="/login"
                className={`hidden lg:inline-flex px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  scrollY > 20
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200"
                    : "bg-white text-slate-900 hover:bg-white/90 shadow-lg shadow-black/20"
                }`}
              >
                Login
              </Link>

              {/* Mobile hamburger */}
              <button
                className={`lg:hidden p-2 rounded-lg transition ${scrollY > 20 ? "hover:bg-slate-100" : "hover:bg-white/10"}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <svg className={`w-5 h-5 ${scrollY > 20 ? "text-slate-600" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className={`w-5 h-5 ${scrollY > 20 ? "text-slate-600" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 shadow-lg">
            <div className="px-6 py-4 space-y-1">
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
              <div className="pt-3 mt-3 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section id="home" className="relative min-h-[92vh] flex items-center overflow-hidden isolate">
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
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-slate-900/50 to-purple-950/60" />
          {/* Animated gradient mesh */}
          <div className="absolute inset-0 animate-gradient-1 bg-[radial-gradient(ellipse_at_20%_50%,rgba(99,102,241,0.3),transparent_60%)]" />
          <div className="absolute inset-0 animate-gradient-2 bg-[radial-gradient(ellipse_at_80%_20%,rgba(139,92,246,0.25),transparent_60%)]" />
          <div className="absolute inset-0 animate-gradient-3 bg-[radial-gradient(ellipse_at_60%_80%,rgba(59,130,246,0.2),transparent_60%)]" />
          {/* Floating orbs */}
          <div className="absolute top-[15%] left-[10%] w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[15%] w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="w-full px-6 sm:px-10 lg:px-14 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Text Content */}
            <div className="text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-full mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-300">Admission Open 2027</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                Nurturing Minds,{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Building Futures
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-lg leading-relaxed">
                Empowering students from Class 5 to 9 with quality education, modern facilities, and a nurturing environment since 2005.
              </p>

              {/* CTA buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                <a
                  href="#admission"
                  className="group px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-900/30 hover:shadow-emerald-500/30 transition-all duration-300 text-center flex items-center gap-2 hover:scale-105"
                >
                  Apply for Admission 2027
                  <Icon path="M13 7l5 5m0 0l-5 5m5-5H6" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#features"
                  className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 text-center"
                >
                  Explore Campus
                </a>
              </div>

              {/* Stats */}
              <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {STATS.map((s) => (
                  <div key={s.label} className="text-center sm:text-left">
                    <p className="text-2xl sm:text-3xl font-extrabold text-white">{s.value}</p>
                    <p className="text-xs text-white/50 mt-1 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Floating Glass Cards */}
            <div className="hidden lg:block relative h-[500px]">
              {/* Main dashboard preview card */}
              <div className="absolute top-[10%] left-[5%] w-[85%] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl animate-float">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-white/50 font-medium">Dashboard</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-2xl font-bold text-white">523</p>
                    <p className="text-[10px] text-white/50">Students</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-2xl font-bold text-emerald-400">98%</p>
                    <p className="text-[10px] text-white/50">Attendance</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-2xl font-bold text-blue-400">4.8</p>
                    <p className="text-[10px] text-white/50">Avg GPA</p>
                  </div>
                </div>
                {/* Mini chart */}
                <div className="bg-white/5 rounded-xl p-3 flex items-end gap-1 h-16">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-400 rounded-sm opacity-80" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              {/* Floating notification card */}
              <div className="absolute top-[5%] right-[0%] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Exam Results</p>
                    <p className="text-[10px] text-white/50">Published successfully</p>
                  </div>
                </div>
              </div>

              {/* Floating fee card */}
              <div className="absolute bottom-[15%] left-[0%] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl animate-float-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Fee Collection</p>
                    <p className="text-[10px] text-white/50">৳2,45,000 this month</p>
                  </div>
                </div>
              </div>

              {/* Floating attendance card */}
              <div className="absolute bottom-[5%] right-[5%] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Attendance</p>
                    <p className="text-[10px] text-white/50">96% present today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-white/40 font-medium">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="relative py-20 sm:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(99,102,241,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(139,92,246,0.1),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative w-full px-6 sm:px-10 lg:px-14">
          {/* Header */}
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">What makes us different</h2>
            <p className="mt-3 text-slate-400 max-w-lg mx-auto">Discover the programs and facilities that make our school a place where students thrive.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <button
                key={f.title}
                onClick={() => setSelectedFeature(f)}
                className="relative group rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 text-left"
              >
                {/* Image Header */}
                <div className="relative h-44 overflow-hidden bg-slate-800">
                  <img
                    src={f.hero}
                    alt={f.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                  {/* Icon & Stat Overlay */}
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                      <Icon path={f.icon} className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-white drop-shadow-lg">{f.stat}</p>
                      <p className="text-[11px] font-medium text-white/60">{f.statLabel}</p>
                    </div>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{f.desc}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 group-hover:gap-2.5 transition-all">
                    View details
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom highlight strip */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", label: "National Award Winner" },
              { icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", label: "500+ Students" },
              { icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", label: "30+ Expert Teachers" },
              { icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Established 2005" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-3 hover:bg-white/10 transition-all">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon path={item.icon} className="w-4.5 h-4.5 text-indigo-400" />
                </div>
                <span className="text-xs font-semibold text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section id="about" className="relative py-24 sm:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(139,92,246,0.06),transparent_50%)]" />
        </div>

        <div className="relative w-full px-6 sm:px-10 lg:px-14">
          {/* ── Centered Header ── */}
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none">
              About <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Us</span>
            </h2>
            <div className="mt-6 w-20 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full mx-auto" />
            <p className="mt-8 text-[17px] text-slate-300 max-w-2xl mx-auto leading-[1.8]">
              Established in 2005, our school has grown from a small institution with 45 students into a thriving community of over 500 learners. We are dedicated to <span className="text-white font-medium">academic excellence</span>, <span className="text-white font-medium">character building</span>, and preparing students for a changing world.
            </p>
            <p className="mt-5 text-[15px] text-slate-500 max-w-xl mx-auto leading-[1.8]">
              With modern facilities, passionate educators, and a curriculum designed for the future, we provide a nurturing environment where every child can discover their strengths and pursue their dreams.
            </p>
          </div>

          {/* ── Stats Bar ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/10 mb-20 max-w-5xl mx-auto">
            {[
              { value: "500+", label: "Students Enrolled", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
              { value: "30+", label: "Qualified Teachers", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
              { value: "95%", label: "Board Pass Rate", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
              { value: "5", label: "Classes (5-9)", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-950 px-6 py-8 text-center group">
                <Icon path={s.icon} className="w-5 h-5 text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Vision / Mission / Motto ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20 max-w-6xl mx-auto">
            {[
              {
                title: "Our Vision",
                desc: "To be a leading institution that empowers students with knowledge, skills, and values to become responsible global citizens who contribute meaningfully to society.",
                icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
                accent: "from-emerald-500 to-teal-500",
              },
              {
                title: "Our Mission",
                desc: "To provide a nurturing and stimulating environment where every student discovers their potential, develops critical thinking, and builds a strong foundation for lifelong success.",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                accent: "from-blue-500 to-indigo-500",
              },
              {
                title: "Our Motto",
                desc: "Knowledge, Character, Service — We believe education goes beyond textbooks. It shapes character, inspires integrity, and fosters a spirit of service to the community.",
                icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
                accent: "from-amber-500 to-orange-500",
              },
            ].map((item) => (
              <div key={item.title} className="group bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.06] transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.accent} flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon path={item.icon} className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-[1.75]">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* ── Founder Card ── */}
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-3xl overflow-hidden">
              {/* Top gradient strip */}
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

              <div className="p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-10">
                {/* Photo */}
                <div className="shrink-0">
                  <div className="relative">
                    <img
                      src={IMAGES.about.founder}
                      alt="Mr. Rahman Ahmed"
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-2xl border border-white/10"
                      loading="lazy"
                    />
                    {/* Badge */}
                    <div className="absolute -bottom-3 -right-3 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-indigo-500/30">
                      Founder
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-2xl font-black text-white tracking-tight">Mr. Rahman Ahmed</h3>
                  <p className="text-sm text-indigo-400 font-medium mt-1">Educationist & Visionary Leader</p>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-[0.15em]">Vision</p>
                        <p className="text-[13px] text-slate-400 leading-[1.75] mt-0.5">To create a learning community where every child is empowered to achieve academic excellence and become a responsible citizen.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon path="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-amber-400 uppercase tracking-[0.15em]">Motto</p>
                        <p className="text-[13px] text-slate-400 leading-[1.75] mt-0.5">"Every child deserves the opportunity to learn, grow, and succeed. We build character, nurture curiosity, and set the standard for excellence."</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Admission ──────────────────────────────────────────────────── */}
      <section id="admission" className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden py-20">
        {/* Background */}
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(16,185,129,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(59,130,246,0.06),transparent_50%)]" />
        </div>

        <div className="relative w-full px-6 sm:px-10 lg:px-14">
          <div className="max-w-6xl mx-auto">
            {/* Centered Heading */}
            <div className="text-center mb-10">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                Admission
              </h2>
              <div className="mt-4 w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Photo Side */}
              <div className="relative rounded-3xl overflow-hidden group">
                <img
                  src={IMAGES.about.campus}
                  alt="School Campus"
                  className="w-full h-[340px] lg:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Admissions Open</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">Give Your Child the Best Start</h3>
                  <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">Join 500+ students thriving in academics, sports, and co-curricular activities.</p>
                </div>
              </div>

              {/* Info Side */}
              <div className="space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: "500+", label: "Students", color: "text-emerald-400" },
                    { value: "30+", label: "Teachers", color: "text-blue-400" },
                    { value: "95%", label: "Pass Rate", color: "text-violet-400" },
                    { value: "20+", label: "Years", color: "text-amber-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-center">
                      <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Info Bullets */}
                <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 space-y-3">
                  {[
                    { icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342", text: "Classes 5 to 9 with English medium curriculum" },
                    { icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z", text: "Merit & need-based scholarships available" },
                    { icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", text: "Safe campus with modern facilities" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Icon path={item.icon} className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <p className="text-sm text-slate-300">{item.text}</p>
                    </div>
                  ))}
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => setShowAdmissionForm(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all duration-200"
                >
                  Apply Now
                  <Icon path="M13 7l5 5m0 0l-5 5m5-5H6" className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer id="contact" className="border-t border-slate-200 bg-slate-900 text-white">
        <div className="w-full px-6 sm:px-10 lg:px-14">
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
                  <Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-400">42 Education Avenue, Mirpur-10, Dhaka 1216</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon path="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-400">+880 123 456 789</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon path="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-400">info@schoolms.edu</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon path="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-400">Sun – Thu: 8AM – 4PM</span>
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

      {/* ── Feature Detail Modal ──────────────────────────────────────────── */}
      <FeatureModal
        open={selectedFeature !== null}
        onClose={() => setSelectedFeature(null)}
        title={selectedFeature?.title ?? ""}
        description={selectedFeature?.desc ?? ""}
        hero={selectedFeature?.hero ?? ""}
        photos={selectedFeature?.photos ?? []}
        details={selectedFeature?.details ?? []}
        stat={selectedFeature?.stat ?? ""}
        statLabel={selectedFeature?.statLabel ?? ""}
      />

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
