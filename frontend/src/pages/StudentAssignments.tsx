import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useToast } from "../components/ui/Toast";
import { EmptyState } from "../components/ui/EmptyState";

interface StudentAssignment {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  created_at: string | null;
  class_name: string | null;
  section_name: string | null;
  subject_name: string | null;
  status: "PENDING" | "SUBMITTED" | "MISSING";
  submitted_at: string | null;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Pending" },
  SUBMITTED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Submitted" },
  MISSING: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Missing" },
};

export function StudentAssignments() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [submitOpen, setSubmitOpen] = useState<number | null>(null);
  const [content, setContent] = useState("");

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["student-assignments"],
    queryFn: async () => (await api.get("/assignments/my")).data as StudentAssignment[],
  });

  const submitMut = useMutation({
    mutationFn: async (assignmentId: number) =>
      (await api.post(`/assignments/${assignmentId}/submissions`, { content_text: content })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-assignments"] });
      setSubmitOpen(null);
      setContent("");
      showToast("Assignment submitted");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to submit", "error");
    },
  });

  const pending = assignments?.filter(a => a.status === "PENDING") || [];
  const missing = assignments?.filter(a => a.status === "MISSING") || [];
  const submitted = assignments?.filter(a => a.status === "SUBMITTED") || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-5 -bottom-5 w-28 h-28 bg-white/10 rounded-full blur-xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold">My Assignments</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mt-2 text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View and submit your assignments
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-amber-700">{pending.length}</div>
          <div className="text-xs font-medium text-amber-600 mt-1">Pending</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-red-700">{missing.length}</div>
          <div className="text-xs font-medium text-red-600 mt-1">Missing</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-emerald-700">{submitted.length}</div>
          <div className="text-xs font-medium text-emerald-600 mt-1">Submitted</div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-500 animate-pulse">Loading assignments…</div>
      ) : !assignments || assignments.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No assignments yet"
          description="Assignments from your teachers will appear here."
        />
      ) : (
        <div className="space-y-3">
          {assignments.map(a => {
            const cfg = STATUS_CONFIG[a.status];
            const isOverdue = a.status === "MISSING";
            return (
              <div key={a.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${isOverdue ? "border-red-200" : "border-slate-200"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                      <span>{a.subject_name}</span>
                      <span>•</span>
                      <span>{a.class_name} – {a.section_name}</span>
                      {a.due_date && (
                        <>
                          <span>•</span>
                          <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
                            Due: {new Date(a.due_date).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                    {a.description && (
                      <p className="text-sm text-slate-600 mt-1">{a.description}</p>
                    )}
                    {a.submitted_at && (
                      <p className="text-xs text-emerald-600 mt-2">Submitted: {new Date(a.submitted_at).toLocaleString()}</p>
                    )}
                  </div>
                  {a.status === "PENDING" && (
                    <button
                      onClick={() => setSubmitOpen(a.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shrink-0"
                    >
                      Submit
                    </button>
                  )}
                  {a.status === "MISSING" && (
                    <button
                      onClick={() => setSubmitOpen(a.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition shrink-0"
                    >
                      Submit Late
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      {submitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Submit Assignment</h2>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your answer or paste a link..."
              rows={6}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setSubmitOpen(null); setContent(""); }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
              <button onClick={() => submitMut.mutate(submitOpen)} disabled={submitMut.isPending || !content.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
                {submitMut.isPending ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
