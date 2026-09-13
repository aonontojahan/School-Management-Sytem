import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface Exam { id: number; name: string; exam_type: string; total_marks: number; passing_marks: number; start_date: string | null; end_date: string | null; }
interface SubjectMark { subject_id: number; subject_name: string; marks_obtained: number; grade: string; gpa_point: number; remarks: string | null; }
interface ReportCard { student_id: number; student_name: string; exam_id: number; rows: SubjectMark[]; total: number; percentage: number; gpa: number; result: string; }

const GRADE_COLORS: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "A": "bg-green-100 text-green-700 border-green-200",
  "A-": "bg-teal-100 text-teal-700 border-teal-200",
  "B": "bg-blue-100 text-blue-700 border-blue-200",
  "C": "bg-amber-100 text-amber-700 border-amber-200",
  "D": "bg-orange-100 text-orange-700 border-orange-200",
  "F": "bg-red-100 text-red-700 border-red-200",
};

export function StudentResultsPage() {
  const [selectedExam, setSelectedExam] = useState<number | "">("");

  const { data: exams } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => (await api.get("/exams")).data as Exam[],
  });

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ["student-report", selectedExam],
    queryFn: async () => {
      const res = await api.get(`/exams/me/marks`, { params: { exam_id: selectedExam } });
      return res.data as ReportCard;
    },
    enabled: !!selectedExam,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">My Results</h1>
            <div className="inline-flex items-center gap-1.5 mt-1.5 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
              <svg className="w-3.5 h-3.5 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-blue-50 text-xs font-semibold">View your exam results, grades, and GPA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Exam</label>
        <select value={selectedExam} onChange={e => setSelectedExam(Number(e.target.value) || "")}
          className="w-full sm:w-96 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
          <option value="">Choose an exam...</option>
          {exams?.map(e => <option key={e.id} value={e.id}>{e.name} ({e.exam_type})</option>)}
        </select>
      </div>

      {/* Report Card */}
      {reportLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />)}
          </div>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{report.student_name}</h2>
                  <p className="text-xs text-slate-500">Report Card</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border ${report.result === "PASS" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                    {report.result}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100">
              {[
                { label: "Total Marks", value: report.total.toFixed(1), color: "blue" },
                { label: "Percentage", value: `${report.percentage.toFixed(1)}%`, color: "violet" },
                { label: "GPA", value: report.gpa.toFixed(2), color: "emerald" },
                { label: "Subjects", value: report.rows.length, color: "amber" },
              ].map((s, i) => (
                <div key={i} className="bg-white px-6 py-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</p>
                  <p className={`text-xl font-extrabold text-${s.color}-600 mt-1`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Subject-wise Results */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">Subject-wise Results</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {report.rows.map((row) => (
                  <div key={row.subject_id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{row.subject_name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{row.marks_obtained.toFixed(1)} marks</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold border ${GRADE_COLORS[row.grade] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                        {row.grade}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-full bg-slate-100 rounded-full h-2 w-32">
                          <div className={`h-2 rounded-full ${row.marks_obtained >= 33 ? "bg-emerald-500" : "bg-red-500"}`}
                            style={{ width: `${Math.min(100, row.marks_obtained)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{row.marks_obtained.toFixed(0)}%</span>
                      </div>
                      <span className="text-xs font-bold text-violet-600">GPA {row.gpa_point.toFixed(2)}</span>
                    </div>
                    {row.remarks && (
                      <p className="text-[11px] text-slate-500 mt-2 italic bg-slate-50 rounded-lg px-2 py-1">{row.remarks}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : selectedExam ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-1">No results yet</p>
          <p className="text-xs text-slate-500">Marks for this exam haven't been published yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-1">Select an exam above</p>
          <p className="text-xs text-slate-500">Choose an exam to view your results</p>
        </div>
      )}
    </div>
  );
}
