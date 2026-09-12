import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

interface Exam {
  id: number;
  academic_year_id: number;
  class_id: number;
  name: string;
  exam_type: string;
  total_marks: number;
  passing_marks: number;
  start_date: string | null;
  end_date: string | null;
}

interface DropdownItem { id: number; name: string; }

const EXAM_TYPES = [
  { value: "CLASS_TEST", label: "Class Test" },
  { value: "MONTHLY_TEST", label: "Monthly Test" },
  { value: "MID_TERM", label: "Mid Term" },
  { value: "FINAL", label: "Final Term" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function examTypeBadge(type: string) {
  const colors: Record<string, string> = {
    MID_TERM: "bg-amber-100 text-amber-700 border-amber-200",
    FINAL: "bg-red-100 text-red-700 border-red-200",
    CLASS_TEST: "bg-sky-100 text-sky-700 border-sky-200",
    MONTHLY_TEST: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  const label = EXAM_TYPES.find((t) => t.value === type)?.label || type;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[type] || "bg-slate-100 text-slate-600"}`}>
      {label}
    </span>
  );
}

export function AdminExamPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", exam_type: "CLASS_TEST", class_id: "",
    total_marks: "100", passing_marks: "33", start_date: "", end_date: "",
  });

  const { data: exams, isLoading } = useQuery({
    queryKey: ["admin-exams"],
    queryFn: async () => (await api.get("/exams")).data as Exam[],
  });

  const { data: classes } = useQuery({
    queryKey: ["admin-classes"],
    queryFn: async () => (await api.get("/admin/classes")).data as DropdownItem[],
  });

  const { data: academicYears } = useQuery({
    queryKey: ["admin-academic-years"],
    queryFn: async () => {
      try { return (await api.get("/academic/years")).data as DropdownItem[]; }
      catch { return [] as DropdownItem[]; }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post("/exams", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-exams"] });
      setShowForm(false);
      setForm({ name: "", exam_type: "CLASS_TEST", class_id: "", total_marks: "100", passing_marks: "33", start_date: "", end_date: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/exams/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-exams"] }),
  });

  const handleSubmit = () => {
    if (!form.name.trim() || !form.class_id) return;
    const activeYear = academicYears && academicYears.length > 0 ? academicYears[academicYears.length - 1] : null;
    createMutation.mutate({
      name: form.name.trim(),
      exam_type: form.exam_type,
      class_id: Number(form.class_id),
      academic_year_id: activeYear?.id || 1,
      total_marks: Number(form.total_marks) || 100,
      passing_marks: Number(form.passing_marks) || 33,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Examinations</h2>
            <p className="text-indigo-100 text-sm mt-1">Create and manage exams for all classes</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition">
            {showForm ? "Cancel" : "+ New Exam"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Create Exam</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Exam Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mid Term Examination 2026"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Exam Type *</label>
              <select value={form.exam_type} onChange={(e) => setForm({ ...form, exam_type: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                {EXAM_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Class *</label>
              <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select class...</option>
                {classes?.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Total Marks</label>
              <input type="number" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Passing Marks</label>
              <input type="number" value={form.passing_marks} onChange={(e) => setForm({ ...form, passing_marks: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
            <button onClick={handleSubmit} disabled={!form.name.trim() || !form.class_id || createMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
              {createMutation.isPending ? "Creating..." : "Create Exam"}
            </button>
          </div>
          {createMutation.isError && <p className="text-xs text-red-600 mt-2 text-right">Failed to create exam. Please try again.</p>}
          {createMutation.isSuccess && <p className="text-xs text-emerald-600 mt-2 text-right">Exam created. Students have been notified.</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">All Exams{exams ? ` (${exams.length})` : ""}</h3>
        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}</div>
        ) : !exams || exams.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No exams created yet. Click "+ New Exam" to create one.</p>
        ) : (
          <div className="space-y-3">
            {exams.map((exam) => {
              const cls = classes?.find((c) => c.id === exam.class_id);
              return (
                <div key={exam.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-semibold text-slate-900">{exam.name}</p>
                      {examTypeBadge(exam.exam_type)}
                    </div>
                    <p className="text-xs text-slate-500">{cls?.name || "—"} • {exam.total_marks} marks • Pass: {exam.passing_marks}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(exam.start_date)}{exam.start_date && exam.end_date ? " — " : ""}{formatDate(exam.end_date)}</p>
                  </div>
                  <button onClick={() => { if (confirm("Delete this exam?")) deleteMutation.mutate(exam.id); }}
                    disabled={deleteMutation.isPending}
                    className="ml-4 shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition disabled:opacity-50">
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
