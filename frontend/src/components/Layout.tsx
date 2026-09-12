import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, type Role } from "../auth/AuthContext";

const MENUS: Record<Role, { to: string; label: string }[]> = {
  ADMIN: [
    { to: "/", label: "Dashboard" },
    { to: "/students", label: "Students" },
    { to: "/teachers", label: "Teachers" },
    { to: "/guardians", label: "Guardians" },
    { to: "/classes", label: "Classes" },
    { to: "/subjects", label: "Subjects" },
    { to: "/attendance", label: "Attendance" },
    { to: "/exams", label: "Exams" },
    { to: "/results", label: "Results" },
    { to: "/fees", label: "Fees" },
    { to: "/reports", label: "Reports" },
  ],
  TEACHER: [
    { to: "/", label: "Dashboard" },
    { to: "/classes", label: "My Classes" },
    { to: "/students", label: "Students" },
    { to: "/attendance", label: "Attendance" },
    { to: "/assignments", label: "Assignments" },
    { to: "/exams", label: "Exams" },
    { to: "/results", label: "Results" },
  ],
  STUDENT: [
    { to: "/", label: "Dashboard" },
    { to: "/profile", label: "My Profile" },
    { to: "/classes", label: "My Classes" },
    { to: "/attendance", label: "Attendance" },
    { to: "/assignments", label: "Assignments" },
    { to: "/exams", label: "Exams" },
    { to: "/results", label: "Results" },
  ],
  GUARDIAN: [
    { to: "/", label: "Dashboard" },
    { to: "/children", label: "Children" },
    { to: "/attendance", label: "Attendance" },
    { to: "/results", label: "Results" },
    { to: "/fees", label: "Fees" },
  ],
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { role, email, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const items = role ? MENUS[role] : [];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-5 py-3 flex justify-between items-center sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">S</span>
          <span className="font-bold text-slate-900">School Management</span>
          {role && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {role}
            </span>
          )}
        </Link>
        <div className="flex gap-3 items-center text-sm">
          <span className="text-slate-500 hidden sm:inline">{email}</span>
          <button
            className="px-3.5 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-700 transition"
            onClick={() => { logout(); nav("/login"); }}
          >Logout</button>
        </div>
      </header>
      <div className="flex">
        <nav className="w-56 shrink-0 bg-slate-900 text-slate-300 min-h-[calc(100vh-57px)] p-3 space-y-1">
          {items.map((m) => {
            const active = m.to === "/" ? pathname === "/" : pathname.startsWith(m.to);
            return (
              <Link
                key={m.to + m.label}
                to={m.to}
                className={`block px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  active ? "bg-indigo-600 text-white" : "hover:bg-white/10 hover:text-white"
                }`}
              >
                {m.label}
              </Link>
            );
          })}
          <p className="pt-4 px-3.5 text-[11px] text-slate-500">JWT-secured · RBAC enforced</p>
        </nav>
        <main className="flex-1 p-6 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
