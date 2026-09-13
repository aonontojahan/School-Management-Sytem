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
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Class Routine</h1>
        <p className="text-sm text-slate-500 mt-1">Assign teachers to classes and view timetables</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {([["class", "By Class"], ["teacher", "By Teacher"], ["day", "By Day"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              tab === key ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Class</label>
            <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value ? Number(e.target.value) : ""); setSelectedSection(""); setSelectedGroup(""); }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition">
              <option value="">Select class…</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {selectedClass && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Section</label>
              <select value={selectedSection} onChange={e => setSelectedSection(e.target.value ? Number(e.target.value) : "")}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition">
                <option value="">All Sections</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          {hasGroups && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Group</label>
              <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition">
                <option value="">All Groups</option>
                {GROUPS.map(g => <option key={g} value={g}>{g.replace("_", " ")}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Grid View */}
      {gridData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 overflow-x-auto">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Timetable Grid</h3>
          <table className="w-full text-sm border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="border border-slate-200 px-3 py-2 bg-slate-50 text-left text-xs font-semibold text-slate-600 w-28">Period</th>
                {gridData.days.map(d => (
                  <th key={d} className="border border-slate-200 px-3 py-2 bg-slate-50 text-left text-xs font-semibold text-slate-600">{DAY_LABELS[d] || d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gridData.periods.map(p => (
                <tr key={p.id}>
                  <td className="border border-slate-200 px-3 py-2 bg-slate-50">
                    <div className="text-xs font-semibold text-slate-700">{p.label}</div>
                    <div className="text-[10px] text-slate-400">{p.start_time?.slice(0, 5)} – {p.end_time?.slice(0, 5)}</div>
                  </td>
                  {gridData.days.map(d => {
                    const cell = gridData.grid[d]?.[p.id] as { subject: string; teacher: string } | undefined;
                    return (
                      <td key={d} className="border border-slate-200 px-3 py-2">
                        {cell ? (
                          <div className="space-y-0.5">
                            <div className="text-xs font-semibold text-slate-900">{cell.subject}</div>
                            <div className="text-[10px] text-slate-500">{cell.teacher}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* List View */}
      {!selectedClass && !selectedSection && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <p className="text-slate-500">Select a class and section to view the timetable</p>
        </div>
      )}

      {routines && routines.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-auto">
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-sm font-bold text-slate-700">Entries</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Day</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Period</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Time</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Subject</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Teacher</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routines.map(r => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{DAY_FULL[r.day] || r.day}</td>
                  <td className="px-4 py-2.5 text-slate-600">{r.period_label}</td>
                  <td className="px-4 py-2.5 text-slate-500">{r.start_time?.slice(0, 5)} – {r.end_time?.slice(0, 5)}</td>
                  <td className="px-4 py-2.5 text-slate-900 font-medium">{r.subject_name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{r.teacher_name}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setSelected(r); setForm(r); setEditOpen(true); }}
                        className="px-2 py-1 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition">Edit</button>
                      <button onClick={() => { setSelected(r); setDeleteOpen(true); }}
                        className="px-2 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Entry">
        <EditForm form={form} setForm={setForm} classes={classes} allSections={allSections} teachers={teachers} subjects={subjects} periods={periods} />
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => editMut.mutate(form)} disabled={editMut.isPending}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
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
    <div className="space-y-4">
      {/* Teacher Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Select Teacher</label>
            <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value ? Number(e.target.value) : "")}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition">
              <option value="">Choose a teacher…</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          {selectedTeacher && (
            <button onClick={() => setAssignOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm whitespace-nowrap">
              + Assign Classes
            </button>
          )}
        </div>
      </div>

      {!selectedTeacher && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-2xl mb-4">👨‍🏫</div>
          <p className="text-slate-500">Select a teacher to view their schedule and workload</p>
        </div>
      )}

      {wlLoading && selectedTeacher && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-500 animate-pulse">Loading workload…</div>
      )}

      {workload && !wlLoading && (
        <>
          {/* Workload Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-700">{workload.teacher_name}'s Weekly Workload</h3>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${workload.total_classes >= workload.max_per_week ? "bg-red-50 text-red-700 border border-red-200" : workload.total_classes >= 16 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                  {workload.total_classes}/{workload.max_per_week} classes/week
                </span>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {DAYS.map(d => {
                const dayData = workload.daily[d];
                const count = dayData?.count || 0;
                const pct = (count / workload.max_per_day) * 100;
                return (
                  <div key={d} className="text-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-slate-600 mb-2">{DAY_LABELS[d]}</div>
                    <div className="relative w-full h-20 bg-slate-200 rounded-lg overflow-hidden mb-2">
                      <div className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all ${count >= 6 ? "bg-red-500" : count >= 4 ? "bg-emerald-500" : "bg-indigo-400"}`}
                        style={{ height: `${pct}%` }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-extrabold text-slate-700">{count}</span>
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

          {/* Weekly Schedule Grid */}
          {teacherRoutines && teacherRoutines.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 overflow-x-auto">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Weekly Schedule</h3>
              <TeacherGrid routines={teacherRoutines} />
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
          <th className="border border-slate-200 px-3 py-2 bg-slate-50 text-left text-xs font-semibold text-slate-600 w-28">Period</th>
          {DAYS.map(d => (
            <th key={d} className="border border-slate-200 px-3 py-2 bg-slate-50 text-left text-xs font-semibold text-slate-600">{DAY_LABELS[d]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {allPeriods.map(pid => (
          <tr key={pid}>
            <td className="border border-slate-200 px-3 py-2 bg-slate-50">
              <div className="text-xs font-semibold text-slate-700">{periodLabels[pid]?.label}</div>
              <div className="text-[10px] text-slate-400">{periodLabels[pid]?.time}</div>
            </td>
            {DAYS.map(d => {
              const entry = byDay[d]?.find(e => e.period_id === pid);
              return (
                <td key={d} className="border border-slate-200 px-3 py-2">
                  {entry ? (
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-slate-900">{entry.subject_name}</div>
                      <div className="text-[10px] text-indigo-600">{entry.class_name} – {entry.section_name}</div>
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-400 font-medium">Free</span>
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
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <label className="block text-xs font-medium text-slate-500 mb-1">Select Day</label>
        <div className="flex gap-2">
          {DAYS.map(d => (
            <button key={d} onClick={() => setSelectedDay(d)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${selectedDay === d ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {DAY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-500 animate-pulse">Loading…</div>}

      {routines && routines.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <p className="text-slate-500">No routine entries for {DAY_FULL[selectedDay]}</p>
        </div>
      )}

      {Object.entries(byClass).map(([cls, entries]) => (
        <div key={cls} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-700">{cls}</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-4 py-2 font-semibold text-slate-600 text-xs">Period</th>
                <th className="px-4 py-2 font-semibold text-slate-600 text-xs">Time</th>
                <th className="px-4 py-2 font-semibold text-slate-600 text-xs">Subject</th>
                <th className="px-4 py-2 font-semibold text-slate-600 text-xs">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(r => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2 text-slate-700 font-medium">{r.period_label}</td>
                  <td className="px-4 py-2 text-slate-500">{r.start_time?.slice(0, 5)} – {r.end_time?.slice(0, 5)}</td>
                  <td className="px-4 py-2 text-slate-900 font-medium">{r.subject_name}</td>
                  <td className="px-4 py-2 text-slate-600">{r.teacher_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

  const addEntry = () => {
    setEntries(prev => [...prev, { class_id: 0, section_id: 0, subject_id: 0, day: "SUNDAY", period_id: defaultPeriodId }]);
  };
  const removeEntry = (i: number) => setEntries(prev => prev.filter((_, idx) => idx !== i));
  const updateEntry = (i: number, field: string, value: number | string) => {
    setEntries(prev => prev.map((e, idx) => {
      if (idx !== i) return e;
      const next = { ...e, [field]: value };
      if (field === "class_id") { next.section_id = 0; next.group = undefined; }
      return next;
    }));
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
        {/* Workload warning */}
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
                  <label className="block text-xs font-medium text-slate-500 mb-1">Day</label>
                  <select value={entry.day} onChange={e => updateEntry(i, "day", e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300">
                    {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Period</label>
                  <select value={entry.period_id} onChange={e => updateEntry(i, "period_id", Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300">
                    {periods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Class</label>
                  <select value={entry.class_id || ""} onChange={e => updateEntry(i, "class_id", Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300">
                    <option value={0}>Select…</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Section</label>
                  <select value={entry.section_id || ""} onChange={e => updateEntry(i, "section_id", Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300">
                    <option value={0}>Select…</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
                  <select value={entry.subject_id || ""} onChange={e => updateEntry(i, "subject_id", Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300">
                    <option value={0}>Select…</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                {showGroup && (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Group</label>
                    <select value={entry.group || ""} onChange={e => updateEntry(i, "group", e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300">
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
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-sm font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition">
          + Add Another Assignment
        </button>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
        <button onClick={() => assignMut.mutate()} disabled={assignMut.isPending || entries.length === 0}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60">
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
        <label className="block text-xs font-medium text-slate-500 mb-1">Day</label>
        <select value={form.day ?? ""} onChange={e => setForm({ ...form, day: e.target.value })}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300">
          {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Period</label>
        <select value={form.period_id ?? ""} onChange={e => setForm({ ...form, period_id: Number(e.target.value) })}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300">
          {periods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Class</label>
        <select value={form.class_id ?? ""} onChange={e => setForm({ ...form, class_id: Number(e.target.value), section_id: undefined, group: undefined })}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300">
          <option value="">Select…</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Section</label>
        <select value={form.section_id ?? ""} onChange={e => setForm({ ...form, section_id: Number(e.target.value) })}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300">
          <option value="">Select…</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      {showGroup && (
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">Group</label>
          <select value={form.group ?? ""} onChange={e => setForm({ ...form, group: e.target.value || undefined })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300">
            <option value="">None</option>
            {GROUPS.map(g => <option key={g} value={g}>{g.replace("_", " ")}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
        <select value={form.subject_id ?? ""} onChange={e => setForm({ ...form, subject_id: Number(e.target.value) })}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300">
          <option value="">Select…</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Teacher</label>
        <select value={form.teacher_id ?? ""} onChange={e => setForm({ ...form, teacher_id: Number(e.target.value) })}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300">
          <option value="">Select…</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
    </div>
  );
}
