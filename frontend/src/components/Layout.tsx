import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, type Role } from "../auth/AuthContext";

interface MenuItem {
  to: string;
  label: string;
  icon: string;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

const MENUS: Record<Role, MenuSection[]> = {
  ADMIN: [
    {
      items: [
        { to: "/admin/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      ],
    },
    {
      title: "Management",
      items: [
        { to: "/students", label: "Students", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
        { to: "/teachers", label: "Teachers", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
        { to: "/classes", label: "Classes", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
        { to: "/subjects", label: "Subjects", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
      ],
    },
    {
      title: "Academics",
      items: [
        { to: "/routines", label: "Class Routine", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        { to: "/attendance", label: "Attendance", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
        { to: "/exams", label: "Exams", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
        { to: "/results", label: "Results", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
      ],
    },
    {
      title: "Finance",
      items: [
        { to: "/fees", label: "Fees", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
      ],
    },
    {
      title: "Administration",
      items: [
        { to: "/reports", label: "Reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      ],
    },
  ],
  TEACHER: [
    {
      items: [
        { to: "/", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      ],
    },
    {
      title: "My Work",
      items: [
        { to: "/routines", label: "My Schedule", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        { to: "/classes", label: "My Classes", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
        { to: "/students", label: "Students", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
        { to: "/attendance", label: "Attendance", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
        { to: "/assignments", label: "Assignments", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
      ],
    },
    {
      title: "Assessments",
      items: [
        { to: "/exams", label: "Exams", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
        { to: "/results", label: "Results", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
      ],
    },
  ],
  STUDENT: [
    {
      items: [
        { to: "/", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      ],
    },
    {
      title: "My Academics",
      items: [
        { to: "/routines", label: "My Schedule", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
        { to: "/profile", label: "My Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
        { to: "/classes", label: "My Classes", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
        { to: "/attendance", label: "Attendance", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
        { to: "/assignments", label: "Assignments", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
      ],
    },
    {
      title: "Assessments",
      items: [
        { to: "/exams", label: "Exams", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
        { to: "/results", label: "Results", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
      ],
    },
  ],
  GUARDIAN: [],
};

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: "bg-red-500",
  TEACHER: "bg-emerald-500",
  STUDENT: "bg-blue-500",
  GUARDIAN: "bg-amber-500",
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  TEACHER: "Teacher",
  STUDENT: "Student",
  GUARDIAN: "Guardian",
};

function Icon({ path, className = "w-5 h-5" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function Sidebar({ sections, pathname }: { sections: MenuSection[]; pathname: string }) {
  return (
    <nav className="w-64 shrink-0 bg-slate-900 min-h-[calc(100vh-56px)] flex flex-col">
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {sections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {section.title}
              </p>
            )}
            {section.items.map((m) => {
              const active = m.to === "/" ? pathname === "/" : pathname.startsWith(m.to);
              return (
                <Link
                  key={m.to}
                  to={m.to}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon path={m.icon} className={`w-5 h-5 shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
                  {m.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

    </nav>
  );
}

function SearchBar() {
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      nav(`/search?q=${encodeURIComponent(trimmed)}`);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="hidden sm:block">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-48 lg:w-64 pl-10 pr-3 py-1.5 text-sm bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition placeholder:text-slate-400"
        />
      </div>
    </form>
  );
}

function SettingsDropdown({ email, role, logout }: { email: string; role: Role; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
        <svg className={`w-4 h-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900 truncate">{email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${ROLE_COLORS[role]}`} />
              <span className="text-xs text-slate-500">{ROLE_LABELS[role]}</span>
            </div>
          </div>
          <div className="border-t border-slate-100 py-1">
            <button
              onClick={() => { logout(); nav("/login"); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { role, email, logout } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sections = role ? MENUS[role] : [];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-20px sticky top-0 z-20">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Logo + Name */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-200">
                S
              </div>
              <span className="hidden sm:block font-extrabold text-slate-900 text-[15px]">School Management System</span>
            </Link>
          </div>

          {/* Right: Search + Role + Profile */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <SearchBar />

            {/* Role Badge */}
            {role && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
                <span className={`w-2 h-2 rounded-full ${ROLE_COLORS[role]}`} />
                <span className="text-xs font-medium text-slate-600">{ROLE_LABELS[role]}</span>
              </div>
            )}

            {/* Divider */}
            <div className="hidden lg:block w-px h-6 bg-slate-200" />

            {/* Profile Dropdown */}
            <SettingsDropdown email={email || ""} role={role || "STUDENT"} logout={logout} />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar sections={sections} pathname={pathname} />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64 bg-slate-900 shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="font-bold text-white text-sm">School Management System</span>
                <button onClick={() => setMobileOpen(false)} className="p-1 rounded hover:bg-white/10">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <Sidebar sections={sections} pathname={pathname} />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-6 min-h-[calc(100vh-56px)]">{children}</main>
      </div>
    </div>
  );
}
