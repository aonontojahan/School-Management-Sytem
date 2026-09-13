import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

interface SchoolClass { id: number; name: string; code: string; }
interface Section { id: number; name: string; class_id: number; }
interface Student { id: number; first_name: string; last_name: string; student_code: string; roll_number: number | null; class_id: number; section_id: number | null; }
interface AttendanceRecord { id: number; student_id: number; class_id: number; section_id: number | null; date: string; status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"; period: number | null; }

export function AdminAttendancePage() {
  const [classFilter, setClassFilter] = useState<number | "">("");
  const [sectionFilter, setSectionFilter] = useState<number | "">("");
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().slice(0, 10));

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
    queryKey: ["attendance", classFilter, dateFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { on_date: dateFilter };
      if (classFilter) params.class_id = classFilter;
      const res = await api.get("/attendance", { params });
      return res.data as AttendanceRecord[];
    },
  });

  const attendanceMap = useMemo(() => {
    if (!attendance) return {} as Record<number, string>;
    return Object.fromEntries(attendance.map(a => [a.student_id, a.status]));
  }, [attendance]);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    let list = students;
    if (sectionFilter) list = list.filter(s => s.section_id === sectionFilter);
    return list;
  }, [students, sectionFilter]);

  const presentCount = filteredStudents.filter(s => attendanceMap[s.id] === "PRESENT").length;
  const absentCount = filteredStudents.filter(s => attendanceMap[s.id] === "ABSENT").length;
  const unmarkedCount = filteredStudents.filter(s => !attendanceMap[s.id]).length;

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
              <p className="text-emerald-50 text-xs font-semibold">View student attendance by class, section, and date</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Class</label>
              <select value={classFilter} onChange={e => { setClassFilter(Number(e.target.value) || ""); setSectionFilter(""); }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition">
                <option value="">All Classes</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Section</label>
              <select value={sectionFilter} onChange={e => setSectionFilter(Number(e.target.value) || "")}
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
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {filteredStudents.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Attendance for {dateFilter}</h2>
                <p className="text-xs text-slate-500">{filteredStudents.length} students{classFilter ? ` in ${classes?.find(c => c.id === classFilter)?.name || ""}` : ""}</p>
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
            <p className="text-xs text-slate-500">Student attendance status for the selected date</p>
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
                  const status = attendanceMap[student.id];
                  const isPresent = status === "PRESENT";
                  const isAbsent = status === "ABSENT";
                  const isUnmarked = !status;
                  return (
                    <div key={student.id} className={`relative rounded-2xl border-2 p-5 overflow-hidden transition-all ${
                      isPresent ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50" :
                      isAbsent ? "border-red-200 bg-gradient-to-br from-red-50 to-rose-50" :
                      "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50"
                    }`}>
                      <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] ${
                        isPresent ? "bg-emerald-100/60" : isAbsent ? "bg-red-100/60" : "bg-amber-100/60"
                      }`} />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm ${
                            isPresent ? "bg-gradient-to-br from-emerald-500 to-teal-500" :
                            isAbsent ? "bg-gradient-to-br from-red-500 to-rose-500" :
                            "bg-gradient-to-br from-amber-500 to-yellow-500"
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
                          isAbsent ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {isPresent ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : isAbsent ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                            </svg>
                          )}
                          {isPresent ? "Present" : isAbsent ? "Absent" : "Not Marked"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-1">Select a class above</p>
          <p className="text-xs text-slate-500">Choose a class to view student attendance for the selected date</p>
        </div>
      )}
    </div>
  );
}
