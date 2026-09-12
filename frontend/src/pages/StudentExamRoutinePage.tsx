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

function groupByDate(routines: ExamRoutine[]): Record<string, ExamRoutine[]> {
  const groups: Record<string, ExamRoutine[]> = {};
  for (const r of routines) {
    if (!groups[r.exam_date]) groups[r.exam_date] = [];
    groups[r.exam_date].push(r);
  }
  return groups;
}

export function StudentExamRoutinePage() {
  const { data: routines, isLoading } = useQuery({
    queryKey: ["student-exam-routines"],
    queryFn: async () => (await api.get("/exams/routines")).data as ExamRoutine[],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 h-28 animate-pulse" />
        <div className="bg-white rounded-2xl border border-slate-200 p-5 h-48 animate-pulse" />
      </div>
    );
  }

  const grouped = routines ? groupByDate(routines) : {};
  const dates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white shadow">
        <h2 className="text-2xl font-extrabold">Exam Routine</h2>
        <p className="text-indigo-100 text-sm mt-1">Your upcoming exam schedule</p>
      </div>

      {!routines || routines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-400">No exam routine published yet</p>
        </div>
      ) : (
        dates.map(date => (
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
                    <p className="text-xs text-slate-500">
                      {r.class_name}{r.section_name ? ` — ${r.section_name}` : ""}
                      {r.teacher_name ? ` • ${r.teacher_name}` : ""}
                    </p>
                  </div>
                  {r.room && (
                    <span className="text-[10px] font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
                      Room: {r.room}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
