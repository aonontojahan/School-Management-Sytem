import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface StudentProfile {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  admission_date: string | null;
  roll_number: number | null;
  group: string | null;
  division: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  status: string;
}

interface AttendanceRecord {
  date: string;
  status: string;
  period: number | null;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string | null;
  subject_id: number;
}

interface RoutineEntry {
  day: string;
  period_label: string | null;
  start_time: string | null;
  end_time: string | null;
  subject_name: string | null;
  teacher_name: string | null;
}

interface StudentDashboardData {
  profile: StudentProfile;
  class: { id: number; name: string; code: string } | null;
  section: { id: number; name: string } | null;
  subjects: { id: number; name: string; code: string }[];
  attendance: {
    total_days: number;
    present_days: number;
    absent_days: number;
    rate: number;
    recent: AttendanceRecord[];
  };
  upcoming_exams: unknown[];
  recent_assignments: Assignment[];
  routine: RoutineEntry[];
}

const DAYS_ORDER = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export function StudentDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: async () => (await api.get("/dashboard/student")).data as StudentDashboardData,
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 h-32 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-24 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-56 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-slate-900 font-semibold">Could not load dashboard</p>
        <p className="text-sm text-slate-500 mt-1">Check that the backend is running.</p>
      </div>
    );
  }

  const { profile, class: cls, section, subjects, attendance, recent_assignments, routine } = data;

  const routineByDay: Record<string, RoutineEntry[]> = {};
  for (const entry of routine) {
    if (!routineByDay[entry.day]) routineByDay[entry.day] = [];
    routineByDay[entry.day].push(entry);
  }
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const todayRoutine = routineByDay[today] || [];

  return (
    <div className="space-y-5">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-5 -bottom-5 w-28 h-28 bg-white/10 rounded-full blur-xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-extrabold shrink-0">
            {profile.first_name[0]}{profile.last_name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold">
              Welcome back, {profile.first_name}!
            </h1>
            <p className="text-blue-100 mt-1 text-sm">
              {cls?.name || "No class"}{section ? ` — Section ${section.name}` : ""} &middot; Roll #{profile.roll_number ?? "—"}
              {profile.group ? ` &middot; ${profile.group.replace("_", " ")}` : ""}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-blue-100">
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full">Code: {profile.student_code}</span>
              {profile.division && <span className="bg-white/20 px-2.5 py-0.5 rounded-full">{profile.division}</span>}
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-blue-100">
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Attendance</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{attendance.rate}%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{attendance.present_days}/{attendance.total_days} days</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Subjects</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{subjects.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{cls?.name || "—"}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Assignments</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{recent_assignments.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Due soon</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Absent Days</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{attendance.absent_days}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">This month</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Routine */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Today's Schedule</h3>
            <a href="/routines" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Full Schedule &rarr;
            </a>
          </div>
          {todayRoutine.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-slate-400">No classes today</p>
              <p className="text-xs text-slate-300 mt-1">Enjoy your day off!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayRoutine.map((entry, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-16 text-center shrink-0">
                    <p className="text-[11px] font-bold text-indigo-600">{entry.start_time?.slice(0, 5)}</p>
                    <div className="w-px h-3 bg-slate-200 mx-auto" />
                    <p className="text-[11px] font-bold text-indigo-600">{entry.end_time?.slice(0, 5)}</p>
                  </div>
                  <div className="w-1 h-10 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{entry.subject_name}</p>
                    <p className="text-xs text-slate-500">{entry.teacher_name}</p>
                  </div>
                  {entry.period_label && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
                      {entry.period_label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Attendance</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={attendance.rate >= 75 ? "#10b981" : attendance.rate >= 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${attendance.rate * 3.267} 326.7`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-extrabold text-slate-900">{attendance.rate}%</p>
                <p className="text-[10px] text-slate-400">Rate</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-lg font-bold text-emerald-700">{attendance.present_days}</p>
              <p className="text-[10px] font-medium text-emerald-600">Present</p>
            </div>
            <div className="bg-rose-50 rounded-xl p-3">
              <p className="text-lg font-bold text-rose-700">{attendance.absent_days}</p>
              <p className="text-[10px] font-medium text-rose-600">Absent</p>
            </div>
          </div>
          <a href="/attendance" className="mt-4 block text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            View Details &rarr;
          </a>
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700">Assignments</h3>
          <a href="/assignments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View All &rarr;</a>
        </div>
        {recent_assignments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">No assignments yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recent_assignments.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{a.title}</p>
                  <p className="text-xs text-slate-500 truncate">{a.description}</p>
                </div>
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                  {a.due_date || "TBA"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Attendance */}
      {attendance.recent.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Recent Attendance</h3>
            <a href="/attendance" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View All &rarr;</a>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {attendance.recent.map((a, i) => (
              <div key={i} className="shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 min-w-[80px]">
                <p className="text-[10px] font-medium text-slate-400">{new Date(a.date).toLocaleDateString("en-US", { weekday: "short" })}</p>
                <p className="text-sm font-bold text-slate-700">{new Date(a.date).getDate()}</p>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  a.status === "PRESENT" ? "bg-emerald-500 text-white" :
                  a.status === "ABSENT" ? "bg-red-500 text-white" :
                  a.status === "LATE" ? "bg-amber-500 text-white" :
                  "bg-slate-300 text-white"
                }`}>
                  {a.status === "PRESENT" ? "P" : a.status === "ABSENT" ? "A" : a.status === "LATE" ? "L" : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
