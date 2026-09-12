import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth, type Role } from "../auth/AuthContext";

interface Summary {
  students: number; teachers: number; guardians: number; classes: number;
  sections: number; subjects: number; exams: number; attendance_records: number;
  marks: number; invoices: number; assignments: number;
}

const CARD_STYLES: [string, string][] = [
  ["bg-indigo-600", "Students"], ["bg-emerald-600", "Teachers"], ["bg-amber-500", "Guardians"],
  ["bg-sky-600", "Classes"], ["bg-violet-600", "Exams"], ["bg-rose-600", "Fee Invoices"],
];

const QUICK_LINKS: Record<Role, { to: string; label: string; desc: string }[]> = {
  ADMIN: [
    { to: "/students", label: "Manage students", desc: "Create, search & assign classes" },
    { to: "/attendance", label: "View attendance", desc: "Daily records & rates" },
    { to: "/exams", label: "Manage exams", desc: "Enter marks, auto grades" },
    { to: "/fees", label: "Manage fees", desc: "Invoices & payments" },
  ],
  TEACHER: [
    { to: "/attendance", label: "Take attendance", desc: "Mark today's register" },
    { to: "/assignments", label: "Assignments", desc: "Create & review work" },
    { to: "/exams", label: "Enter marks", desc: "Grade your subjects" },
    { to: "/students", label: "My students", desc: "Class rosters" },
  ],
  STUDENT: [
    { to: "/attendance", label: "My attendance", desc: "Check your rate" },
    { to: "/assignments", label: "Assignments", desc: "Due work" },
    { to: "/results", label: "My results", desc: "Marks & report card" },
    { to: "/profile", label: "My profile", desc: "Personal details" },
  ],
  GUARDIAN: [
    { to: "/children", label: "My children", desc: "Linked students" },
    { to: "/attendance", label: "Attendance", desc: "Monitor presence" },
    { to: "/results", label: "Results", desc: "Report cards" },
    { to: "/fees", label: "Fees", desc: "Dues & payments" },
  ],
};

export function Dashboard() {
  const { role, email } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["summary"],
    queryFn: async () => (await api.get("/dashboard/summary")).data as Summary,
  });

  const stats: [string, number][] = data
    ? [
        ["Students", data.students], ["Teachers", data.teachers], ["Guardians", data.guardians],
        ["Classes", data.classes], ["Exams", data.exams], ["Fee Invoices", data.invoices],
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl text-white p-6 shadow">
        <p className="text-indigo-200 text-sm">Signed in as {email} · {role}</p>
        <h2 className="text-2xl font-extrabold mt-1">
          {role === "ADMIN" && "School at a glance"}
          {role === "TEACHER" && "Ready for today's classes?"}
          {role === "STUDENT" && "Keep up the good work!"}
          {role === "GUARDIAN" && "Your child's progress"}
          {!role && "Dashboard"}
        </h2>
      </div>

      {isLoading && <p className="text-slate-500">Loading summary…</p>}
      {isError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          Could not load the dashboard summary. Check that the backend is running.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(([label, value], i) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
            <span className={`w-11 h-11 rounded-xl ${CARD_STYLES[i % CARD_STYLES.length][0]} text-white flex items-center justify-center text-lg font-extrabold`}>
              {value}
            </span>
            <div>
              <div className="text-xl font-bold text-slate-900">{label}</div>
              <div className="text-sm text-slate-500">{value} total</div>
            </div>
          </div>
        ))}
      </div>

      {role && (
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Quick actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUICK_LINKS[role].map((q) => (
              <Link
                key={q.to + q.label}
                to={q.to}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-indigo-400 hover:shadow transition group"
              >
                <p className="font-bold text-slate-900 group-hover:text-indigo-700">{q.label} →</p>
                <p className="text-sm text-slate-500 mt-0.5">{q.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
