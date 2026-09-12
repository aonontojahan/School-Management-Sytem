import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

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

interface Period {
  id: number;
  number: number;
  label: string;
  start_time: string;
  end_time: string;
}


const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"] as const;
const DAY_LABELS: Record<string, string> = {
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
};

function getTodayName(): string {
  const jsDay = new Date().getDay();
  const map = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return map[jsDay];
}

function formatTime(t: string): string {
  return t.slice(0, 5);
}

function getUniqueSubjects(entries: RoutineEntry[]): string[] {
  return [...new Set(entries.map((e) => e.subject_name))];
}

export function TeacherDashboard() {
  const { email } = useAuth();
  const today = getTodayName();

  const { data: routine, isLoading: routineLoading } = useQuery({
    queryKey: ["teacher-routine"],
    queryFn: async () => (await api.get("/routines/teacher")).data as RoutineEntry[],
  });

  const { data: periods } = useQuery({
    queryKey: ["periods"],
    queryFn: async () => (await api.get("/admin/periods")).data as Period[],
  });

  const isLoading = routineLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 h-28 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-24 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 h-64 animate-pulse" />
      </div>
    );
  }

  const todaySchedule = routine
    ? routine.filter((e) => e.day === today)
    : [];

  const weeklyTimetable: Record<string, RoutineEntry[]> = {};
  for (const day of DAYS) {
    weeklyTimetable[day] = routine
      ? routine.filter((e) => e.day === day)
      : [];
  }

  const totalClassesThisWeek = routine ? routine.length : 0;
  const classesToday = todaySchedule.length;
  const assignedSubjects = routine ? getUniqueSubjects(routine).length : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white shadow">
        <p className="text-indigo-200 text-sm">Signed in as {email}</p>
        <h2 className="text-2xl font-extrabold mt-1">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, Teacher
        </h2>
        <p className="text-indigo-100 text-sm mt-1">
          {classesToday > 0
            ? `You have ${classesToday} class${classesToday > 1 ? "es" : ""} scheduled today.`
            : "No classes scheduled for today."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Classes This Week"
          value={totalClassesThisWeek}
          color="bg-indigo-600"
          iconPath="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
        <StatCard
          label="Classes Today"
          value={classesToday}
          color="bg-emerald-600"
          iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatCard
          label="Assigned Subjects"
          value={assignedSubjects}
          color="bg-sky-600"
          iconPath="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
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
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {entry.period_label.replace("Period ", "P")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {entry.subject_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {entry.class_name} — Section {entry.section_name}
                        {entry.group && ` (${entry.group})`}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    {formatTime(entry.start_time)} – {formatTime(entry.end_time)}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Weekly Timetable Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Weekly Timetable</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Period</th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className={`text-center py-2 px-3 text-xs font-semibold ${
                      day === today ? "text-indigo-700 bg-indigo-50 rounded-t-lg" : "text-slate-500"
                    }`}
                  >
                    {DAY_LABELS[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods
                ? periods.map((period) => (
                    <tr key={period.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 px-3 text-xs font-medium text-slate-600 whitespace-nowrap">
                        {formatTime(period.start_time)} – {formatTime(period.end_time)}
                      </td>
                      {DAYS.map((day) => {
                        const entry = weeklyTimetable[day].find(
                          (e) => e.period_label === period.label
                        );
                        return (
                          <td
                            key={day}
                            className={`py-2 px-3 text-center ${
                              day === today ? "bg-indigo-50/50" : ""
                            }`}
                          >
                            {entry ? (
                              <div>
                                <p className="text-xs font-semibold text-slate-900">
                                  {entry.subject_name}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {entry.class_name}-{entry.section_name}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                : (
                    <tr>
                      <td colSpan={DAYS.length + 1} className="text-center py-8 text-slate-400 text-sm">
                        No period data available
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  iconPath,
}: {
  label: string;
  value: number;
  color: string;
  iconPath: string;
}) {
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
