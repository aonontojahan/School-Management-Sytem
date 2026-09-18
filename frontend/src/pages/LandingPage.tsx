import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IMAGES, FEATURE_GALLERY } from "../assets/images";
import { FeatureModal } from "../components/ui/FeatureModal";

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
  const [selectedFeature, setSelectedFeature] = useState<(typeof FEATURES)[number] | null>(null);
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
      <section id="features" className="py-20 sm:py-28 bg-slate-50">
        <div className="w-full px-6 sm:px-10 lg:px-14">
          <SectionHeader
            badge="Why Choose Us"
            title="What makes us different"
            desc="Discover the programs and facilities that make our school a place where students thrive."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <button
                key={f.title}
                onClick={() => setSelectedFeature(f)}
                className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left"
              >
                {/* Image Header */}
                <div className="relative h-44 overflow-hidden bg-slate-200">
                  <img
                    src={f.hero}
                    alt={f.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  {/* Icon & Stat Overlay */}
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon path={f.icon} className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-white drop-shadow">{f.stat}</p>
                      <p className="text-[11px] font-medium text-white/80">{f.statLabel}</p>
                    </div>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{f.desc}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 group-hover:gap-2.5 transition-all">
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
              <div key={item.label} className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <Icon path={item.icon} className="w-4.5 h-4.5 text-indigo-600" />
                </div>
                <span className="text-xs font-semibold text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ────────────────────────────────────────────────────────── */}
      <section id="roles" className="py-20 sm:py-28">
        <div className="w-full px-6 sm:px-10 lg:px-14">
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
        <div className="w-full px-6 sm:px-10 lg:px-14">
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

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 sm:py-28">
        <div className="w-full px-6 sm:px-10 lg:px-14">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 sm:p-14 text-white overflow-hidden relative">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            {/* Campus Background Image */}
            <img
              src={IMAGES.about.campus}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-[0.08]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/95 via-indigo-700/90 to-purple-700/95" />

            <div className="relative">
              {/* Header */}
              <div className="text-center mb-14">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-3">Our Story</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                  A Legacy of Academic Excellence
                </h2>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
                {[
                  {
                    year: "2005",
                    title: "Founded",
                    desc: "Established by Mr. Rahman Ahmed with a vision to provide quality education to the community. Started with just 3 teachers and 45 students in a small building.",
                  },
                  {
                    year: "2012",
                    title: "Expansion",
                    desc: "Expanded to a modern campus with science labs, computer lab, library, and sports facilities. Student body grew to 300+ with 20+ qualified teachers.",
                  },
                  {
                    year: "Today",
                    title: "Excellence",
                    desc: "Now serving 500+ students across Classes 5–9. Recognized as one of the top schools in the district with award-winning programs and dedicated faculty.",
                  },
                ].map((t) => (
                  <div key={t.year} className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-sm font-bold text-white">
                        {t.year}
                      </div>
                      <div className="h-px flex-1 bg-white/20" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{t.title}</h3>
                    <p className="text-sm text-indigo-100 leading-relaxed">{t.desc}</p>
                  </div>
                ))}
              </div>

              {/* Founder & Motto */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Founder */}
                <div className="bg-white/10 border border-white/15 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={IMAGES.about.founder}
                      alt="Mr. Rahman Ahmed"
                      className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white/20"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-xs font-medium text-indigo-200">Founded By</p>
                      <h4 className="text-lg font-bold text-white">Mr. Rahman Ahmed</h4>
                      <p className="text-xs text-indigo-200">Educationist & Visionary Leader</p>
                    </div>
                  </div>
                  <p className="text-sm text-indigo-100 leading-relaxed italic">
                    "Every child deserves the opportunity to learn, grow, and succeed. Our mission is to create an environment where curiosity is nurtured, character is built, and excellence is the standard."
                  </p>
                </div>

                {/* Vision & Mission */}
                <div className="space-y-4">
                  <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                        <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" className="w-4 h-4 text-emerald-300" />
                      </div>
                      <h4 className="font-bold text-white">Our Vision</h4>
                    </div>
                    <p className="text-sm text-indigo-100 leading-relaxed">
                      To be a leading institution that empowers students with knowledge, skills, and values to become responsible global citizens.
                    </p>
                  </div>
                  <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center">
                        <Icon path="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" className="w-4 h-4 text-amber-300" />
                      </div>
                      <h4 className="font-bold text-white">Our Motto</h4>
                    </div>
                    <p className="text-sm text-indigo-100 leading-relaxed italic">
                      "Knowledge, Character, Service" — We believe education goes beyond textbooks. It shapes character and inspires service to society.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Admission 2027 ──────────────────────────────────────────────────── */}
      <section id="admission" className="py-20 sm:py-28 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="w-full px-6 sm:px-10 lg:px-14">
          <SectionHeader
            badge="Admission 2027"
            title="Join Our School Family"
            desc="Applications are now open for the 2027 academic session. Secure your child's future with quality education."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Important Dates */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Important Dates</h3>
              <div className="space-y-4">
                {[
                  { date: "Nov 1, 2026", label: "Applications Open" },
                  { date: "Jan 15, 2027", label: "Application Deadline" },
                  { date: "Feb 10, 2027", label: "Entrance Exam" },
                  { date: "Feb 28, 2027", label: "Results Announced" },
                  { date: "Mar 15, 2027", label: "Session Begins" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.date}</p>
                      <p className="text-xs text-slate-500">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Apply */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">How to Apply</h3>
              <div className="space-y-4">
                {[
                  { step: "01", title: "Collect Form", desc: "Visit the school office or download the admission form from our website" },
                  { step: "02", title: "Submit Documents", desc: "Submit birth certificate, previous report card, and passport photos" },
                  { step: "03", title: "Entrance Exam", desc: "Student appears for the entrance exam in English, Math, and Science" },
                  { step: "04", title: "Interview", desc: "Parent and student interview with the admission committee" },
                  { step: "05", title: "Enrollment", desc: "Receive offer letter and complete fee payment to confirm seat" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements & Fees */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Requirements & Fees</h3>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Eligibility</p>
                  <ul className="space-y-2">
                    {["Class 5: Age 10+ by March 2027", "Class 6: Age 11+ by March 2027", "Class 7: Age 12+ by March 2027", "Class 8: Age 13+ by March 2027", "Class 9: Age 14+ by March 2027"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                        <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Required Documents</p>
                  <ul className="space-y-2">
                    {["Birth Certificate", "Previous Report Card", "4 Passport Photos", "Guardian NID Copy", "Transfer Certificate"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                        <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <a
                href="#contact"
                className="mt-6 block w-full text-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm shadow-emerald-200 transition-all duration-200"
              >
                Contact for Details
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 sm:py-28 bg-slate-50">
        <div className="w-full px-6 sm:px-10 lg:px-14">
          <SectionHeader
            badge="Get in Touch"
            title="Contact us"
            desc="Have questions about admissions, programs, or anything else? We'd love to hear from you."
          />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {/* Contact Info Cards */}
            <div className="lg:col-span-2 space-y-5">
              {/* Address */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                  <Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" className="w-5 h-5 text-indigo-600" />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Our Campus</h4>
                <p className="text-sm text-slate-500 leading-relaxed">42 Education Avenue, Mirpur-10, Dhaka 1216, Bangladesh</p>
              </div>
              {/* Phone */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                  <Icon path="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Call Us</h4>
                <p className="text-sm text-slate-500">+880 123 456 789</p>
                <p className="text-sm text-slate-500">+880 987 654 321</p>
              </div>
              {/* Email */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                  <Icon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-5 h-5 text-amber-600" />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Email Us</h4>
                <p className="text-sm text-slate-500">info@schoolms.edu</p>
                <p className="text-sm text-slate-500">admissions@schoolms.edu</p>
              </div>
              {/* Hours */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                  <Icon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Office Hours</h4>
                <p className="text-sm text-slate-500">Sun – Thu: 8:00 AM – 4:00 PM</p>
                <p className="text-sm text-slate-500">Fri: 9:00 AM – 12:00 PM</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Send us a Message</h3>
                <p className="text-sm text-slate-500 mb-6">Fill out the form and we'll get back to you within 24 hours.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+880 123 456 789"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</label>
                    <select className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-600">
                      <option>Admissions Inquiry</option>
                      <option>Academic Programs</option>
                      <option>Fee & Payments</option>
                      <option>General Question</option>
                    </select>
                  </div>
                </div>
                <div className="mt-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us how we can help..."
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
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="w-full px-6 sm:px-10 lg:px-14 text-center">
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
                  <Icon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-400">info@schoolms.edu</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon path="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-400">+880 123 456 789</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-400">42 Education Avenue, Mirpur-10, Dhaka</span>
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
    </div>
  );
}
