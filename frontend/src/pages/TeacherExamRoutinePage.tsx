import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface ExamRoutine {
  id: number; exam_id: number; exam_name: string; exam_type: string;
  class_name: string; section_name: string | null;
  subject_name: string; teacher_name: string | null;
  exam_date: string; start_time: string; end_time: string; room: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatDateShort(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

function groupByDate(routines: ExamRoutine[]): Record<string, ExamRoutine[]> {
  const groups: Record<string, ExamRoutine[]> = {};
  for (const r of routines) { if (!groups[r.exam_date]) groups[r.exam_date] = []; groups[r.exam_date].push(r); }
  return groups;
}

function downloadRoutinePdf(routines: ExamRoutine[]) {
  const lines: string[] = [];
  lines.push("MY EXAM DUTY SCHEDULE");
  lines.push("=".repeat(60));
  lines.push("");
  const grouped = groupByDate(routines);
  const dates = Object.keys(grouped).sort();
  for (const date of dates) {
    lines.push(`--- ${formatDateShort(date)} ---`);
    for (const r of grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time))) {
      lines.push(`  ${r.start_time}-${r.end_time}  ${r.subject_name}  ${r.class_name}${r.section_name ? " - " + r.section_name : ""}${r.room ? "  Room: " + r.room : ""}`);
    }
    lines.push("");
  }
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "my-exam-duty.txt"; a.click();
  URL.revokeObjectURL(url);
}

export function TeacherExamRoutinePage() {
  const { data: routines, isLoading } = useQuery({
    queryKey: ["teacher-exam-routines"],
    queryFn: async () => (await api.get("/exams/routines")).data as ExamRoutine[],
  });

  if (isLoading) return <div className="space-y-6"><div className="bg-white rounded-2xl p-6 h-28 animate-pulse" /><div className="bg-white rounded-2xl border border-slate-200 p-5 h-48 animate-pulse" /></div>;

  const grouped = routines ? groupByDate(routines) : {};
  const dates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Exam Duty Schedule</h2>
            <p className="text-indigo-100 text-sm mt-1">Your assigned exam duty for upcoming exams</p>
          </div>
          {routines && routines.length > 0 && (
            <button onClick={() => downloadRoutinePdf(routines)}
              className="px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Download
            </button>
          )}
        </div>
      </div>

      {!routines || routines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-400">No exam duty assigned yet</p>
        </div>
      ) : dates.map(date => (
        <div key={date} className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3">{formatDate(date)}</h3>
          <div className="space-y-2">
            {grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time)).map(r => (
              <div key={r.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="w-16 text-center shrink-0">
                  <p className="text-xs font-bold text-indigo-700">{r.start_time}</p>
                  <p className="text-[10px] text-slate-400">to</p>
                  <p className="text-xs font-bold text-indigo-700">{r.end_time}</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{r.subject_name}</p>
                  <p className="text-xs text-slate-500">{r.class_name}{r.section_name ? ` — ${r.section_name}` : ""}</p>
                </div>
                {r.room && <span className="text-[10px] font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full shrink-0">Room: {r.room}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
