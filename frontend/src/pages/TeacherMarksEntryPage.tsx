import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useToast } from "../components/ui/Toast";

interface Exam { id: number; name: string; exam_type: string; total_marks: number; passing_marks: number; }
interface SchoolClass { id: number; name: string; code: string; }
interface Section { id: number; name: string; class_id: number; }

interface AssignableSubject { id: number; name: string; }

interface SubjectMarkEntry {
  subject_id: number;
  subject_name: string;
  marks_obtained: number | null;
  grade: string | null;
  gpa_point: number | null;
  remarks: string | null;
}

interface StudentEntry {
  student_id: number;
  student_name: string;
  student_code: string;
  roll_number: number | null;
  subjects: SubjectMarkEntry[];
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700",
  "A": "bg-green-100 text-green-700",
  "A-": "bg-teal-100 text-teal-700",
  "B": "bg-blue-100 text-blue-700",
  "C": "bg-amber-100 text-amber-700",
  "D": "bg-orange-100 text-orange-700",
  "F": "bg-red-100 text-red-700",
};

function computeGrade(marks: number): { grade: string; gpa: number } {
  if (marks >= 80) return { grade: "A+", gpa: 5.00 };
  if (marks >= 70) return { grade: "A", gpa: 4.00 };
  if (marks >= 60) return { grade: "A-", gpa: 3.50 };
  if (marks >= 50) return { grade: "B", gpa: 3.00 };
  if (marks >= 40) return { grade: "C", gpa: 2.00 };
  if (marks >= 33) return { grade: "D", gpa: 1.00 };
  return { grade: "F", gpa: 0.00 };
}

