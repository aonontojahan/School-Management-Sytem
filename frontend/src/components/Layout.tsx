import { Link, useNavigate } from "react-router-dom";
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
  const items = role ? MENUS[role] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <Link to="/" className="font-bold text-lg">SMS · {role}</Link>
        <div className="flex gap-3 items-center text-sm">
          <span className="text-gray-600">{email}</span>
          <button
            className="px-3 py-1 border rounded"
            onClick={() => { logout(); nav("/login"); }}
          >Logout</button>
        </div>
      </header>
      <div className="flex">
        <nav className="w-52 bg-white border-r min-h-[calc(100vh-57px)] p-3 space-y-1">
          {items.map((m) => (
            <Link key={m.to + m.label} to={m.to} className="block px-3 py-2 rounded hover:bg-gray-100 text-sm">
              {m.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
