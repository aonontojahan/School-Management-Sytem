import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useToast } from "../components/ui/Toast";

interface RoutineEntry {
  id: number;
  day: string;
  period_label: string;
  class_id: number;
  class_name: string;
  section_id: number;
  section_name: string;
  subject_id: number;
  subject_name: string;
  group: string | null;
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
  roll_number: number | null;
  class_id: number;
  section_id: number | null;
}

interface ExistingAttendance {
  student_id: number;
  status: "PRESENT" | "ABSENT";
  period: number | null;
}

function getTodayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function getTodayDayName(): string {
  const d = new Date().getDay();
  return DAYS[d] === "FRIDAY" || DAYS[d] === "SATURDAY" ? "SUNDAY" : DAYS[d];
}

export function TeacherAttendance() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [selectedClassSection, setSelectedClassSection] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [date, setDate] = useState(getTodayISO());
  const [statuses, setStatuses] = useState<Record<number, "PRESENT" | "ABSENT">>({});

  const todayDay = getTodayDayName();

  const { data: routines, isLoading: routinesLoading } = useQuery({
    queryKey: ["teacher-routine"],
    queryFn: async () => (await api.get("/routines/teacher")).data as RoutineEntry[],
  });

  const { data: periods, isLoading: periodsLoading } = useQuery({
    queryKey: ["periods"],
    queryFn: async () => (await api.get("/admin/periods")).data as Period[],
  });

  const classSectionOptions = useMemo(() => {
    if (!routines) return [];
    const map = new Map<string, { classId: number; class_name: string; sectionId: number; section_name: string }>();
    for (const r of routines) {
      const key = `${r.class_id}|${r.section_id}`;
      if (!map.has(key)) {
        map.set(key, { classId: r.class_id, class_name: r.class_name, sectionId: r.section_id, section_name: r.section_name });
      }
    }
    return Array.from(map.values());
  }, [routines]);

  const todayRoutines = useMemo(() => {
    if (!routines || !selectedClassSection) return [];
    const [classId, sectionId] = selectedClassSection.split("|").map(Number);
    return routines.filter(r => r.class_id === classId && r.section_id === sectionId && r.day === todayDay);
  }, [routines, selectedClassSection, todayDay]);

  const selectedOption = classSectionOptions.find(o => `${o.classId}|${o.sectionId}` === selectedClassSection);

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students", selectedOption?.classId, selectedOption?.sectionId],
    queryFn: async () => {
      const res = await api.get("/students", {
        params: { class_id: selectedOption!.classId, section_id: selectedOption!.sectionId, limit: 200 },
      });
      return res.data as Student[];
    },
    enabled: !!selectedOption,
  });

  const { data: existingAttendance } = useQuery({
    queryKey: ["attendance", selectedOption?.classId, selectedOption?.sectionId, date, selectedPeriod],
    queryFn: async () => {
      const params: Record<string, string | number> = { class_id: selectedOption!.classId, on_date: date };
      if (selectedOption!.sectionId) params.section_id = selectedOption!.sectionId;
      const res = await api.get("/attendance", { params });
      return res.data as ExistingAttendance[];
    },
    enabled: !!selectedOption && !!date,
  });

  useEffect(() => {
    if (students && students.length > 0) {
      const init: Record<number, "PRESENT" | "ABSENT"> = {};
      const existingMap = new Map<number, string>();
      if (existingAttendance) {
        for (const a of existingAttendance) {
          existingMap.set(a.student_id, a.status);
        }
      }
      for (const s of students) {
        init[s.id] = (existingMap.get(s.id) as "PRESENT" | "ABSENT") || "PRESENT";
      }
      setStatuses(init);
    }
  }, [students, existingAttendance]);

  const submitMutation = useMutation({
    mutationFn: async (payload: {
      class_id: number;
      section_id: number;
      date: string;
      records: { student_id: number; status: "PRESENT" | "ABSENT"; period: number }[];
    }) => api.post("/attendance/bulk", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      showToast("Attendance submitted successfully");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to submit attendance", "error");
    },
  });

  const toggleAll = (status: "PRESENT" | "ABSENT") => {
    if (!students) return;
    const next: Record<number, "PRESENT" | "ABSENT"> = {};
    for (const s of students) next[s.id] = status;
    setStatuses(next);
  };

  const handleSubmit = () => {
    if (!selectedOption || !students || !selectedPeriod) return;
    submitMutation.mutate({
      class_id: selectedOption.classId,
      section_id: selectedOption.sectionId,
      date,
      records: students.map(s => ({
        student_id: s.id,
        status: statuses[s.id] ?? "PRESENT",
        period: selectedPeriod,
      })),
    });
  };

  const presentCount = students ? Object.values(statuses).filter(s => s === "PRESENT").length : 0;
  const absentCount = students ? Object.values(statuses).filter(s => s === "ABSENT").length : 0;
  const hasExisting = existingAttendance && existingAttendance.length > 0;

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
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Take Attendance</h1>
            <div className="inline-flex items-center gap-1.5 mt-1.5 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
              <svg className="w-3.5 h-3.5 text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-emerald-50 text-xs font-semibold">Select your class, period, and mark student attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Class & Period</h2>
            <p className="text-xs text-slate-500">Select your class, period, and date</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Class *</label>
              <select value={selectedClassSection} onChange={e => { setSelectedClassSection(e.target.value); setStatuses({}); }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition">
                <option value="">Select a class...</option>
                {classSectionOptions.map(o => (
                  <option key={`${o.classId}|${o.sectionId}`} value={`${o.classId}|${o.sectionId}`}>{o.class_name} — {o.section_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Period *</label>
              <select value={selectedPeriod ?? ""} onChange={e => setSelectedPeriod(Number(e.target.value) || null)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition">
                <option value="">Select a period...</option>
                {periods?.map(p => (
                  <option key={p.id} value={p.id}>{p.label} ({p.start_time?.slice(0, 5)} – {p.end_time?.slice(0, 5)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Routine */}
      {selectedClassSection && todayRoutines.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Today's Schedule</p>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-2">
              {todayRoutines.map(r => (
                <div key={r.id} className="flex items-center gap-2 bg-indigo-50 rounded-xl px-4 py-2 border border-indigo-100">
                  <span className="text-xs font-bold text-indigo-600">{r.period_label}</span>
                  <span className="w-px h-3 bg-indigo-200" />
                  <span className="text-sm font-medium text-slate-700">{r.subject_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {selectedClassSection && todayRoutines.length === 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="p-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">No routine today</p>
              <p className="text-xs text-amber-600">You have no classes scheduled for today in this section</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary Card */}
      {selectedOption && students && students.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {selectedOption.class_name} — {selectedOption.section_name}
                    {hasExisting && <span className="ml-2 text-xs font-normal text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Previously marked</span>}
                  </h2>
                  <p className="text-xs text-slate-500">{students.length} students enrolled</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleAll("PRESENT")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold hover:bg-emerald-200 transition">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  All Present
                </button>
                <button onClick={() => toggleAll("ABSENT")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  All Absent
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <div className="px-6 py-4 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{students.length}</p>
            </div>
            <div className="px-6 py-4 text-center">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Present</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{presentCount}</p>
            </div>
            <div className="px-6 py-4 text-center">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide">Absent</p>
              <p className="text-2xl font-extrabold text-red-600 mt-1">{absentCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Student Cards */}
      {selectedOption ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">Student Attendance{students ? ` (${students.length})` : ""}</h3>
            <p className="text-xs text-slate-500">Tap a student card to toggle between Present and Absent</p>
          </div>

          <div className="p-6">
            {studentsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-slate-50 rounded-2xl animate-pulse" />)}
              </div>
            ) : !students || students.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">No students found</p>
                <p className="text-xs text-slate-500">No students enrolled in this class/section</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => {
                  const isPresent = statuses[student.id] === "PRESENT";
                  return (
                    <div key={student.id} onClick={() => setStatuses(prev => ({ ...prev, [student.id]: isPresent ? "ABSENT" : "PRESENT" }))}
                      className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 overflow-hidden group ${
                        isPresent
                          ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-100"
                          : "border-red-200 bg-gradient-to-br from-red-50 to-rose-50 hover:border-red-400 hover:shadow-md hover:shadow-red-100"
                      }`}>
                      {/* Corner badge */}
                      <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] ${isPresent ? "bg-emerald-100/60" : "bg-red-100/60"}`} />

                      <div className="relative z-10">
                        {/* Avatar + Name */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm ${
                            isPresent ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "bg-gradient-to-br from-red-500 to-rose-500"
                          }`}>
                            {`${student.first_name[0]}${student.last_name[0]}`.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{student.first_name} {student.last_name}</p>
                            <p className="text-[11px] text-slate-500">{student.student_code}</p>
                          </div>
                        </div>

                        {/* Roll */}
                        {student.roll_number && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Roll</span>
                            <span className="text-xs font-bold text-slate-700">#{student.roll_number}</span>
                          </div>
                        )}

                        {/* Status badge */}
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          isPresent ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>
                          {isPresent ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {isPresent ? "Present" : "Absent"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit */}
          {students && students.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />{presentCount} present
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-red-500" />{absentCount} absent
                  </div>
                </div>
                <button onClick={handleSubmit}
                  disabled={!selectedPeriod || submitMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm shadow-emerald-200">
                  {submitMutation.isPending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {hasExisting ? "Update Attendance" : "Submit Attendance"}
                    </>
                  )}
                </button>
              </div>
              {!selectedPeriod && (
                <p className="mt-2 text-xs text-amber-600">Select a period before submitting</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-1">Select a class above</p>
          <p className="text-xs text-slate-500">Choose a class and period to view students and take attendance</p>
        </div>
      )}
    </div>
  );
}