export function TeacherMarksEntryPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [examId, setExamId] = useState<number | "">("");
  const [classId, setClassId] = useState<number | "">("");
  const [sectionId, setSectionId] = useState<number | "">("");
  const [students, setStudents] = useState<StudentEntry[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | "">("");

  const { data: exams } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => (await api.get("/exams")).data as Exam[],
  });

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => (await api.get("/academic/classes")).data as SchoolClass[],
  });

  const { data: sections } = useQuery({
    queryKey: ["sections", classId],
    queryFn: async () => {
      if (!classId) return [] as Section[];
      const res = await api.get(`/academic/classes/${classId}/sections`);
      return res.data as Section[];
    },
    enabled: !!classId,
  });

  const { data: marksData, isLoading: marksLoading } = useQuery({
    queryKey: ["teacher-marks", examId, classId, sectionId],
    queryFn: async () => {
      const params: Record<string, string | number> = { exam_id: examId, class_id: classId };
      if (sectionId) params.section_id = sectionId;
      const res = await api.get("/exams/students-marks", { params });
      return res.data as { assignable_subjects: AssignableSubject[]; students: StudentEntry[] };
    },
    enabled: !!examId && !!classId,
  });

  useEffect(() => {
    if (marksData) {
      setStudents(marksData.students);
      if (marksData.assignable_subjects.length > 0 && !selectedSubject) {
        setSelectedSubject(marksData.assignable_subjects[0].id);
      }
    }
  }, [marksData, selectedSubject]);

  const updateMark = (studentIdx: number, subjectIdx: number, value: string) => {
    const numVal = value === "" ? null : Math.min(100, Math.max(0, Number(value)));
    setStudents(prev => prev.map((s, si) => {
      if (si !== studentIdx) return s;
      return {
        ...s,
        subjects: s.subjects.map((subj, subi) => {
          if (subi !== subjectIdx) return subj;
          if (numVal === null) return { ...subj, marks_obtained: null, grade: null, gpa_point: null };
          const { grade, gpa } = computeGrade(numVal);
          return { ...subj, marks_obtained: numVal, grade, gpa_point: gpa };
        }),
      };
    }));
  };

  const updateRemarks = (studentIdx: number, subjectIdx: number, value: string) => {
    setStudents(prev => prev.map((s, si) => {
      if (si !== studentIdx) return s;
      return {
        ...s,
        subjects: s.subjects.map((subj, subi) => subi === subjectIdx ? { ...subj, remarks: value } : subj),
      };
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!examId) return;
      const marks: { student_id: number; subject_id: number; marks_obtained: number; remarks: string | null }[] = [];
      for (const student of students) {
        for (const subj of student.subjects) {
          if (subj.marks_obtained !== null) {
            marks.push({
              student_id: student.student_id,
              subject_id: subj.subject_id,
              marks_obtained: subj.marks_obtained,
              remarks: subj.remarks || null,
            });
          }
        }
      }
      if (marks.length === 0) throw new Error("No marks to save");
      return api.post(`/exams/${examId}/marks`, { marks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-marks"] });
      showToast("Marks saved successfully");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to save marks", "error");
    },
  });

  const assignableSubjects = marksData?.assignable_subjects || [];
  const selectedSubjectObj = assignableSubjects.find(s => s.id === selectedSubject);
  const selectedSubjectIdx = students[0]?.subjects.findIndex(s => s.subject_id === selectedSubject) ?? -1;

  const subjectStats = useMemo(() => {
    if (!students || selectedSubjectIdx < 0) return { avg: 0, highest: 0, lowest: 0, passCount: 0, failCount: 0 };
    const vals = students.map(s => s.subjects[selectedSubjectIdx]?.marks_obtained).filter((v): v is number => v !== null);
    if (vals.length === 0) return { avg: 0, highest: 0, lowest: 0, passCount: 0, failCount: 0 };
    return {
      avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
      highest: Math.max(...vals).toFixed(1),
      lowest: Math.min(...vals).toFixed(1),
      passCount: vals.filter(v => v >= 33).length,
      failCount: vals.filter(v => v < 33).length,
    };
  }, [students, selectedSubjectIdx]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Enter Marks</h1>
            <p className="text-emerald-100 text-sm mt-0.5">Select exam, class, and subject to enter student marks</p>
          </div>
        </div>
      </div>

      {/* Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Exam & Class</h2>
            <p className="text-xs text-slate-500">Select the exam and class to enter marks for</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Exam *</label>
              <select value={examId} onChange={e => { setExamId(Number(e.target.value) || ""); setSelectedSubject(""); setStudents([]); }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition">
                <option value="">Select exam...</option>
                {exams?.map(e => <option key={e.id} value={e.id}>{e.name} ({e.exam_type})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Class *</label>
              <select value={classId} onChange={e => { setClassId(Number(e.target.value) || ""); setSectionId(""); setStudents([]); setSelectedSubject(""); }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition">
                <option value="">Select class...</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Section</label>
              <select value={sectionId} onChange={e => { setSectionId(Number(e.target.value) || ""); setStudents([]); setSelectedSubject(""); }}
                disabled={!classId}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition disabled:opacity-50">
                <option value="">All Sections</option>
                {sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Tabs + Stats */}
      {assignableSubjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {assignableSubjects.map(s => (
              <button key={s.id} onClick={() => setSelectedSubject(s.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${selectedSubject === s.id ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300"}`}>
                {s.name}
              </button>
            ))}
          </div>

          {selectedSubjectIdx >= 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: "Avg", value: subjectStats.avg, color: "blue" },
                { label: "Highest", value: subjectStats.highest, color: "emerald" },
                { label: "Lowest", value: subjectStats.lowest, color: "amber" },
                { label: "Passed", value: subjectStats.passCount, color: "emerald" },
                { label: "Failed", value: subjectStats.failCount, color: "red" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</p>
                  <p className={`text-lg font-extrabold text-${s.color}-600`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Marks Entry Table */}
      {marksLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />)}
          </div>
        </div>
      ) : students.length > 0 && selectedSubjectIdx >= 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Marks Entry — {selectedSubjectObj?.name} ({students.length} students)</h2>
                <p className="text-xs text-slate-500">Enter marks (0-100). Grades are auto-calculated. Click Save when done.</p>
              </div>
            </div>
            <button onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm shadow-emerald-200">
              {saveMutation.isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Marks
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-12">#</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Roll</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-28">Marks</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-20">Grade</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-16">GPA</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, si) => {
                  const subj = student.subjects[selectedSubjectIdx];
                  if (!subj) return null;
                  return (
                    <tr key={student.student_id} className="group hover:bg-emerald-50/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-400 font-medium">{si + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {student.student_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{student.student_name}</p>
                            <p className="text-[11px] text-slate-400">{student.student_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{student.roll_number ?? "—"}</td>
                      <td className="px-4 py-3">
                        <input type="number" min={0} max={100} step={0.5}
                          value={subj.marks_obtained ?? ""}
                          onChange={e => updateMark(si, selectedSubjectIdx, e.target.value)}
                          className="w-24 mx-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                          placeholder="0-100" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {subj.grade ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${GRADE_COLORS[subj.grade] || "bg-slate-100 text-slate-700"}`}>
                            {subj.grade}
                          </span>
                        ) : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {subj.gpa_point !== null ? (
                          <span className="text-xs font-bold text-violet-600">{subj.gpa_point.toFixed(2)}</span>
                        ) : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" value={subj.remarks || ""} onChange={e => updateRemarks(si, selectedSubjectIdx, e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                          placeholder="Optional comment..." />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>{students.filter(s => s.subjects[selectedSubjectIdx]?.marks_obtained !== null).length}/{students.length} marked</span>
              <span>{students.filter(s => s.subjects[selectedSubjectIdx]?.marks_obtained !== null && s.subjects[selectedSubjectIdx]?.marks_obtained! >= 33).length} passing</span>
            </div>
            <button onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm shadow-emerald-200">
              {saveMutation.isPending ? "Saving..." : "Save Marks"}
            </button>
          </div>
        </div>
      ) : examId && classId && !marksLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-1">No subjects assigned</p>
          <p className="text-xs text-slate-500">You don't have any subjects assigned for this class, or no students are enrolled.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-1">Select exam and class above</p>
          <p className="text-xs text-slate-500">Choose an exam, class, and optionally a section to begin entering marks</p>
        </div>
      )}
    </div>
  );
}
