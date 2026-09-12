import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

interface Summary {
  students: number; teachers: number; classes: number;
  sections: number; subjects: number; exams: number; attendance_records: number;
  marks: number; invoices: number; assignments: number;
}

const CARD_STYLES: [string, string, string][] = [
  ["bg-indigo-600", "Students", "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"],
  ["bg-emerald-600", "Teachers", "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"],
  ["bg-sky-600", "Classes", "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"],
  ["bg-violet-600", "Exams", "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"],
  ["bg-rose-600", "Fee Invoices", "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"],
];

export function Dashboard() {
  const { role, email } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["summary"],
    queryFn: async () => (await api.get("/dashboard/summary")).data as Summary,
  });

  const stats: [string, number, string][] = data
    ? [
        ["Students", data.students, CARD_STYLES[0][2]],
        ["Teachers", data.teachers, CARD_STYLES[1][2]],
        ["Classes", data.classes, CARD_STYLES[2][2]],
        ["Exams", data.exams, CARD_STYLES[3][2]],
        ["Fee Invoices", data.invoices, CARD_STYLES[4][2]],
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl text-white p-6 shadow">
        <p className="text-indigo-200 text-sm">Signed in as {email}</p>
        <h2 className="text-2xl font-extrabold mt-1">
          {role === "TEACHER" && "Ready for today's classes?"}
          {role === "STUDENT" && "Keep up the good work!"}
          {!role && "Welcome back"}
        </h2>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100" />
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-slate-100 rounded" />
                  <div className="h-7 w-16 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          Could not load the dashboard summary. Check that the backend is running.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(([label, value, iconPath], i) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${CARD_STYLES[i][0]} flex items-center justify-center`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
