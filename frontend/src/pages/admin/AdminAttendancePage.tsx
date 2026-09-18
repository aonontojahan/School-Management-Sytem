import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useToast } from "../../components/ui/Toast";

interface SchoolClass { id: number; name: string; code: string; }
interface Section { id: number; name: string; class_id: number; }
interface Student { id: number; first_name: string; last_name: string; student_code: string; roll_number: number | null; class_id: number; section_id: number | null; }
interface AttendanceRecord { id: number; student_id: number; class_id: number; section_id: number | null; date: string; status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"; period: number | null; }
interface Period { id: number; number: number; label: string; start_time: string; end_time: string; }

export function AdminAttendancePage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [classFilter, setClassFilter] = useState<number | "">("");
  const [sectionFilter, setSectionFilter] = useState<number | "">("");
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [statuses, setStatuses] = useState<Record<number, "PRESENT" | "ABSENT">>({});

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await api.get("/academic/classes")).data as SchoolClass[],
  });

  const { data: sections } = useQuery({
    queryKey: ["sections", classFilter],
    queryFn: async () => {
      if (!classFilter) return [] as Section[];
      const res = await api.get(`/academic/classes/${classFilter}/sections`);
      return res.data as Section[];
    },
    enabled: !!classFilter,
  });

  const { data: periods } = useQuery({
    queryKey: ["periods"],
    queryFn: async () => (await api.get("/admin/periods")).data as Period[],
  });

  const { data: students } = useQuery({
    queryKey: ["students", classFilter, sectionFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { limit: 200 };
      if (classFilter) params.class_id = classFilter;
      if (sectionFilter) params.section_id = sectionFilter;
      const res = await api.get("/students", { params });
      return res.data as Student[];
    },
    enabled: !!classFilter,
  });

  const { data: attendance, isLoading } = useQuery({
    queryKey: ["attendance", classFilter, sectionFilter, dateFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { on_date: dateFilter };
      if (classFilter) params.class_id = classFilter;
      if (sectionFilter) params.section_id = sectionFilter;
      const res = await api.get("/attendance", { params });
      return res.data as AttendanceRecord[];
    },
  });

  useEffect(() => {
    if (students && students.length > 0) {
      const init: Record<number, "PRESENT" | "ABSENT"> = {};
      const existingMap = new Map<number, string>();
      if (attendance) {
        for (const a of attendance) {
          existingMap.set(a.student_id, a.status);
        }
      }
      for (const s of students) {
        init[s.id] = (existingMap.get(s.id) as "PRESENT" | "ABSENT") || "PRESENT";
      }
      setStatuses(init);
    }
  }, [students, attendance]);

  const submitMutation = useMutation({
    mutationFn: async (payload: {
      class_id: number;
      section_id: number | null;
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

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    let list = students;
    if (sectionFilter) list = list.filter(s => s.section_id === sectionFilter);
    return list;
  }, [students, sectionFilter]);

  const hasExisting = attendance && attendance.length > 0;

  const presentCount = filteredStudents.filter(s => statuses[s.id] === "PRESENT").length;
  const absentCount = filteredStudents.filter(s => statuses[s.id] === "ABSENT").length;
  const unmarkedCount = filteredStudents.filter(s => !statuses[s.id]).length;

  const toggleAll = (status: "PRESENT" | "ABSENT") => {
    if (!filteredStudents) return;
    const next: Record<number, "PRESENT" | "ABSENT"> = {};
    for (const s of filteredStudents) next[s.id] = status;
    setStatuses(next);
  };

  const handleSubmit = () => {
    if (!classFilter || !filteredStudents.length || !selectedPeriod) return;
    submitMutation.mutate({
      class_id: classFilter,
      section_id: sectionFilter || null,
      date: dateFilter,
      records: filteredStudents.map(s => ({
        student_id: s.id,
        status: statuses[s.id] ?? "PRESENT",
        period: selectedPeriod,
      })),
    });
  };

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
            <h1 className="text-2xl font-extrabold">Attendance</h1>
            <div className="inline-flex items-center gap-1.5 mt-1.5 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
              <svg className="w-3.5 h-3.5 text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-emerald-50 text-xs font-semibold">View and mark student attendance by class, section, and date</p>
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
            <h2 className="text-sm font-bold text-slate-900">Filters</h2>
            <p className="text-xs text-slate-500">Filter attendance by class, section, and date</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Class</label>
              <select value={classFilter} onChange={e => { setClassFilter(Number(e.target.value) || ""); setSectionFilter(""); setStatuses({}); }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition">
                <option value="">All Classes</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Section</label>
              <select value={sectionFilter} onChange={e => { setSectionFilter(Number(e.target.value) || ""); setStatuses({}); }}
                disabled={!classFilter}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition disabled:opacity-50">
                <option value="">All Sections</option>
                {sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date</label>
              <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Period *</label>
              <select value={selectedPeriod ?? ""} onChange={e => setSelectedPeriod(Number(e.target.value) || null)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition">
                <option value="">Select period...</option>
                {periods?.map(p => (
                  <option key={p.id} value={p.number}>{p.label} ({p.start_time?.slice(0, 5)} – {p.end_time?.slice(0, 5)})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {filteredStudents.length > 0 && (
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
                    Attendance for {dateFilter}
                    {hasExisting && <span className="ml-2 text-xs font-normal text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Previously marked</span>}
                  </h2>
                  <p className="text-xs text-slate-500">{filteredStudents.length} students{classFilter ? ` in ${classes?.find(c => c.id === classFilter)?.name || ""}` : ""}</p>
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
          <div className="grid grid-cols-4 divide-x divide-slate-100">
            <div className="px-6 py-4 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{filteredStudents.length}</p>
            </div>
            <div className="px-6 py-4 text-center">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Present</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{presentCount}</p>
            </div>
            <div className="px-6 py-4 text-center">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide">Absent</p>
              <p className="text-2xl font-extrabold text-red-600 mt-1">{absentCount}</p>
            </div>
            <div className="px-6 py-4 text-center">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Unmarked</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{unmarkedCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Student Cards */}
      {classFilter ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">Students{filteredStudents.length > 0 ? ` (${filteredStudents.length})` : ""}</h3>
            <p className="text-xs text-slate-500">Tap a student card to toggle between Present and Absent</p>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-slate-50 rounded-2xl animate-pulse" />)}
              </div>
            ) : filteredStudents.length === 0 ? (
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
                {filteredStudents.map(student => {
                  const isPresent = statuses[student.id] === "PRESENT";
                  return (
                    <div key={student.id}
                      onClick={() => setStatuses(prev => ({ ...prev, [student.id]: isPresent ? "ABSENT" : "PRESENT" }))}
                      className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 overflow-hidden group ${
                        isPresent
                          ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-100"
                          : "border-red-200 bg-gradient-to-br from-red-50 to-rose-50 hover:border-red-400 hover:shadow-md hover:shadow-red-100"
                      }`}>
                      <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] ${isPresent ? "bg-emerald-100/60" : "bg-red-100/60"}`} />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm ${
                            isPresent ? "bg-gradient-to-br from-emerald-500 to-teal-500" :
                            "bg-gradient-to-br from-red-500 to-rose-500"
                          }`}>
                            {`${student.first_name[0]}${student.last_name[0]}`.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{student.first_name} {student.last_name}</p>
                            <p className="text-[11px] text-slate-500">{student.student_code}</p>
                          </div>
                        </div>
                        {student.roll_number && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Roll</span>
                            <span className="text-xs font-bold text-slate-700">#{student.roll_number}</span>
                          </div>
                        )}
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          isPresent ? "bg-emerald-100 text-emerald-700" :
                          "bg-red-100 text-red-700"
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
          {filteredStudents.length > 0 && (
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
          <p className="text-xs text-slate-500">Choose a class to view and mark student attendance for the selected date</p>
        </div>
      )}
    </div>
  );
}
