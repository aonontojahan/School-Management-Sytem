import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface RoutineEntry {
  id: number;
  day: string;
  period_label: string;
  start_time: string;
  end_time: string;
  class_name: string;
  section_name: string;
  group: string | null;
  subject_name: string;
}

interface TeacherProfile {
  id: number;
  teacher_code: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  designation: string | null;
  qualification: string | null;
  department: string | null;
  salary: number | null;
  subject_ids: number[];
  section_ids: number[];
}

interface ExamRoutine {
  id: number;
  exam_name: string;
  subject_name: string;
  class_name: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  room: string | null;
}

interface SalaryData {
  structure: { monthly_amount: number } | null;
  payments: { month: number; year: number; amount: number; status: string }[];
}

const DAYS_ORDER = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];
const DAY_SHORT: Record<string, string> = {
  SUNDAY: "Sun", MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu",
};

const SUBJECT_COLORS = [
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-purple-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-red-500",
  "from-cyan-500 to-blue-500",
];

function getSubjectColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
}

function formatTime12(t: string): string {
  if (!t) return "";
  const parts = t.split(":");
  const h = parseInt(parts[0]);
  const m = parts[1];
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function TeacherDashboard() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["teacher-profile"],
    queryFn: async () => {
      const res = await api.get("/teachers/me");
      return res.data as TeacherProfile;
    },
  });

  const { data: routine } = useQuery({
    queryKey: ["teacher-routine"],
    queryFn: async () => (await api.get("/routines/teacher")).data as RoutineEntry[],
  });

  const { data: examRoutines } = useQuery({
    queryKey: ["teacher-exam-routines"],
    queryFn: async () => (await api.get("/exams/routines")).data as ExamRoutine[],
  });

  const { data: salaryData } = useQuery({
    queryKey: ["teacher-salary"],
    queryFn: async () => (await api.get("/salary/my-salary")).data as SalaryData,
  });

  if (profileLoading) {
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 h-32 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-24 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 h-64 animate-pulse" />
      </div>
    );
  }

  const allRoutines = routine || [];
  const todaySchedule = allRoutines.filter((e) => e.day === today);
  const totalClassesWeek = allRoutines.length;
  const uniqueSubjects = [...new Set(allRoutines.map((e) => e.subject_name))].length;
  const latestSalary = salaryData?.payments?.[0];
  const uniqueClasses = [...new Set(allRoutines.map((e) => e.class_name))].length;
  const uniqueSections = [...new Set(allRoutines.map((e) => `${e.class_name}-${e.section_name}`))].length;

  // Build weekly grid
  const routineByDay: Record<string, RoutineEntry[]> = {};
  for (const day of DAYS_ORDER) routineByDay[day] = [];
  for (const r of allRoutines) {
    if (routineByDay[r.day]) routineByDay[r.day].push(r);
  }

  return (
    <div className="space-y-5">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-5 -bottom-5 w-28 h-28 bg-white/10 rounded-full blur-xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-extrabold shrink-0">
            {profile?.first_name[0]}{profile?.last_name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold">
              Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, {profile?.first_name}!
            </h1>
            <p className="text-emerald-100 mt-1 text-sm">
              {profile?.designation || "Teacher"} &middot; {uniqueSubjects} subject{uniqueSubjects !== 1 ? "s" : ""} &middot; {uniqueClasses} class{uniqueClasses !== 1 ? "es" : ""}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-emerald-100 flex-wrap">
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full">Code: {profile?.teacher_code}</span>
              {profile?.qualification && <span className="bg-white/20 px-2.5 py-0.5 rounded-full">{profile.qualification}</span>}
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-emerald-100">
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Today's Classes</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{todaySchedule.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{DAY_SHORT[today] || today}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Weekly Classes</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalClassesWeek}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">5 working days</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Subjects</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{uniqueSubjects}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{uniqueSections} sections</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Monthly Salary</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">TK {(salaryData?.structure?.monthly_amount || 0).toLocaleString()}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Per month</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Today's Schedule</h3>
            <a href="/routines" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Full Schedule &rarr;</a>
          </div>
          {todaySchedule.length === 0 ? (
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
              {todaySchedule
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                .map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-16 text-center shrink-0">
                      <p className="text-[11px] font-bold text-emerald-600">{formatTime12(entry.start_time)}</p>
                      <div className="w-px h-3 bg-slate-200 mx-auto" />
                      <p className="text-[11px] font-bold text-emerald-600">{formatTime12(entry.end_time)}</p>
                    </div>
                    <div className={`w-1 h-10 bg-gradient-to-b ${getSubjectColor(entry.subject_name)} rounded-full shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{entry.subject_name}</p>
                      <p className="text-xs text-slate-500">
                        {entry.class_name} — Section {entry.section_name}
                        {entry.group && ` (${entry.group})`}
                      </p>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
                      {entry.period_label}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Subjects */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">My Subjects</h3>
          {uniqueSubjects > 0 ? (
            <div className="space-y-2">
              {[...new Set(allRoutines.map((e) => e.subject_name))].map((name) => (
                <div key={name} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getSubjectColor(name)} flex items-center justify-center text-white shrink-0`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No subjects assigned</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Exam Duty */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Exam Duty</h3>
            {examRoutines && examRoutines.length > 0 && (
              <a href="/exam-routine" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">View All &rarr;</a>
            )}
          </div>
          {!examRoutines || examRoutines.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-slate-400">No exam duty</p>
            </div>
          ) : (
            <div className="space-y-2">
              {examRoutines.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-14 text-center shrink-0">
                    <p className="text-[10px] font-bold text-emerald-600">{r.start_time}</p>
                    <p className="text-[9px] text-slate-300">to</p>
                    <p className="text-[10px] font-bold text-emerald-600">{r.end_time}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{r.subject_name}</p>
                    <p className="text-[10px] text-slate-500">{r.class_name} &middot; {r.exam_name}</p>
                  </div>
                  {r.room && (
                    <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full shrink-0">{r.room}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Salary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Salary</h3>
            <a href="/salary" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">View All &rarr;</a>
          </div>
          {latestSalary ? (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs font-semibold text-amber-600">Latest Payment</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xl font-extrabold text-amber-700">TK {latestSalary.amount.toLocaleString()}</p>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    latestSalary.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {latestSalary.status}
                  </span>
                </div>
                <p className="text-[11px] text-amber-500 mt-1">{MONTHS[latestSalary.month]} {latestSalary.year}</p>
              </div>
              {salaryData?.payments && salaryData.payments.length > 1 && (
                <div className="space-y-1.5">
                  {salaryData.payments.slice(1, 3).map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                      <span className="text-slate-600">{MONTHS[p.month]} {p.year}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">TK {p.amount.toLocaleString()}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          p.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm text-slate-400">No salary data</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      {allRoutines.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Weekly Schedule</h3>
            <a href="/routines" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Full Schedule &rarr;</a>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {DAYS_ORDER.map((day) => {
              const entries = routineByDay[day] || [];
              const isTodayCol = day === today;
              return (
                <div key={day} className={`rounded-xl border overflow-hidden ${isTodayCol ? "border-emerald-300 ring-1 ring-emerald-100" : "border-slate-200"}`}>
                  <div className={`text-center py-2 text-xs font-bold ${isTodayCol ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {DAY_SHORT[day]}
                  </div>
                  <div className="p-2 space-y-1.5 min-h-[80px]">
                    {entries.length === 0 ? (
                      <p className="text-[10px] text-slate-300 text-center mt-4">Off</p>
                    ) : (
                      entries.map((e) => (
                        <div key={e.id} className="bg-emerald-50 rounded-lg px-1.5 py-1 text-center">
                          <p className="text-[9px] font-bold text-emerald-700 leading-tight truncate">{e.subject_name}</p>
                          <p className="text-[8px] text-slate-400">{formatTime12(e.start_time)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
