import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

interface Exam { id: number; name: string; exam_type: string; class_id: number; }
interface DropdownItem { id: number; name: string; }
interface ExamRoutine {
  id: number; exam_id: number; exam_name: string; exam_type: string;
  class_id: number; class_name: string; section_id: number | null; section_name: string | null;
  subject_id: number; subject_name: string; teacher_id: number | null; teacher_name: string | null;
  exam_date: string; start_time: string; end_time: string; room: string | null;
}
interface RoutineForm {
  subject_id: string; exam_date: string;
  start_time: string; end_time: string; room: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

function downloadRoutinePdf(routines: ExamRoutine[], examName: string) {
  const lines: string[] = [];
  lines.push("EXAM ROUTINE");
  lines.push(`Exam: ${examName}`);
  lines.push("=".repeat(60));
  lines.push("");
  lines.push(`${"Date".padEnd(14)} ${"Time".padEnd(16)} ${"Subject".padEnd(20)} ${"Class".padEnd(12)} ${"Room"}`);
  lines.push("-".repeat(60));
  for (const r of routines) {
    lines.push(
      `${formatDate(r.exam_date).padEnd(14)} ${(r.start_time + "-" + r.end_time).padEnd(16)} ${(r.subject_name || "").padEnd(20)} ${(r.class_name || "").padEnd(12)} ${r.room || ""}`
    );
  }
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `exam-routine-${examName.replace(/\s+/g, "-").toLowerCase()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminExamRoutinePage() {
  const queryClient = useQueryClient();
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [routines, setRoutines] = useState<RoutineForm[]>([
    { subject_id: "", exam_date: "", start_time: "09:00", end_time: "11:00", room: "" },
  ]);

  const { data: exams } = useQuery({
    queryKey: ["admin-exams"],
    queryFn: async () => (await api.get("/exams")).data as Exam[],
  });

  const { data: classes } = useQuery({
    queryKey: ["admin-classes"],
    queryFn: async () => (await api.get("/admin/classes")).data as DropdownItem[],
  });

  const { data: allSubjects } = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: async () => (await api.get("/admin/subjects")).data as DropdownItem[],
  });

  const { data: classSubjects } = useQuery({
    queryKey: ["class-subjects", selectedClass],
    queryFn: async () => (await api.get(`/academic/classes/${selectedClass}`)).data as { subjects: DropdownItem[] },
    enabled: !!selectedClass,
  });

  const { data: existingRoutines } = useQuery({
    queryKey: ["exam-routines", selectedExam],
    queryFn: async () => (await api.get(`/exams/routines?exam_id=${selectedExam}`)).data as ExamRoutine[],
    enabled: !!selectedExam,
  });

  const subjects = classSubjects?.subjects || allSubjects || [];

  const bulkCreateMut = useMutation({
    mutationFn: async (items: Record<string, unknown>[]) => (await api.post("/exams/routines/bulk", items)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-routines"] });
      setRoutines([{ subject_id: "", exam_date: "", start_time: "09:00", end_time: "11:00", room: "" }]);
    },
  });

  const deleteRoutineMut = useMutation({
    mutationFn: async (id: number) => api.delete(`/exams/routines/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exam-routines"] }),
  });

  const addRow = () => setRoutines([...routines, { subject_id: "", exam_date: "", start_time: "09:00", end_time: "11:00", room: "" }]);
  const removeRow = (idx: number) => setRoutines(routines.filter((_, i) => i !== idx));
  const updateRow = (idx: number, field: keyof RoutineForm, value: string) => {
    const updated = [...routines];
    updated[idx] = { ...updated[idx], [field]: value };
    setRoutines(updated);
  };

  const handleSubmit = () => {
    if (!selectedExam || !selectedClass) return;
    const valid = routines.filter(r => r.subject_id && r.exam_date && r.start_time && r.end_time);
    if (valid.length === 0) return;
    const payload = valid.map(r => ({
      exam_id: Number(selectedExam), class_id: Number(selectedClass),
      subject_id: Number(r.subject_id), teacher_id: null,
      exam_date: r.exam_date, start_time: r.start_time, end_time: r.end_time, room: r.room || null,
    }));
    bulkCreateMut.mutate(payload);
  };

  const selectedExamObj = exams?.find(e => e.id === Number(selectedExam));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white shadow">
        <h2 className="text-2xl font-extrabold">Exam Routine</h2>
        <p className="text-indigo-100 text-sm mt-1">Create and manage exam schedules for all classes</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Select Exam & Class</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Exam *</label>
            <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">-- Select Exam --</option>
              {exams?.map(e => <option key={e.id} value={e.id}>{e.name} ({e.exam_type.replace("_", " ")})</option>)}
            </select>
            {!exams || exams.length === 0 ? <p className="text-[10px] text-amber-600 mt-1">No exams found. Create an exam first.</p> : null}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Class *</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">-- Select Class --</option>
              {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedExam && selectedClass && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Add Exam Schedule{selectedExamObj ? ` — ${selectedExamObj.name}` : ""}</h3>
            <button onClick={addRow} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Row
            </button>
          </div>
          <div className="space-y-3">
            {routines.map((row, idx) => (
              <div key={idx} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end p-3 bg-slate-50 rounded-xl">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Subject *</label>
                  <select value={row.subject_id} onChange={(e) => updateRow(idx, "subject_id", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">-- Subject --</option>
                    {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Date *</label>
                  <input type="date" value={row.exam_date} onChange={(e) => updateRow(idx, "exam_date", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Start *</label>
                  <input type="time" value={row.start_time} onChange={(e) => updateRow(idx, "start_time", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">End *</label>
                  <input type="time" value={row.end_time} onChange={(e) => updateRow(idx, "end_time", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex items-end gap-1">
                  <div className="flex-1">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Room</label>
                    <input type="text" value={row.room} onChange={(e) => updateRow(idx, "room", e.target.value)} placeholder="Room"
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  {routines.length > 1 && (
                    <button onClick={() => removeRow(idx)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition mb-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4 gap-3">
            <button onClick={handleSubmit} disabled={bulkCreateMut.isPending}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
              {bulkCreateMut.isPending ? "Saving..." : `Save ${routines.filter(r => r.subject_id && r.exam_date).length} Routine(s)`}
            </button>
          </div>
          {bulkCreateMut.isError && <p className="text-xs text-red-600 mt-2 text-right">Failed. Check for duplicate entries.</p>}
          {bulkCreateMut.isSuccess && <p className="text-xs text-emerald-600 mt-2 text-right">Saved. Students and teachers have been notified.</p>}
        </div>
      )}

      {selectedExam && existingRoutines && existingRoutines.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Scheduled Exams ({existingRoutines.length})</h3>
            <button onClick={() => downloadRoutinePdf(existingRoutines, selectedExamObj?.name || "Exam")}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Download PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Date</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Time</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Subject</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Class</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Room</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Action</th>
              </tr></thead>
              <tbody>
                {existingRoutines.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 px-3 text-xs font-medium text-slate-700">{formatDate(r.exam_date)}</td>
                    <td className="py-2 px-3 text-xs text-slate-600">{r.start_time} - {r.end_time}</td>
                    <td className="py-2 px-3 text-xs font-semibold text-slate-900">{r.subject_name}</td>
                    <td className="py-2 px-3 text-xs text-slate-600">{r.class_name}{r.section_name ? ` - ${r.section_name}` : ""}</td>
                    <td className="py-2 px-3 text-xs text-slate-600">{r.room || "—"}</td>
                    <td className="py-2 px-3 text-right">
                      <button onClick={() => { if (confirm("Delete this entry?")) deleteRoutineMut.mutate(r.id); }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
