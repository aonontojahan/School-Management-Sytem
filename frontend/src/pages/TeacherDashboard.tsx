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

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const DAY_LABELS: Record<string, string> = {
  SUNDAY: "Sun", MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat",
};

function getTodayName(): string {
  const jsDay = new Date().getDay();
  const map = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return map[jsDay];
}

function StatCard({ label, value, color, iconPath }: { label: string; value: number; color: string; iconPath: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function TeacherDashboard() {
  const today = getTodayName();

  const { data: routine, isLoading: routineLoading } = useQuery({
    queryKey: ["teacher-routine"],
    queryFn: async () => (await api.get("/routines/teacher")).data as RoutineEntry[],
  });

  const { data: examRoutines } = useQuery({
    queryKey: ["teacher-exam-routines"],
    queryFn: async () => (await api.get("/exams/routines")).data as { id: number; exam_name: string; subject_name: string; class_name: string; exam_date: string; start_time: string; end_time: string; room: string | null }[],
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data as Notification[],
  });

  const { data: salaryData } = useQuery({
    queryKey: ["teacher-salary"],
    queryFn: async () => (await api.get("/salary/my-salary")).data as { structure: { monthly_amount: number } | null; payments: { month: number; year: number; amount: number; status: string }[] },
  });

  if (routineLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 h-28 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const todaySchedule = routine ? routine.filter((e) => e.day === today) : [];
  const totalClassesThisWeek = routine ? routine.length : 0;
  const classesToday = todaySchedule.length;
  const uniqueSubjects = routine ? [...new Set(routine.map((e) => e.subject_name))].length : 0;
  const salaryNotifications = notifications?.filter(n => n.type === "SALARY" && !n.is_read) || [];
  const latestSalary = salaryData?.payments?.[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white shadow">
        <h2 className="text-2xl font-extrabold">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, Teacher
        </h2>
        <p className="text-indigo-100 text-sm mt-1">
          {classesToday > 0
            ? `You have ${classesToday} class${classesToday > 1 ? "es" : ""} scheduled today.`
            : "No classes scheduled for today."}
        </p>
      </div>

      {/* Salary Notifications */}
      {salaryNotifications.length > 0 && (
        <div className="bg-violet-50 rounded-2xl border border-violet-200 p-5">
          <h3 className="text-sm font-bold text-violet-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Salary Notifications
          </h3>
          <div className="space-y-2">
            {salaryNotifications.slice(0, 3).map((n) => (
              <div key={n.id} className="flex items-start gap-2 p-2 bg-white rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                  <p className="text-[11px] text-slate-500">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Classes This Week" value={totalClassesThisWeek} color="bg-indigo-600" iconPath="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <StatCard label="Classes Today" value={classesToday} color="bg-emerald-600" iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatCard label="Assigned Subjects" value={uniqueSubjects} color="bg-sky-600" iconPath="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        <StatCard label="Monthly Salary" value={salaryData?.structure?.monthly_amount || 0} color="bg-violet-600" iconPath="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">
          Today&apos;s Schedule — {DAY_LABELS[today] ?? today}
        </h3>
        {todaySchedule.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No classes today</p>
        ) : (
          <div className="space-y-3">
            {todaySchedule
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {entry.period_label.replace("Period ", "P")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{entry.subject_name}</p>
                      <p className="text-xs text-slate-500">
                        {entry.class_name} — Section {entry.section_name}
                        {entry.group && ` (${entry.group})`}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    {entry.start_time?.slice(0, 5)} – {entry.end_time?.slice(0, 5)}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Exam Duty */}
      {examRoutines && examRoutines.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Exam Duty</h3>
            <a href="/exam-routine" className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700">View All</a>
          </div>
          <div className="space-y-2">
            {examRoutines.slice(0, 4).map(r => (
              <div key={r.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <div className="w-12 text-center shrink-0">
                  <p className="text-[10px] font-bold text-indigo-700">{r.start_time}</p>
                  <p className="text-[10px] text-slate-400">to</p>
                  <p className="text-[10px] font-bold text-indigo-700">{r.end_time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{r.subject_name}</p>
                  <p className="text-[10px] text-slate-500">{r.class_name} • {r.exam_name}</p>
                </div>
                {r.room && <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full shrink-0">{r.room}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Salary History */}
      {latestSalary && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Latest Salary</h3>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-slate-900">{["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][latestSalary.month]} {latestSalary.year}</p>
              <p className="text-xs text-slate-500">TK {latestSalary.amount.toLocaleString()}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${latestSalary.status === "PAID" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
              {latestSalary.status}
            </span>
          </div>
          <a href="/salary" className="block mt-3 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700">View All Salary →</a>
        </div>
      )}
    </div>
  );
}
