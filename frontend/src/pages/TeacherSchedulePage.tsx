import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface RoutineEntry {
  id: number;
  day: string;
  period_label: string;
  start_time: string;
  end_time: string;
  class_id: number;
  class_name: string;
  section_id: number;
  section_name: string;
  group: string | null;
  subject_id: number;
  subject_name: string;
}

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"] as const;
const DAY_FULL: Record<string, string> = {
  SUNDAY: "Sunday",
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
};
const DAY_SHORT: Record<string, string> = {
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
};

function formatTime(t: string): string {
  if (!t) return "";
  const parts = t.split(":");
  const h = parseInt(parts[0]);
  const m = parts[1];
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function downloadPdf(grid: Record<string, RoutineEntry[]>, _periods: string[]) {
  const lines: string[] = [];
  lines.push("TEACHER WEEKLY SCHEDULE");
  lines.push("=" .repeat(60));
  lines.push("");

  for (const day of DAYS) {
    const entries = grid[day] || [];
    if (entries.length === 0) continue;
    lines.push(`--- ${DAY_FULL[day]} ---`);
    for (const e of entries.sort((a, b) => a.start_time.localeCompare(b.start_time))) {
      const time = `${formatTime(e.start_time)} - ${formatTime(e.end_time)}`;
      const cls = `${e.class_name} - Section ${e.section_name}`;
      const subj = e.subject_name;
      const group = e.group ? ` (${e.group})` : "";
      lines.push(`  ${time}  ${subj}  ${cls}${group}`);
    }
    lines.push("");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "my-schedule.txt";
  a.click();
  URL.revokeObjectURL(url);
}

export function TeacherSchedulePage() {
  const { data: routines, isLoading } = useQuery({
    queryKey: ["teacher-routine"],
    queryFn: async () => (await api.get("/routines/teacher")).data as RoutineEntry[],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 h-28 animate-pulse" />
        <div className="bg-white rounded-2xl border border-slate-200 p-5 h-64 animate-pulse" />
      </div>
    );
  }

  const grid: Record<string, RoutineEntry[]> = {};
  for (const day of DAYS) {
    grid[day] = (routines || []).filter((r) => r.day === day);
  }

  const allPeriodSlots = new Map<string, { start: string; end: string; label: string }>();
  for (const r of routines || []) {
    allPeriodSlots.set(r.period_label, { start: r.start_time, end: r.end_time, label: r.period_label });
  }
  const sortedPeriods = Array.from(allPeriodSlots.values()).sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">My Schedule</h2>
            <p className="text-indigo-100 text-sm mt-1">
              Your weekly class routine
            </p>
          </div>
          <button
            onClick={() => downloadPdf(grid, sortedPeriods.map(p => p.label))}
            className="px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Schedule
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Weekly Timetable</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 w-24">Time</th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="text-center py-3 px-3 text-xs font-semibold text-slate-600"
                  >
                    {DAY_SHORT[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedPeriods.map((period) => (
                <tr key={period.label} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 px-3 text-xs font-medium text-slate-500 whitespace-nowrap">
                    {formatTime(period.start)} – {formatTime(period.end)}
                  </td>
                  {DAYS.map((day) => {
                    const entry = grid[day].find((e) => e.period_label === period.label);
                    return (
                      <td key={day} className="py-3 px-3 text-center">
                        {entry ? (
                          <div className="bg-indigo-50 rounded-lg p-2">
                            <p className="text-xs font-bold text-indigo-700">
                              {entry.subject_name}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-0.5">
                              {entry.class_name} - {entry.section_name}
                            </p>
                            {entry.group && (
                              <span className="inline-block mt-0.5 text-[9px] font-semibold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                                {entry.group}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-200">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {sortedPeriods.length === 0 && (
                <tr>
                  <td colSpan={DAYS.length + 1} className="text-center py-12 text-slate-400 text-sm">
                    No routine scheduled
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Day-by-day list */}
      {DAYS.map((day) => {
        const entries = grid[day];
        if (!entries || entries.length === 0) return null;
        return (
          <div key={day} className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">{DAY_FULL[day]}</h3>
            <div className="space-y-3">
              {entries
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
          </div>
        );
      })}
    </div>
  );
}
