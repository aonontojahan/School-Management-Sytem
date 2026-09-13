import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface RoutineEntry {
  id: number;
  day: string;
  period_label: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  teacher_name: string;
}

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"] as const;
const DAY_FULL: Record<string, string> = {
  SUNDAY: "Sunday", MONDAY: "Monday", TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday", THURSDAY: "Thursday",
};
const DAY_SHORT: Record<string, string> = {
  SUNDAY: "Sun", MONDAY: "Mon", TUESDAY: "Tue",
  WEDNESDAY: "Wed", THURSDAY: "Thu",
};

const SUBJECT_COLORS: { bg: string; border: string; text: string; ring: string }[] = [
  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", ring: "ring-blue-100" },
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", ring: "ring-emerald-100" },
  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", ring: "ring-purple-100" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", ring: "ring-amber-100" },
  { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", ring: "ring-rose-100" },
  { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", ring: "ring-cyan-100" },
  { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", ring: "ring-indigo-100" },
  { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", ring: "ring-pink-100" },
  { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", ring: "ring-teal-100" },
];

function getSubjectColor(name: string) {
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

export function StudentSchedulePage() {
  const [activeDay, setActiveDay] = useState<string>(() => {
    const d = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    return DAYS.includes(d as typeof DAYS[number]) ? d : "SUNDAY";
  });

  const { data: routines, isLoading } = useQuery({
    queryKey: ["student-routine"],
    queryFn: async () => (await api.get("/routines/student")).data as RoutineEntry[],
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 h-28 animate-pulse" />
        <div className="bg-white rounded-2xl border border-slate-200 p-5 h-64 animate-pulse" />
      </div>
    );
  }

  const allRoutines = routines || [];

  const grid: Record<string, RoutineEntry[]> = {};
  for (const day of DAYS) grid[day] = [];
  for (const r of allRoutines) {
    if (grid[r.day]) grid[r.day].push(r);
  }
  for (const day of DAYS) {
    grid[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  const dayEntries = grid[activeDay] || [];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const isToday = activeDay === today;

  // Get unique periods for time reference
  const periodMap = new Map<string, { start: string; end: string }>();
  for (const r of allRoutines) {
    if (!periodMap.has(r.period_label)) {
      periodMap.set(r.period_label, { start: r.start_time, end: r.end_time });
    }
  }
  const sortedPeriods = Array.from(periodMap.entries()).sort((a, b) => a[1].start.localeCompare(b[1].start));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-5 -bottom-5 w-28 h-28 bg-white/10 rounded-full blur-xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold">My Schedule</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mt-2 text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {allRoutines.length} classes &middot; {sortedPeriods.length} periods per week
            </div>
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map((day) => {
          const count = grid[day].length;
          const isActive = activeDay === day;
          const isTodayTab = day === today;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`relative shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
              }`}
            >
              {isTodayTab && <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : "bg-indigo-500"}`} />}
              <span>{DAY_SHORT[day]}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">{DAY_FULL[activeDay]}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isToday && <span className="text-indigo-600 font-semibold">Today &middot; </span>}
              {dayEntries.length} class{dayEntries.length !== 1 ? "es" : ""}
            </p>
          </div>
        </div>

        {dayEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">No classes this day</p>
            <p className="text-xs text-slate-400 mt-1">Enjoy your free day!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {dayEntries.map((entry, i) => {
              const color = getSubjectColor(entry.subject_name);
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${color.bg} ${color.border} hover:shadow-sm transition-shadow`}
                >
                  {/* Period Number */}
                  <div className={`w-10 h-10 rounded-xl ${color.bg} border ${color.border} flex items-center justify-center shrink-0 ring-2 ${color.ring}`}>
                    <span className={`text-sm font-extrabold ${color.text}`}>{i + 1}</span>
                  </div>

                  {/* Time */}
                  <div className="w-20 shrink-0 text-center">
                    <p className="text-xs font-bold text-slate-900">{formatTime12(entry.start_time)}</p>
                    <div className="flex items-center gap-1 my-0.5">
                      <div className="flex-1 h-px bg-slate-300" />
                      <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                      <div className="flex-1 h-px bg-slate-300" />
                    </div>
                    <p className="text-xs font-bold text-slate-900">{formatTime12(entry.end_time)}</p>
                  </div>

                  {/* Divider */}
                  <div className={`w-0.5 h-12 rounded-full ${color.border} bg-current opacity-20 shrink-0`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-extrabold ${color.text}`}>{entry.subject_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      {entry.teacher_name}
                    </p>
                  </div>

                  {/* Period Label */}
                  <span className={`text-[10px] font-bold ${color.text} ${color.bg} border ${color.border} px-2 py-1 rounded-lg shrink-0`}>
                    {entry.period_label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly Grid */}
      {allRoutines.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Weekly Overview</h3>
          <div className="grid grid-cols-5 gap-2">
            {DAYS.map((day) => {
              const entries = grid[day];
              const isTodayCol = day === today;
              return (
                <div
                  key={day}
                  className={`rounded-xl border overflow-hidden ${
                    isTodayCol ? "border-indigo-300 ring-1 ring-indigo-100" : "border-slate-200"
                  }`}
                >
                  <div
                    className={`text-center py-2 text-xs font-bold ${
                      isTodayCol ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {DAY_SHORT[day]}
                  </div>
                  <div className="p-2 space-y-1.5 min-h-[80px]">
                    {entries.length === 0 ? (
                      <p className="text-[10px] text-slate-300 text-center mt-4">Off</p>
                    ) : (
                      entries.map((e) => {
                        const c = getSubjectColor(e.subject_name);
                        return (
                          <div key={e.id} className={`${c.bg} rounded-lg px-1.5 py-1 text-center`}>
                            <p className={`text-[9px] font-bold ${c.text} leading-tight truncate`}>{e.subject_name}</p>
                            <p className="text-[8px] text-slate-400">{formatTime12(e.start_time)}</p>
                          </div>
                        );
                      })
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
