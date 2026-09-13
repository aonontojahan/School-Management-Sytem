import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/ui/Toast";

interface DropdownItem { id: number; name: string; code?: string; class_id?: number; }
interface Period { id: number; number: number; label: string; start_time: string; end_time: string; }
interface RoutineEntry {
  id: number; academic_year_id: number;
  class_id: number; class_name: string; section_id: number; section_name: string; group: string | null;
  day: string; period_id: number; period_label: string; start_time: string; end_time: string;
  subject_id: number; subject_name: string; teacher_id: number; teacher_name: string;
}
interface WorkloadDay { count: number; entries: { id: number; period_label: string; class_name: string; section_name: string; subject_name: string; period_id: number }[]; is_full: boolean; }
interface Workload { teacher_id: number; teacher_name: string; total_classes: number; daily: Record<string, WorkloadDay>; max_per_day: number; max_per_week: number; recommended_min: number; }

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"] as const;
const DAY_LABELS: Record<string, string> = { SUNDAY: "Sun", MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu" };
const DAY_FULL: Record<string, string> = { SUNDAY: "Sunday", MONDAY: "Monday", TUESDAY: "Tuesday", WEDNESDAY: "Wednesday", THURSDAY: "Thursday" };
const GROUPS = ["SCIENCE", "HUMANITIES", "BUSINESS_STUDIES"];

const TAB_ICONS: Record<string, string> = { class: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", teacher: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", day: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" };

export function AdminRoutinePage() {
  const [tab, setTab] = useState<"class" | "teacher" | "day">("class");

  const { data: classes } = useQuery({ queryKey: ["admin-classes"], queryFn: async () => (await api.get("/admin/classes")).data as DropdownItem[] });
  const { data: allSections } = useQuery({ queryKey: ["admin-sections"], queryFn: async () => (await api.get("/admin/sections")).data as DropdownItem[] });
  const { data: teachers } = useQuery({
    queryKey: ["admin-teachers"],
    queryFn: async () => {
      const d = (await api.get("/admin/teachers")).data as { id: number; first_name: string; last_name: string }[];
      return d.map(t => ({ id: t.id, name: `${t.first_name} ${t.last_name}` }));
    },
  });
  const { data: allSubjects } = useQuery({ queryKey: ["admin-subjects"], queryFn: async () => (await api.get("/admin/subjects")).data as DropdownItem[] });
  const { data: periods } = useQuery({ queryKey: ["admin-periods"], queryFn: async () => (await api.get("/admin/periods")).data as Period[] });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Class Routine</h1>
            <p className="text-indigo-100 text-sm mt-0.5">Assign teachers to classes and view weekly timetables</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
        <div className="flex gap-1">
          {([["class", "By Class", TAB_ICONS.class], ["teacher", "By Teacher", TAB_ICONS.teacher], ["day", "By Day", TAB_ICONS.day]] as const).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                tab === key
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "class" && <ClassView classes={classes || []} allSections={allSections || []} teachers={teachers || []} subjects={allSubjects || []} periods={periods || []} />}
      {tab === "teacher" && <TeacherView teachers={teachers || []} classes={classes || []} allSections={allSections || []} periods={periods || []} />}
      {tab === "day" && <DayView />}
    </div>
  );
}

function ClassView({ classes, allSections, teachers, subjects, periods }: { classes: DropdownItem[]; allSections: DropdownItem[]; teachers: DropdownItem[]; subjects: DropdownItem[]; periods: Period[] }) {
  const [selectedClass, setSelectedClass] = useState<number | "">("");
  const [selectedSection, setSelectedSection] = useState<number | "">("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<RoutineEntry | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<Partial<RoutineEntry>>({});

  const sections = selectedClass ? allSections.filter(s => s.class_id === selectedClass) : [];
  const selectedClassName = classes.find(c => c.id === selectedClass)?.name || "";
  const classNum = parseInt(selectedClassName.replace("Class ", "").trim()) || 0;
  const hasGroups = classNum >= 9;

  const { data: gridData } = useQuery({
    queryKey: ["routine-grid", selectedClass, selectedSection, selectedGroup],
    queryFn: async () => {
      if (!selectedClass || !selectedSection) return null;
      const params = new URLSearchParams({ class_id: String(selectedClass), section_id: String(selectedSection) });
      if (selectedGroup) params.set("group", selectedGroup);
      return (await api.get(`/routines/grid?${params}`)).data as { periods: Period[]; days: string[]; grid: Record<string, Record<number, unknown>> };
    },
    enabled: !!selectedClass && !!selectedSection,
  });

  const { data: routines } = useQuery({
    queryKey: ["admin-routines", selectedClass, selectedSection, selectedGroup],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedClass) params.set("class_id", String(selectedClass));
      if (selectedSection) params.set("section_id", String(selectedSection));
      if (selectedGroup) params.set("group", selectedGroup);
      return (await api.get(`/routines?${params.toString()}`)).data as RoutineEntry[];
    },
    enabled: !!selectedClass && !!selectedSection,
  });

  const deleteMut = useMutation({
    mutationFn: async () => { await api.delete(`/routines/${selected!.id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-routines"] });
      queryClient.invalidateQueries({ queryKey: ["routine-grid"] });
      setDeleteOpen(false);
      setSelected(null);
      showToast("Entry deleted");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => showToast(e.response?.data?.detail || "Failed", "error"),
  });

  const editMut = useMutation({
    mutationFn: async (data: Partial<RoutineEntry>) => {
      return (await api.put(`/routines/${selected!.id}`, {
        class_id: data.class_id, section_id: data.section_id, group: data.group || null,
        day: data.day, period_id: data.period_id, subject_id: data.subject_id, teacher_id: data.teacher_id,
      })).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-routines"] });
      queryClient.invalidateQueries({ queryKey: ["routine-grid"] });
      setEditOpen(false);
      setSelected(null);
      setForm({});
      showToast("Entry updated");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => showToast(e.response?.data?.detail || "Failed", "error"),
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-indigo-50/50">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Filter Timetable</h2>
            <p className="text-xs text-slate-500">Select class and section to view routine</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[180px]">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Class *</label>
              <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value ? Number(e.target.value) : ""); setSelectedSection(""); setSelectedGroup(""); }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                <option value="">Select class…</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {selectedClass && (
              <div className="min-w-[160px]">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Section</label>
                <select value={selectedSection} onChange={e => setSelectedSection(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                  <option value="">All Sections</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            {hasGroups && (
              <div className="min-w-[160px]">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Group</label>
                <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                  <option value="">All Groups</option>
                  {GROUPS.map(g => <option key={g} value={g}>{g.replace("_", " ")}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid View */}
      {gridData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Timetable Grid</h2>
              <p className="text-xs text-slate-500">{selectedClassName}{selectedSection ? ` — Section ${sections.find(s => s.id === selectedSection)?.name}` : ""}{selectedGroup ? ` — ${selectedGroup}` : ""}</p>
            </div>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-28">Period</th>
                  {gridData.days.map(d => (
                    <th key={d} className="text-left pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{DAY_LABELS[d] || d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gridData.periods.map(p => (
                  <tr key={p.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="text-xs font-bold text-slate-700">{p.label}</div>
                      <div className="text-[10px] text-slate-400">{p.start_time?.slice(0, 5)} – {p.end_time?.slice(0, 5)}</div>
                    </td>
                    {gridData.days.map(d => {
                      const cell = gridData.grid[d]?.[p.id] as { subject: string; teacher: string } | undefined;
                      return (
                        <td key={d} className="py-3 pr-4">
                          {cell ? (
                            <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2">
                              <div className="text-xs font-bold text-indigo-900">{cell.subject}</div>
                              <div className="text-[10px] text-indigo-600">{cell.teacher}</div>
                            </div>
                          ) : (
                            <div className="rounded-lg bg-slate-50 border border-dashed border-slate-200 px-3 py-2 flex items-center justify-center">
                              <span className="text-[10px] text-slate-300 font-medium">Free</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedClass && !selectedSection && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-1">Select a class and section</p>
          <p className="text-xs text-slate-500">Choose a class above to view the timetable grid</p>
        </div>
      )}

      {/* Entries Table */}
      {routines && routines.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">All Entries{routines ? ` (${routines.length})` : ""}</h2>
              <p className="text-xs text-slate-500">Individual routine assignments</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Day</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Period</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routines.map(r => (
                  <tr key={r.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                        {DAY_FULL[r.day] || r.day}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-slate-900">{r.period_label}</td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">{r.start_time?.slice(0, 5)} – {r.end_time?.slice(0, 5)}</td>
                    <td className="px-6 py-3.5 text-sm font-medium text-slate-900">{r.subject_name}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">{r.teacher_name}</td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelected(r); setForm(r); setEditOpen(true); }}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition" title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => { setSelected(r); setDeleteOpen(true); }}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition" title="Delete">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Entry">
        <EditForm form={form} setForm={setForm} classes={classes} allSections={allSections} teachers={teachers} subjects={subjects} periods={periods} />
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
          <button onClick={() => editMut.mutate(form)} disabled={editMut.isPending}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60 shadow-sm shadow-indigo-200">
            {editMut.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </Modal>
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={() => deleteMut.mutate()}
        title="Delete Entry" message="Are you sure?" confirmLabel="Delete" loading={deleteMut.isPending} />
    </div>
  );
}

function TeacherView({ teachers, classes, allSections, periods }: { teachers: DropdownItem[]; classes: DropdownItem[]; allSections: DropdownItem[]; periods: Period[] }) {
  const [selectedTeacher, setSelectedTeacher] = useState<number | "">("");
  const [assignOpen, setAssignOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: workload, isLoading: wlLoading } = useQuery({
    queryKey: ["teacher-workload", selectedTeacher],
    queryFn: async () => (await api.get(`/admin/teachers/${selectedTeacher}/workload`)).data as Workload,
    enabled: !!selectedTeacher,
  });

  const { data: teacherRoutines } = useQuery({
    queryKey: ["teacher-routines", selectedTeacher],
    queryFn: async () => (await api.get(`/routines?teacher_id=${selectedTeacher}`)).data as RoutineEntry[],
    enabled: !!selectedTeacher,
  });

  const { data: teacherDetail } = useQuery({
    queryKey: ["teacher-detail", selectedTeacher],
    queryFn: async () => (await api.get(`/admin/teachers/${selectedTeacher}/detail`)).data as { subjects: DropdownItem[]; sections: DropdownItem[] },
    enabled: !!selectedTeacher,
  });

  const teacherSubjects = teacherDetail?.subjects || [];

  return (
    <div className="space-y-6">
      {/* Teacher Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-indigo-50/50">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-slate-900">Teacher Workload</h2>
            <p className="text-xs text-slate-500">Select a teacher to view their schedule and workload</p>
          </div>
          {selectedTeacher && (
            <button onClick={() => setAssignOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Assign Classes
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Teacher</label>
            <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
              <option value="">Choose a teacher…</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {!selectedTeacher && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-1">Select a teacher</p>
          <p className="text-xs text-slate-500">Choose a teacher above to view their schedule and workload</p>
        </div>
      )}

      {wlLoading && selectedTeacher && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-slate-100 rounded-lg w-1/3" />
            <div className="grid grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-32 bg-slate-50 rounded-xl" />)}
            </div>
          </div>
        </div>
      )}

      {workload && !wlLoading && (
        <>
          {/* Workload Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{workload.teacher_name}'s Weekly Workload</h2>
                  <p className="text-xs text-slate-500">Classes assigned this week</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${workload.total_classes >= workload.max_per_week ? "bg-red-100 text-red-700 border border-red-200" : workload.total_classes >= 16 ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-amber-100 text-amber-700 border border-amber-200"}`}>
                {workload.total_classes}/{workload.max_per_week} classes/week
              </span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-5 gap-3">
                {DAYS.map(d => {
                  const dayData = workload.daily[d];
                  const count = dayData?.count || 0;
                  const pct = (count / workload.max_per_day) * 100;
                  return (
                    <div key={d} className="text-center p-4 rounded-xl bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="text-xs font-bold text-slate-600 mb-3">{DAY_LABELS[d]}</div>
                      <div className="relative w-full h-24 bg-slate-200 rounded-xl overflow-hidden mb-3">
                        <div className={`absolute bottom-0 left-0 right-0 rounded-t-xl transition-all ${count >= 6 ? "bg-red-500" : count >= 4 ? "bg-emerald-500" : "bg-indigo-400"}`}
                          style={{ height: `${pct}%` }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-extrabold text-slate-700">{count}</span>
                        </div>
                      </div>
                      {dayData?.entries && dayData.entries.length > 0 && (
                        <div className="space-y-1 mt-1">
                          {dayData.entries.slice(0, 3).map((e, i) => (
                            <div key={i} className="text-[10px] text-slate-500 truncate">{e.period_label}: {e.class_name}</div>
                          ))}
                          {dayData.entries.length > 3 && <div className="text-[10px] text-slate-400">+{dayData.entries.length - 3} more</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Weekly Schedule Grid */}
          {teacherRoutines && teacherRoutines.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Weekly Schedule</h2>
                  <p className="text-xs text-slate-500">Full timetable for this teacher</p>
                </div>
              </div>
              <div className="p-6 overflow-x-auto">
                <TeacherGrid routines={teacherRoutines} />
              </div>
            </div>
          )}
        </>
      )}

      {/* Assign Modal */}
      {selectedTeacher && (
        <AssignModal
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          teacherId={selectedTeacher}
          classes={classes}
          allSections={allSections}
          subjects={teacherSubjects}
          periods={periods}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["teacher-workload"] });
            queryClient.invalidateQueries({ queryKey: ["teacher-routines"] });
            setAssignOpen(false);
          }}
        />
      )}
    </div>
  );
}

function TeacherGrid({ routines }: { routines: RoutineEntry[] }) {
  const byDay: Record<string, RoutineEntry[]> = {};
  for (const r of routines) {
    if (!byDay[r.day]) byDay[r.day] = [];
    byDay[r.day].push(r);
  }
  for (const d of Object.keys(byDay)) {
    byDay[d].sort((a, b) => a.period_id - b.period_id);
  }

  const allPeriods = [...new Set(routines.map(r => r.period_id))].sort((a, b) => a - b);
  const periodLabels: Record<number, { label: string; time: string }> = {};
  for (const r of routines) {
    if (!periodLabels[r.period_id]) {
      periodLabels[r.period_id] = { label: r.period_label, time: `${r.start_time?.slice(0, 5)} – ${r.end_time?.slice(0, 5)}` };
    }
  }

  return (
    <table className="w-full text-sm border-collapse min-w-[600px]">
      <thead>
        <tr>
          <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-28">Period</th>
          {DAYS.map(d => (
            <th key={d} className="text-left pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{DAY_LABELS[d]}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {allPeriods.map(pid => (
          <tr key={pid} className="group hover:bg-slate-50 transition-colors">
            <td className="py-3 pr-4">
              <div className="text-xs font-bold text-slate-700">{periodLabels[pid]?.label}</div>
              <div className="text-[10px] text-slate-400">{periodLabels[pid]?.time}</div>
            </td>
            {DAYS.map(d => {
              const entry = byDay[d]?.find(e => e.period_id === pid);
              return (
                <td key={d} className="py-3 pr-4">
                  {entry ? (
                    <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2">
                      <div className="text-xs font-bold text-indigo-900">{entry.subject_name}</div>
                      <div className="text-[10px] text-indigo-600">{entry.class_name} – {entry.section_name}</div>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-emerald-50 border border-dashed border-emerald-200 px-3 py-2 flex items-center justify-center">
                      <span className="text-[10px] text-emerald-500 font-medium">Free</span>
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DayView() {
  const [selectedDay, setSelectedDay] = useState<string>("SUNDAY");
  const { data: routines, isLoading } = useQuery({
    queryKey: ["day-routines", selectedDay],
    queryFn: async () => (await api.get(`/routines?day=${selectedDay}`)).data as RoutineEntry[],
  });

  const byClass: Record<string, RoutineEntry[]> = {};
  if (routines) {
    for (const r of routines) {
      const key = `${r.class_name} – ${r.section_name}`;
      if (!byClass[key]) byClass[key] = [];
      byClass[key].push(r);
    }
    for (const k of Object.keys(byClass)) {
      byClass[k].sort((a, b) => a.period_id - b.period_id);
    }
  }

  return (
    <div className="space-y-6">
      {/* Day Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-indigo-50/50">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">View by Day</h2>
            <p className="text-xs text-slate-500">See all classes scheduled for a specific day</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex gap-2">
            {DAYS.map(d => (
              <button key={d} onClick={() => setSelectedDay(d)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedDay === d ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {DAY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-50 rounded-xl" />)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {routines && routines.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-1">No routines for {DAY_FULL[selectedDay]}</p>
          <p className="text-xs text-slate-500">No classes are scheduled for this day</p>
        </div>
      )}

      {/* Class Cards */}
      {Object.entries(byClass).map(([cls, entries]) => (
        <div key={cls} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-indigo-50/50">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{cls}</h2>
              <p className="text-xs text-slate-500">{entries.length} periods scheduled</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Period</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-semibold text-slate-900">{r.period_label}</td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">{r.start_time?.slice(0, 5)} – {r.end_time?.slice(0, 5)}</td>
                    <td className="px-6 py-3.5 text-sm font-medium text-slate-900">{r.subject_name}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">{r.teacher_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function AssignModal({
  open, onClose, teacherId, classes, allSections, subjects, periods, onSuccess,
}: {
  open: boolean; onClose: () => void; teacherId: number;
  classes: DropdownItem[]; allSections: DropdownItem[]; subjects: DropdownItem[]; periods: Period[];
  onSuccess: () => void;
}) {
  const { showToast } = useToast();
  const defaultPeriodId = periods[0]?.id || 1;
  const [entries, setEntries] = useState<{ class_id: number; section_id: number; subject_id: number; day: string; period_id: number; group?: string }[]>([
    { class_id: 0, section_id: 0, subject_id: 0, day: "SUNDAY", period_id: defaultPeriodId },
  ]);
  const [classSubjects, setClassSubjects] = useState<Record<number, DropdownItem[]>>({});

  const addEntry = () => {
    setEntries(prev => [...prev, { class_id: 0, section_id: 0, subject_id: 0, day: "SUNDAY", period_id: defaultPeriodId }]);
  };
  const removeEntry = (i: number) => setEntries(prev => prev.filter((_, idx) => idx !== i));
  const updateEntry = async (i: number, field: string, value: number | string) => {
    setEntries(prev => prev.map((e, idx) => {
      if (idx !== i) return e;
      const next = { ...e, [field]: value };
      if (field === "class_id") { next.section_id = 0; next.group = undefined; next.subject_id = 0; }
      return next;
    }));
    if (field === "class_id" && value && !classSubjects[value as number]) {
      try {
        const res = await api.get(`/admin/class-subjects?class_id=${value}`);
        setClassSubjects(prev => ({ ...prev, [value as number]: res.data }));
      } catch {
        setClassSubjects(prev => ({ ...prev, [value as number]: [] }));
      }
    }
  };

  const { data: wlData } = useQuery({
    queryKey: ["assign-workload", teacherId],
    queryFn: async () => (await api.get(`/admin/teachers/${teacherId}/workload`)).data as Workload,
    enabled: open,
  });

  const assignMut = useMutation({
    mutationFn: async () => {
      const validEntries = entries.filter(e => e.class_id && e.section_id && e.subject_id && e.day && e.period_id);
      return (await api.post(`/admin/teachers/${teacherId}/assign-batch`, {
        academic_year_id: 1,
        assignments: validEntries,
      })).data;
    },
    onSuccess: (data: { created: number; errors: string[] }) => {
      if (data.errors?.length) {
        showToast(`Created ${data.created} entries. ${data.errors.length} errors: ${data.errors[0]}`, "error");
      } else {
        showToast(`${data.created} entries created`);
      }
      onSuccess();
    },
    onError: (e: { response?: { data?: { detail?: string | { message: string; errors: string[] } } } }) => {
      const d = e.response?.data?.detail;
      if (typeof d === "object" && d?.errors) {
        showToast(`${d.message}: ${d.errors[0]}`, "error");
      } else {
        showToast(typeof d === "string" ? d : "Failed to assign", "error");
      }
    },
  });

  const classNum = (cid: number) => {
    const c = classes.find(cl => cl.id === cid);
    return c?.name?.replace("Class ", "").trim() || "";
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign Classes to Teacher">
      <div className="space-y-4">
        {wlData && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${wlData.total_classes >= wlData.max_per_week ? "bg-red-50 text-red-700 border border-red-200" : wlData.total_classes >= 16 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
            Current: {wlData.total_classes}/{wlData.max_per_week} classes this week (max {wlData.max_per_day}/day)
          </div>
        )}

        {subjects.length === 0 && (
          <div className="px-4 py-3 rounded-xl text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
            This teacher has no subjects assigned. Please edit the teacher profile to assign subjects first.
          </div>
        )}

        {entries.map((entry, i) => {
          const cn = classNum(entry.class_id);
          const showGroup = cn === "9" || cn === "10";
          const sections = entry.class_id ? allSections.filter(s => s.class_id === entry.class_id) : [];
          const availableSubjects = entry.class_id ? (classSubjects[entry.class_id] || []) : subjects;

          return (
            <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Class Period {i + 1}</span>
                {entries.length > 1 && (
                  <button onClick={() => removeEntry(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Day</label>
                  <select value={entry.day} onChange={e => updateEntry(i, "day", e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Period</label>
                  <select value={entry.period_id} onChange={e => updateEntry(i, "period_id", Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {periods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
                  <select value={entry.class_id || ""} onChange={e => updateEntry(i, "class_id", Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value={0}>Select…</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
                  <select value={entry.section_id || ""} onChange={e => updateEntry(i, "section_id", Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value={0}>Select…</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                  <select value={entry.subject_id || ""} onChange={e => updateEntry(i, "subject_id", Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value={0}>{entry.class_id ? "Select class first…" : "Select…"}</option>
                    {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {entry.class_id && availableSubjects.length === 0 && (
                    <p className="text-[10px] text-amber-600 mt-1">No subjects assigned to this class</p>
                  )}
                </div>
                {showGroup && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Group</label>
                    <select value={entry.group || ""} onChange={e => updateEntry(i, "group", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">None</option>
                      {GROUPS.map(g => <option key={g} value={g}>{g.replace("_", " ")}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <button onClick={addEntry}
          className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition">
          + Add Another Assignment
        </button>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
        <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
        <button onClick={() => assignMut.mutate()} disabled={assignMut.isPending || entries.length === 0}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60 shadow-sm shadow-indigo-200">
          {assignMut.isPending ? "Assigning…" : `Assign ${entries.length} Class${entries.length > 1 ? "es" : ""}`}
        </button>
      </div>
    </Modal>
  );
}

function EditForm({ form, setForm, classes, allSections, teachers, subjects, periods }: {
  form: Partial<RoutineEntry>; setForm: (f: Partial<RoutineEntry>) => void;
  classes: DropdownItem[]; allSections: DropdownItem[]; teachers: DropdownItem[]; subjects: DropdownItem[]; periods: Period[];
}) {
  const sections = form.class_id ? allSections.filter(s => s.class_id === form.class_id) : [];
  const cn = classes.find(c => c.id === form.class_id)?.name?.replace("Class ", "").trim() || "";
  const showGroup = cn === "9" || cn === "10";

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Day</label>
        <select value={form.day ?? ""} onChange={e => setForm({ ...form, day: e.target.value })}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Period</label>
        <select value={form.period_id ?? ""} onChange={e => setForm({ ...form, period_id: Number(e.target.value) })}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {periods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
        <select value={form.class_id ?? ""} onChange={e => setForm({ ...form, class_id: Number(e.target.value), section_id: undefined, group: undefined })}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Select…</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
        <select value={form.section_id ?? ""} onChange={e => setForm({ ...form, section_id: Number(e.target.value) })}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Select…</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      {showGroup && (
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Group</label>
          <select value={form.group ?? ""} onChange={e => setForm({ ...form, group: e.target.value || undefined })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">None</option>
            {GROUPS.map(g => <option key={g} value={g}>{g.replace("_", " ")}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
        <select value={form.subject_id ?? ""} onChange={e => setForm({ ...form, subject_id: Number(e.target.value) })}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Select…</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Teacher</label>
        <select value={form.teacher_id ?? ""} onChange={e => setForm({ ...form, teacher_id: Number(e.target.value) })}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Select…</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
    </div>
  );
}
