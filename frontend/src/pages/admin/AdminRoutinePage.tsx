import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/ui/Toast";

interface RoutineEntry {
  id: number;
  academic_year_id: number;
  class_id: number;
  class_name: string;
  section_id: number;
  section_name: string;
  group: string | null;
  day: string;
  period_id: number;
  period_label: string;
  start_time: string;
  end_time: string;
  subject_id: number;
  subject_name: string;
  teacher_id: number;
  teacher_name: string;
}

interface DropdownItem {
  id: number;
  name: string;
  code?: string;
  class_id?: number;
}

interface Period {
  id: number;
  number: number;
  label: string;
  start_time: string;
  end_time: string;
}

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];
const DAY_LABELS: Record<string, string> = {
  SUNDAY: "Sunday", MONDAY: "Monday", TUESDAY: "Tuesday", WEDNESDAY: "Wednesday", THURSDAY: "Thursday",
};
const GROUPS = ["SCIENCE", "HUMANITIES", "BUSINESS_STUDIES"];

function RoutineForm({
  data,
  onChange,
  classes,
  sections,
  periods,
  teachers,
  subjects,
}: {
  data: Partial<RoutineEntry>;
  onChange: (d: Partial<RoutineEntry>) => void;
  classes: DropdownItem[];
  sections: DropdownItem[];
  periods: Period[];
  teachers: DropdownItem[];
  subjects: DropdownItem[];
}) {
  const selectedClass = classes.find(c => c.id === data.class_id);
  const classNum = selectedClass?.name?.replace("Class ", "").trim() || "";
  const showGroup = classNum === "9" || classNum === "10";

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Class <span className="text-red-500">*</span></label>
        <select
          value={data.class_id ?? ""}
          onChange={(e) => onChange({ ...data, class_id: e.target.value ? Number(e.target.value) : undefined, section_id: undefined, group: undefined })}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Select class…</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Section <span className="text-red-500">*</span></label>
        <select
          value={data.section_id ?? ""}
          onChange={(e) => onChange({ ...data, section_id: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Select section…</option>
          {sections.filter(s => s.class_id === data.class_id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      {showGroup && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Group</label>
          <select
            value={data.group ?? ""}
            onChange={(e) => onChange({ ...data, group: e.target.value || undefined })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Select group…</option>
            {GROUPS.map(g => <option key={g} value={g}>{g.replace("_", " ")}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Day <span className="text-red-500">*</span></label>
        <select
          value={data.day ?? ""}
          onChange={(e) => onChange({ ...data, day: e.target.value })}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Select day…</option>
          {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Period <span className="text-red-500">*</span></label>
        <select
          value={data.period_id ?? ""}
          onChange={(e) => onChange({ ...data, period_id: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Select period…</option>
          {periods.map(p => <option key={p.id} value={p.id}>{p.label} ({p.start_time?.slice(0, 5)} - {p.end_time?.slice(0, 5)})</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Subject <span className="text-red-500">*</span></label>
        <select
          value={data.subject_id ?? ""}
          onChange={(e) => onChange({ ...data, subject_id: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Select subject…</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">Teacher <span className="text-red-500">*</span></label>
        <select
          value={data.teacher_id ?? ""}
          onChange={(e) => onChange({ ...data, teacher_id: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Select teacher…</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
    </div>
  );
}

export function AdminRoutinePage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [filterClass, setFilterClass] = useState<number | "">("");
  const [filterSection, setFilterSection] = useState<number | "">("");
  const [filterDay, setFilterDay] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<RoutineEntry | null>(null);
  const [form, setForm] = useState<Partial<RoutineEntry>>({});

  const { data: classes } = useQuery({
    queryKey: ["admin-classes"],
    queryFn: async () => (await api.get("/admin/classes")).data as DropdownItem[],
  });

  const { data: allSections } = useQuery({
    queryKey: ["admin-sections"],
    queryFn: async () => (await api.get("/admin/sections")).data as DropdownItem[],
  });

  const { data: teachers } = useQuery({
    queryKey: ["admin-teachers"],
    queryFn: async () => {
      const data = (await api.get("/admin/teachers")).data as { id: number; first_name: string; last_name: string }[];
      return data.map(t => ({ id: t.id, name: `${t.first_name} ${t.last_name}` }));
    },
  });

  const { data: subjects } = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: async () => (await api.get("/admin/subjects")).data as DropdownItem[],
  });

  // Fetch periods from routine grid endpoint
  const { data: gridData } = useQuery({
    queryKey: ["routine-grid", filterClass, filterSection],
    queryFn: async () => {
      if (!filterClass || !filterSection) return null;
      return (await api.get(`/routines/grid?class_id=${filterClass}&section_id=${filterSection}`)).data as { periods: Period[]; days: string[]; grid: Record<string, Record<number, unknown>> };
    },
    enabled: !!filterClass && !!filterSection,
  });

  const periodList = gridData?.periods || [];

  const params = new URLSearchParams();
  if (filterClass) params.set("class_id", String(filterClass));
  if (filterSection) params.set("section_id", String(filterSection));
  if (filterDay) params.set("day", filterDay);

  const { data: routines, isLoading } = useQuery({
    queryKey: ["admin-routines", filterClass, filterSection, filterDay],
    queryFn: async () => (await api.get(`/routines?${params.toString()}`)).data as RoutineEntry[],
  });

  const sections = filterClass
    ? allSections?.filter(s => s.class_id === filterClass)
    : allSections;

  const createMut = useMutation({
    mutationFn: async (data: Partial<RoutineEntry>) => {
      const payload: Record<string, unknown> = {
        academic_year_id: data.academic_year_id,
        class_id: data.class_id,
        section_id: data.section_id,
        group: data.group || null,
        day: data.day,
        period_id: data.period_id,
        subject_id: data.subject_id,
        teacher_id: data.teacher_id,
      };
      return (await api.post("/routines", payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-routines"] });
      queryClient.invalidateQueries({ queryKey: ["routine-grid"] });
      setCreateOpen(false);
      setForm({});
      showToast("Routine entry created");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to create", "error");
    },
  });

  const editMut = useMutation({
    mutationFn: async (data: Partial<RoutineEntry>) => {
      const payload: Record<string, unknown> = {
        class_id: data.class_id,
        section_id: data.section_id,
        group: data.group || null,
        day: data.day,
        period_id: data.period_id,
        subject_id: data.subject_id,
        teacher_id: data.teacher_id,
      };
      return (await api.put(`/routines/${selected!.id}`, payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-routines"] });
      queryClient.invalidateQueries({ queryKey: ["routine-grid"] });
      setEditOpen(false);
      setSelected(null);
      setForm({});
      showToast("Routine entry updated");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to update", "error");
    },
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      await api.delete(`/routines/${selected!.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-routines"] });
      queryClient.invalidateQueries({ queryKey: ["routine-grid"] });
      setDeleteOpen(false);
      setSelected(null);
      showToast("Routine entry deleted");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to delete", "error");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Class Routine</h1>
          <p className="text-sm text-slate-500 mt-1">Manage class timetables and schedules</p>
        </div>
        <button
          onClick={() => { setForm({ academic_year_id: 1 }); setCreateOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
        >
          + Add Entry
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Class</label>
            <select
              value={filterClass}
              onChange={(e) => { setFilterClass(e.target.value ? Number(e.target.value) : ""); setFilterSection(""); }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition"
            >
              <option value="">All Classes</option>
              {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value ? Number(e.target.value) : "")}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition"
            >
              <option value="">All Sections</option>
              {sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Day</label>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition"
            >
              <option value="">All Days</option>
              {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
            </select>
          </div>
          {(filterClass || filterSection || filterDay) && (
            <button
              onClick={() => { setFilterClass(""); setFilterSection(""); setFilterDay(""); }}
              className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid View */}
      {filterClass && filterSection && gridData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 overflow-x-auto">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Timetable Grid</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border border-slate-200 px-3 py-2 bg-slate-50 text-left text-xs font-semibold text-slate-600">Period</th>
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
                    <div className="text-xs text-slate-500">{p.start_time?.slice(0, 5)} - {p.end_time?.slice(0, 5)}</div>
                  </td>
                  {gridData.days.map(d => {
                    const cell = gridData.grid[d]?.[p.id] as { subject: string; teacher: string } | undefined;
                    return (
                      <td key={d} className="border border-slate-200 px-3 py-2">
                        {cell ? (
                          <div>
                            <div className="text-xs font-medium text-slate-900">{cell.subject}</div>
                            <div className="text-xs text-slate-500">{cell.teacher}</div>
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
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-500 animate-pulse">
          Loading routines…
        </div>
      ) : !routines || routines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-2xl mb-4">📅</div>
          <p className="text-slate-500">No routine entries found</p>
          <p className="text-sm text-slate-400 mt-1">Create a new entry to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Day</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Period</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Time</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Class</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Subject</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Teacher</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routines.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40">
                  <td className="px-4 py-2.5 text-slate-900 font-medium">{DAY_LABELS[r.day]}</td>
                  <td className="px-4 py-2.5 text-slate-600">{r.period_label}</td>
                  <td className="px-4 py-2.5 text-slate-600">{r.start_time?.slice(0, 5)} - {r.end_time?.slice(0, 5)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{r.class_name} - {r.section_name}{r.group ? ` (${r.group.replace("_", " ")})` : ""}</td>
                  <td className="px-4 py-2.5 text-slate-900 font-medium">{r.subject_name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{r.teacher_name}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => { setSelected(r); setForm(r); setEditOpen(true); }}
                        className="px-2 py-1 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setSelected(r); setDeleteOpen(true); }}
                        className="px-2 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Routine Entry">
        <RoutineForm
          data={form}
          onChange={setForm}
          classes={classes || []}
          sections={allSections || []}
          periods={periodList}
          teachers={teachers || []}
          subjects={subjects || []}
        />
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
          <button
            onClick={() => createMut.mutate(form)}
            disabled={createMut.isPending || !form.class_id || !form.section_id || !form.day || !form.period_id || !form.subject_id || !form.teacher_id}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {createMut.isPending ? "Creating…" : "Create"}
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Routine Entry">
        <RoutineForm
          data={form}
          onChange={setForm}
          classes={classes || []}
          sections={allSections || []}
          periods={periodList}
          teachers={teachers || []}
          subjects={subjects || []}
        />
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
          <button
            onClick={() => editMut.mutate(form)}
            disabled={editMut.isPending || !form.class_id || !form.section_id || !form.day || !form.period_id || !form.subject_id || !form.teacher_id}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {editMut.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMut.mutate()}
        title="Delete Routine Entry"
        message="Are you sure you want to delete this routine entry?"
        confirmLabel="Delete"
        loading={deleteMut.isPending}
      />
    </div>
  );
}
