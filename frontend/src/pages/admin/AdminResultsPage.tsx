import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

interface Exam { id: number; name: string; exam_type: string; total_marks: number; passing_marks: number; }
interface SchoolClass { id: number; name: string; code: string; }
interface Section { id: number; name: string; class_id: number; }

interface SubjectMark {
  subject_id: number;
  subject_name: string;
  marks_obtained: number;
  grade: string;
  gpa_point: number;
  remarks: string | null;
}

interface StudentResult {
  student_id: number;
  student_name: string;
  student_code: string;
  roll_number: number | null;
  class_id: number | null;
  section_id: number | null;
  exam_id: number;
  exam_name: string;
  marks: SubjectMark[];
  total: number;
  gpa: number;
  result: string;
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "A": "bg-green-100 text-green-700 border-green-200",
  "A-": "bg-teal-100 text-teal-700 border-teal-200",
  "B": "bg-blue-100 text-blue-700 border-blue-200",
  "C": "bg-amber-100 text-amber-700 border-amber-200",
  "D": "bg-orange-100 text-orange-700 border-orange-200",
  "F": "bg-red-100 text-red-700 border-red-200",
};

export function AdminResultsPage() {
  const [examFilter, setExamFilter] = useState<number | "">("");
  const [classFilter, setClassFilter] = useState<number | "">("");
  const [sectionFilter, setSectionFilter] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

  const { data: exams } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => (await api.get("/exams")).data as Exam[],
  });

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

  const { data: results, isLoading } = useQuery({
    queryKey: ["admin-all-marks", examFilter, classFilter, sectionFilter, searchQuery],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (examFilter) params.exam_id = examFilter;
      if (classFilter) params.class_id = classFilter;
      if (sectionFilter) params.section_id = sectionFilter;
      if (searchQuery) params.q = searchQuery;
      const res = await api.get("/exams/all-marks", { params });
      return res.data as StudentResult[];
    },
  });

  const classMap = useMemo(() => {
    if (!classes) return {} as Record<number, string>;
    return Object.fromEntries(classes.map(c => [c.id, c.name]));
  }, [classes]);

  const sectionMap = useMemo(() => {
    if (!sections) return {} as Record<number, string>;
    return Object.fromEntries(sections.map(s => [s.id, s.name]));
  }, [sections]);

  const stats = useMemo(() => {
    if (!results) return { total: 0, passed: 0, failed: 0, avgGpa: 0 };
    const passed = results.filter(r => r.result === "PASS").length;
    const avgGpa = results.length > 0 ? (results.reduce((s, r) => s + r.gpa, 0) / results.length).toFixed(2) : "0";
    return { total: results.length, passed, failed: results.length - passed, avgGpa };
  }, [results]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Results</h1>
            <div className="inline-flex items-center gap-1.5 mt-1.5 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
              <svg className="w-3.5 h-3.5 text-purple-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-purple-50 text-xs font-semibold">View student results by class, section, exam, and roll number</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-violet-50/50">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Filters</h2>
            <p className="text-xs text-slate-500">Filter results by exam, class, section, or student</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Exam</label>
              <select value={examFilter} onChange={e => setExamFilter(Number(e.target.value) || "")}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition">
                <option value="">All Exams</option>
                {exams?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Class</label>
              <select value={classFilter} onChange={e => { setClassFilter(Number(e.target.value) || ""); setSectionFilter(""); }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition">
                <option value="">All Classes</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Section</label>
              <select value={sectionFilter} onChange={e => setSectionFilter(Number(e.target.value) || "")}
                disabled={!classFilter}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition disabled:opacity-50">
                <option value="">All Sections</option>
                {sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Search Student</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search by name or code..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {results && results.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: stats.total, color: "slate", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
            { label: "Passed", value: stats.passed, color: "emerald", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "Failed", value: stats.failed, color: "red", icon: "M6 18L18 6M6 6l12 12" },
            { label: "Avg GPA", value: stats.avgGpa, color: "violet", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
          ].map((s, i) => (
            <div key={i} className="relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden group hover:shadow-md transition-shadow">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-${s.color}-50 rounded-bl-[40px] -z-0`} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-${s.color}-100 flex items-center justify-center`}>
                    <svg className={`w-4 h-4 text-${s.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
                </div>
                <p className={`text-2xl font-extrabold text-${s.color}-600`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Student Results{results ? ` (${results.length})` : ""}</h2>
              <p className="text-xs text-slate-500">Click a row to expand and see subject-wise marks</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}
            </div>
          ) : !results || results.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1">No results found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters or wait for teachers to upload marks</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Roll</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">GPA</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r, idx) => (
                    <>
                      <tr key={r.student_id} onClick={() => setExpandedStudent(expandedStudent === r.student_id ? null : r.student_id)}
                        className="group hover:bg-violet-50/50 cursor-pointer transition-colors">
                        <td className="px-4 py-3.5 text-xs text-slate-400 font-medium">{idx + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {r.student_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <span className="text-sm font-semibold text-slate-900">{r.student_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">{r.student_code}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-700">{classMap[r.class_id || 0] || "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-700">{r.roll_number ?? "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-700">{r.exam_name}</td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-slate-900 text-center">{r.total.toFixed(1)}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200">
                            {r.gpa.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${r.result === "PASS" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                            {r.result}
                          </span>
                        </td>
                      </tr>
                      {expandedStudent === r.student_id && (
                        <tr key={`expanded-${r.student_id}`}>
                          <td colSpan={9} className="px-4 py-4 bg-violet-50/30">
                            <div className="ml-12">
                              <p className="text-xs font-bold text-violet-700 uppercase tracking-wide mb-3">Subject-wise Marks</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {r.marks.map((mk) => (
                                  <div key={mk.subject_id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-violet-100">
                                    <div>
                                      <p className="text-sm font-semibold text-slate-900">{mk.subject_name}</p>
                                      <p className="text-xs text-slate-500">{mk.marks_obtained.toFixed(1)} marks</p>
                                    </div>
                                    <div className="text-right">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${GRADE_COLORS[mk.grade] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                                        {mk.grade}
                                      </span>
                                      <p className="text-[10px] text-slate-500 mt-0.5">GPA {mk.gpa_point.toFixed(2)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {r.marks.length === 0 && (
                                <p className="text-xs text-slate-500 italic">No marks uploaded yet</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
