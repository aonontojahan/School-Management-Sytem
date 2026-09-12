import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

interface RoutineEntry {
  day: string;
  period_label: string;
  class_name: string;
  section_name: string;
  subject_name: string;
}

interface Period {
  id: number;
  number: number;
  label: string;
  start_time: string;
  end_time: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  student_code: string;
}

interface ClassOption {
  class_name: string;
  section_name: string;
  subject_name: string;
  label: string;
}

interface ClassEntry {
  id: number;
  name: string;
}

interface SectionEntry {
  id: number;
  name: string;
}

function getTodayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function TeacherAttendance() {
  const queryClient = useQueryClient();
  const [selectedLabel, setSelectedLabel] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [date, setDate] = useState(getTodayISO());
  const [statuses, setStatuses] = useState<Record<number, "PRESENT" | "ABSENT">>({});

  const { data: routines, isLoading: routinesLoading } = useQuery({
    queryKey: ["teacher-routine"],
    queryFn: async () => (await api.get("/routines/teacher")).data as RoutineEntry[],
  });

  const { data: periods, isLoading: periodsLoading } = useQuery({
    queryKey: ["periods"],
    queryFn: async () => (await api.get("/admin/periods")).data as Period[],
  });

  const { data: allClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await api.get("/admin/classes")).data as ClassEntry[],
  });

  const { data: allSections } = useQuery({
    queryKey: ["sections"],
    queryFn: async () => (await api.get("/admin/sections")).data as SectionEntry[],
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

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students", resolvedIds?.classId, resolvedIds?.sectionId],
    queryFn: async () => {
      const res = await api.get("/admin/students", {
        params: { class_id: resolvedIds!.classId, section_id: resolvedIds!.sectionId },
      });
      return res.data as Student[];
    },
    enabled: !!resolvedIds,
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: {
      class_id: number;
      section_id: number;
      date: string;
      records: { student_id: number; status: "PRESENT" | "ABSENT"; period_id: number }[];
    }) => api.post("/attendance", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      setStatuses({});
    },
  });

  // Default all students to PRESENT when loaded
  if (students && students.length > 0 && Object.keys(statuses).length === 0) {
    const init: Record<number, "PRESENT" | "ABSENT"> = {};
    for (const s of students) init[s.id] = "PRESENT";
    setStatuses(init);
  }

  const toggleAll = (status: "PRESENT" | "ABSENT") => {
    if (!students) return;
    const next: Record<number, "PRESENT" | "ABSENT"> = {};
    for (const s of students) next[s.id] = status;
    setStatuses(next);
  };

  const handleSubmit = () => {
    if (!resolvedIds || !students || !selectedPeriod) return;
    submitMutation.mutate({
      class_id: resolvedIds.classId,
      section_id: resolvedIds.sectionId,
      date,
      records: students.map((s) => ({
        student_id: s.id,
        status: statuses[s.id] ?? "PRESENT",
        period_id: selectedPeriod,
      })),
    });
  };

  if (routinesLoading || periodsLoading) {
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
        <h2 className="text-2xl font-extrabold">Take Attendance</h2>
        <p className="text-indigo-100 text-sm mt-1">
          Select your class, period, and mark student attendance.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Class & Period</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Class</label>
            <select
              value={selectedLabel}
              onChange={(e) => {
                setSelectedLabel(e.target.value);
                setStatuses({});
              }}
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
            <label className="block text-xs font-semibold text-slate-500 mb-1">Period</label>
            <select
              value={selectedPeriod ?? ""}
              onChange={(e) => setSelectedPeriod(Number(e.target.value) || null)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a period...</option>
              {periods?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.start_time?.slice(0, 5)} – {p.end_time?.slice(0, 5)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {selectedOption ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">
              Students{students ? ` (${students.length})` : ""}
            </h3>
            {students && students.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAll("PRESENT")}
                  className="text-xs font-medium px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                >
                  All Present
                </button>
                <button
                  onClick={() => toggleAll("ABSENT")}
                  className="text-xs font-medium px-3 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition"
                >
                  All Absent
                </button>
              </div>
            )}
          </div>

          {studentsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !students || students.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No students found for this class.
            </p>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{student.student_code}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`student-${student.id}`}
                        checked={statuses[student.id] === "PRESENT"}
                        onChange={() =>
                          setStatuses((prev) => ({ ...prev, [student.id]: "PRESENT" }))
                        }
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-medium text-emerald-700">Present</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`student-${student.id}`}
                        checked={statuses[student.id] === "ABSENT"}
                        onChange={() =>
                          setStatuses((prev) => ({ ...prev, [student.id]: "ABSENT" }))
                        }
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-xs font-medium text-red-700">Absent</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {students && students.length > 0 && (
            <div className="mt-5 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!selectedPeriod || submitMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Attendance"}
              </button>
            </div>
          )}

          {submitMutation.isError && (
            <p className="text-xs text-red-600 mt-3 text-right">
              Failed to submit attendance. Please try again.
            </p>
          )}
          {submitMutation.isSuccess && (
            <p className="text-xs text-emerald-600 mt-3 text-right">
              Attendance submitted successfully.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm text-slate-400 text-center py-8">
            Select a class above to view students and take attendance.
          </p>
        </div>
      )}
    </div>
  );
}
