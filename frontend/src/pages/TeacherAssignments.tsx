import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

interface RoutineEntry {
  day: string;
  class_name: string;
  section_name: string;
  subject_name: string;
}

interface ClassEntry {
  id: number;
  name: string;
  code: string;
}

interface SectionEntry {
  id: number;
  name: string;
  class_id: number;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
  class_name: string;
  section_name: string;
  subject_name: string;
}

interface ClassOption {
  class_name: string;
  section_name: string;
  subject_name: string;
  label: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getAssignmentStatus(dueDate: string): { label: string; color: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  if (due < today) {
    return { label: "Overdue", color: "bg-red-100 text-red-700" };
  }
  if (due.getTime() === today.getTime()) {
    return { label: "Due Today", color: "bg-amber-100 text-amber-700" };
  }
  return { label: "Upcoming", color: "bg-emerald-100 text-emerald-700" };
}

export function TeacherAssignments() {
  const queryClient = useQueryClient();
  const [selectedLabel, setSelectedLabel] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: routines, isLoading: routinesLoading } = useQuery({
    queryKey: ["teacher-routine"],
    queryFn: async () => (await api.get("/routines/teacher")).data as RoutineEntry[],
  });

  const { data: allClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await api.get("/admin/classes")).data as ClassEntry[],
  });

  const { data: allSections } = useQuery({
    queryKey: ["sections"],
    queryFn: async () => (await api.get("/admin/sections")).data as SectionEntry[],
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => (await api.get("/assignments")).data as Assignment[],
  });

  const classOptions: ClassOption[] = useMemo(() => {
    if (!routines) return [];
    const map = new Map<string, ClassOption>();
    for (const r of routines) {
      const key = `${r.class_name}|${r.section_name}|${r.subject_name}`;
      if (!map.has(key)) {
        map.set(key, {
          class_name: r.class_name,
          section_name: r.section_name,
          subject_name: r.subject_name,
          label: `${r.class_name} — ${r.section_name} — ${r.subject_name}`,
        });
      }
    }
    return Array.from(map.values());
  }, [routines]);

  const selectedOption = classOptions.find((c) => c.label === selectedLabel);

  const resolvedIds = useMemo(() => {
    if (!selectedOption || !allClasses || !allSections) return null;
    const cls = allClasses.find((c) => c.name === selectedOption.class_name);
    const sec = allSections.find((s) => s.name === selectedOption.section_name);
    if (!cls || !sec) return null;
    return { classId: cls.id, sectionId: sec.id };
  }, [selectedOption, allClasses, allSections]);

  const createMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      description: string;
      due_date: string;
      class_id: number;
      section_id: number;
      subject_id: number;
    }) => api.post("/assignments", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/assignments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setSelectedLabel("");
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!resolvedIds || !title.trim() || !dueDate) return;
    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate,
      class_id: resolvedIds.classId,
      section_id: resolvedIds.sectionId,
      subject_id: 0,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      deleteMutation.mutate(id);
    }
  };

  if (routinesLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 h-28 animate-pulse" />
        <div className="bg-white rounded-2xl border border-slate-200 p-5 h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Assignments</h2>
            <p className="text-indigo-100 text-sm mt-1">
              Create and manage assignments for your classes.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition"
          >
            {showForm ? "Cancel" : "+ New Assignment"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Create Assignment</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Class</label>
              <select
                value={selectedLabel}
                onChange={(e) => setSelectedLabel(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a class...</option>
                {classOptions.map((opt) => (
                  <option key={opt.label} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Assignment title"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Assignment description (optional)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedLabel || !title.trim() || !dueDate || createMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {createMutation.isPending ? "Creating..." : "Create Assignment"}
              </button>
            </div>

            {createMutation.isError && (
              <p className="text-xs text-red-600 text-right">
                Failed to create assignment. Please try again.
              </p>
            )}
            {createMutation.isSuccess && (
              <p className="text-xs text-emerald-600 text-right">
                Assignment created successfully.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">
          All Assignments{assignments ? ` (${assignments.length})` : ""}
        </h3>

        {assignmentsLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !assignments || assignments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            No assignments yet. Click "+ New Assignment" to create one.
          </p>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => {
              const status = getAssignmentStatus(a.due_date);
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {a.title}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {a.class_name} — {a.section_name} • {a.subject_name}
                    </p>
                    {a.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{a.description}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      Due: {formatDate(a.due_date)} • Created: {formatDate(a.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deleteMutation.isPending}
                    className="ml-4 shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                  >
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
