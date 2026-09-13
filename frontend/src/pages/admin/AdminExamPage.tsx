import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

interface Exam {
  id: number;
  academic_year_id: number;
  class_id: number | null;
  name: string;
  exam_type: string;
  total_marks: number;
  passing_marks: number;
  start_date: string | null;
  end_date: string | null;
}

interface DropdownItem { id: number; name: string; }

const EXAM_TYPES = [
  { value: "MONTHLY_TEST", label: "Monthly Test", color: "emerald", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", desc: "6 exams/day, 45 min each, up to 3 days" },
  { value: "MID_TERM", label: "Mid Term", color: "amber", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", desc: "2 exams/day, 3 hours each, up to 15 days" },
  { value: "FINAL", label: "Final Term", color: "red", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", desc: "2 exams/day, 3 hours each, up to 15 days" },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; light: string }> = {
  MONTHLY_TEST: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", light: "bg-emerald-50" },
  MID_TERM: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", light: "bg-amber-50" },
  FINAL: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", light: "bg-red-50" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function examTypeBadge(type: string) {
  const t = EXAM_TYPES.find(e => e.value === type);
  const c = TYPE_COLORS[type] || { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
      {t?.label || type}
    </span>
  );
}

export function AdminExamPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [form, setForm] = useState({
    exam_type: "MONTHLY_TEST",
    total_marks: "100", passing_marks: "33", start_date: "", end_date: "",
  });

  const { data: exams, isLoading } = useQuery({
    queryKey: ["admin-exams"],
    queryFn: async () => (await api.get("/exams")).data as Exam[],
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
      setForm({ exam_type: "MONTHLY_TEST", total_marks: "100", passing_marks: "33", start_date: "", end_date: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/exams/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-exams"] }),
  });

  const handleSubmit = () => {
    const activeYear = academicYears && academicYears.length > 0 ? academicYears[academicYears.length - 1] : null;
    const examTypeLabel = EXAM_TYPES.find((t) => t.value === form.exam_type)?.label || form.exam_type;
    createMutation.mutate({
      name: examTypeLabel,
      exam_type: form.exam_type,
      class_id: null,
      academic_year_id: activeYear?.id || 1,
      total_marks: Number(form.total_marks) || 100,
      passing_marks: Number(form.passing_marks) || 33,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    });
  };

  const filteredExams = exams?.filter(e => !selectedType || e.exam_type === selectedType);
  const monthlyCount = exams?.filter(e => e.exam_type === "MONTHLY_TEST").length || 0;
  const midCount = exams?.filter(e => e.exam_type === "MID_TERM").length || 0;
  const finalCount = exams?.filter(e => e.exam_type === "FINAL").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Examinations</h1>
            <p className="text-indigo-100 text-sm mt-0.5">Create school-wide Monthly, Mid-term & Final exams for all classes</p>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-indigo-50/50">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Create New Exam</h2>
              <p className="text-xs text-slate-500">This exam will apply to ALL classes — all students will be notified</p>
            </div>
          </div>
          <div className="p-6">
            {/* Exam Type Cards */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-600 mb-3">Exam Type *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {EXAM_TYPES.map((t) => {
                  const c = TYPE_COLORS[t.value];
                  const isSelected = form.exam_type === t.value;
                  return (
                    <button key={t.value} onClick={() => setForm({ ...form, exam_type: t.value })}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? `border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100`
                          : `border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm`
                      }`}>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className={`w-10 h-10 rounded-xl ${c.light} flex items-center justify-center mb-3`}>
                        <svg className={`w-5 h-5 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{t.label}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Total Marks</label>
                <input type="number" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Passing Marks</label>
                <input type="number" value={form.passing_marks} onChange={(e) => setForm({ ...form, passing_marks: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Date</label>
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Date</label>
                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
              </div>
            </div>

            {/* Info Banner */}
            <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
              <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs font-medium text-blue-700">
                This exam is <strong>school-wide</strong> — all students across all classes will see it. Generate routines per class from the Exam Routine page.
              </p>
            </div>

            <div className="flex justify-end mt-5 gap-3">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={createMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm shadow-indigo-200">
                {createMutation.isPending ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Exam
                  </>
                )}
              </button>
            </div>
            {createMutation.isError && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-red-700">Failed to create exam. Please try again.</p>
              </div>
            )}
            {createMutation.isSuccess && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-emerald-700">Exam created. All students have been notified.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {EXAM_TYPES.map((t) => {
          const c = TYPE_COLORS[t.value];
          const count = t.value === "MONTHLY_TEST" ? monthlyCount : t.value === "MID_TERM" ? midCount : finalCount;
          return (
            <div key={t.value} className="relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedType(selectedType === t.value ? null : t.value)}>
              <div className={`absolute top-0 right-0 w-20 h-20 ${c.light} rounded-bl-[40px] -z-0`} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                    <svg className={`w-4 h-4 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.label}</p>
                </div>
                <p className={`text-2xl font-extrabold ${c.text}`}>{count}</p>
                <p className="text-[10px] text-slate-400 mt-1">exams created</p>
              </div>
              {selectedType === t.value && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Exams List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">All Exams{selectedType ? ` — ${EXAM_TYPES.find(t => t.value === selectedType)?.label}` : ""}</h2>
              <p className="text-xs text-slate-500">{filteredExams?.length || 0} exams shown</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedType && (
              <button onClick={() => setSelectedType(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filter
              </button>
            )}
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? "Close" : "New Exam"}
            </button>
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />)}</div>
          ) : !filteredExams || filteredExams.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1">{selectedType ? "No exams of this type" : "No exams created yet"}</p>
              <p className="text-xs text-slate-500 mb-4">{selectedType ? "Try clearing the filter" : "Click \"New Exam\" to create one"}</p>
              {!selectedType && (
                <button onClick={() => setShowForm(true)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition">
                  + Create First Exam
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExams.map((exam) => {
                const c = TYPE_COLORS[exam.exam_type] || { bg: "bg-slate-100", text: "text-slate-600", light: "bg-slate-50" };
                return (
                  <div key={exam.id} className="group flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                        <svg className={`w-6 h-6 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={EXAM_TYPES.find(t => t.value === exam.exam_type)?.icon || ""} />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-slate-900">{exam.name}</p>
                          {examTypeBadge(exam.exam_type)}
                        </div>
                        <p className="text-xs text-slate-500">
                          {exam.total_marks} marks · Pass: {exam.passing_marks}
                          {exam.start_date && <> · {formatDate(exam.start_date)}{exam.end_date ? ` — ${formatDate(exam.end_date)}` : ""}</>}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => { if (confirm("Delete this exam?")) deleteMutation.mutate(exam.id); }}
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition opacity-0 group-hover:opacity-100 disabled:opacity-50" title="Delete">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
