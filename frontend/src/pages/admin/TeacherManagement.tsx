import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/ui/Toast";

const DEPARTMENTS = [
  "Science",
  "Mathematics",
  "Bangla",
  "English",
  "Humanities",
  "Business Studies",
  "ICT",
  "Religion",
  "Physical Education",
  "Career Education",
  "Arts & Crafts",
];

interface Teacher {
  id: number;
  teacher_code: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  designation: string | null;
  joining_date: string | null;
  status: string;
  subject_ids: number[];
  section_ids: number[];
}

interface TeacherDetail extends Teacher {
  subjects: { id: number; name: string; code: string }[];
  sections: { id: number; name: string; class_id: number }[];
  user: { id: number; email: string; username: string; is_active: boolean; role: string } | null;
  created_at: string;
  updated_at: string;
}

interface DropdownItem {
  id: number;
  name: string;
  code?: string;
  class_id?: number;
}

interface TeacherFormData {
  first_name: string;
  last_name: string;
  email: string;
  initial_password: string;
  phone: string;
  department: string;
  designation: string;
  joining_date: string;
  subject_ids: number[];
  section_ids: number[];
}

const emptyForm: TeacherFormData = {
  first_name: "",
  last_name: "",
  email: "",
  initial_password: "",
  phone: "",
  department: "",
  designation: "",
  joining_date: "",
  subject_ids: [],
  section_ids: [],
};

function InputField({
  label,
  type = "text",
  required,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value: string | number | null;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  );
}

function TeacherForm({
  data,
  onChange,
  isCreate,
  subjects,
}: {
  data: TeacherFormData;
  onChange: (d: TeacherFormData) => void;
  isCreate: boolean;
  subjects?: DropdownItem[];
}) {
  const addSubject = (id: number) => {
    if (!data.subject_ids.includes(id)) {
      onChange({ ...data, subject_ids: [...data.subject_ids, id] });
    }
  };

  const removeSubject = (id: number) => {
    onChange({ ...data, subject_ids: data.subject_ids.filter((i) => i !== id) });
  };

  const assignedSubjects = subjects?.filter((s) => data.subject_ids.includes(s.id)) || [];
  const unassignedSubjects = subjects?.filter((s) => !data.subject_ids.includes(s.id)) || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="First Name" required value={data.first_name} onChange={(v) => onChange({ ...data, first_name: v })} />
        <InputField label="Last Name" required value={data.last_name} onChange={(v) => onChange({ ...data, last_name: v })} />
        <InputField label="Email" type="email" value={data.email} onChange={(v) => onChange({ ...data, email: v })} />
        {isCreate && (
          <InputField label="Initial Password" type="password" value={data.initial_password} onChange={(v) => onChange({ ...data, initial_password: v })} />
        )}
        <InputField label="Phone" value={data.phone} onChange={(v) => onChange({ ...data, phone: v })} />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            value={data.department}
            onChange={(e) => onChange({ ...data, department: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select Department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <InputField label="Designation" value={data.designation} onChange={(v) => onChange({ ...data, designation: v })} />
        <InputField label="Joining Date" type="date" value={data.joining_date} onChange={(v) => onChange({ ...data, joining_date: v })} />
      </div>

      {/* Assigned Subjects */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Subjects</label>
        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-2">
          {assignedSubjects.length > 0 && (
            <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
              {assignedSubjects.map((s) => (
                <li key={s.id} className="flex items-center justify-between group">
                  <span>{s.name}</span>
                  <button
                    type="button"
                    onClick={() => removeSubject(s.id)}
                    className="text-red-400 hover:text-red-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition ml-2"
                  >
                    remove
                  </button>
                </li>
              ))}
            </ol>
          )}
          {unassignedSubjects.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id) addSubject(id);
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">+ Add subject…</option>
              {unassignedSubjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeacherManagement() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDept, setFilterDept] = useState("");
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetPwOpen, setResetPwOpen] = useState(false);
  const [selected, setSelected] = useState<Teacher | null>(null);
  const [form, setForm] = useState<TeacherFormData>(emptyForm);
  const [newPassword, setNewPassword] = useState("");

  const { data: subjects } = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: async () => (await api.get("/admin/subjects")).data as DropdownItem[],
  });

  const { data: departments } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: async () => (await api.get("/admin/departments")).data as string[],
  });

  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (filterStatus) params.set("status", filterStatus);
  if (filterDept) params.set("department", filterDept);
  params.set("skip", String(page * 50));
  params.set("limit", "50");

  const { data: teachers, isLoading, isError } = useQuery({
    queryKey: ["admin-teachers", search, filterStatus, filterDept, page],
    queryFn: async () => (await api.get(`/admin/teachers?${params.toString()}`)).data as Teacher[],
  });

  const { data: detail } = useQuery({
    queryKey: ["admin-teacher-detail", selected?.id],
    queryFn: async () => (await api.get(`/admin/teachers/${selected!.id}/detail`)).data as TeacherDetail,
    enabled: detailOpen && !!selected,
  });

  const createMut = useMutation({
    mutationFn: async (data: TeacherFormData) => {
      const payload: Record<string, unknown> = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || undefined,
        initial_password: data.initial_password || undefined,
        phone: data.phone || undefined,
        department: data.department || undefined,
        designation: data.designation || undefined,
        joining_date: data.joining_date || undefined,
        subject_ids: data.subject_ids.length > 0 ? data.subject_ids : undefined,
        section_ids: data.section_ids.length > 0 ? data.section_ids : undefined,
      };
      return (await api.post("/admin/teachers", payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      setCreateOpen(false);
      setForm(emptyForm);
      showToast("Teacher created successfully");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to create teacher", "error");
    },
  });

  const editMut = useMutation({
    mutationFn: async (data: TeacherFormData) => {
      const payload: Record<string, unknown> = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        department: data.department || undefined,
        designation: data.designation || undefined,
        joining_date: data.joining_date || undefined,
        subject_ids: data.subject_ids,
        section_ids: data.section_ids,
      };
      return (await api.patch(`/admin/teachers/${selected!.id}`, payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      setEditOpen(false);
      setSelected(null);
      setForm(emptyForm);
      showToast("Teacher updated successfully");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to update teacher", "error");
    },
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/teachers/${selected!.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      setDeleteOpen(false);
      setSelected(null);
      showToast("Teacher deleted successfully");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to delete teacher", "error");
    },
  });

  const toggleStatusMut = useMutation({
    mutationFn: async (t: Teacher) => {
      const endpoint = t.status === "ACTIVE" ? "deactivate" : "activate";
      return (await api.patch(`/admin/teachers/${t.id}/${endpoint}`)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      showToast("Teacher status updated");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to update status", "error");
    },
  });

  const resetPwMut = useMutation({
    mutationFn: async () => {
      return (await api.patch(`/admin/teachers/${selected!.id}/reset-password`, { new_password: newPassword })).data;
    },
    onSuccess: () => {
      setResetPwOpen(false);
      setNewPassword("");
      showToast("Password reset successfully");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to reset password", "error");
    },
  });

  const openEdit = (t: Teacher) => {
    setSelected(t);
    setForm({
      first_name: t.first_name,
      last_name: t.last_name,
      email: t.email || "",
      initial_password: "",
      phone: t.phone || "",
      department: t.department || "",
      designation: t.designation || "",
      joining_date: t.joining_date || "",
      subject_ids: t.subject_ids || [],
      section_ids: t.section_ids || [],
    });
    setEditOpen(true);
  };

  const openDetail = (t: Teacher) => {
    setSelected(t);
    setDetailOpen(true);
  };

  const statusBadge = (status: string) =>
    status === "ACTIVE" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Inactive</span>
    );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold text-slate-900">Teachers</h2>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {teachers?.length ?? 0}
          </span>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setCreateOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-emerald-200 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Teacher
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search teachers..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition placeholder:text-slate-400"
            />
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); setPage(0); }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition"
          >
            <option value="">All Departments</option>
            {departments?.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {(search || filterStatus || filterDept) && (
            <button
              onClick={() => { setSearch(""); setFilterStatus(""); setFilterDept(""); setPage(0); }}
              className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-500 animate-pulse">
          Loading teachers…
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8">
          <p className="text-sm text-red-600">Failed to load teachers.</p>
        </div>
      ) : !teachers || teachers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-2xl mb-4">👩‍🏫</div>
          <p className="text-slate-500">No teachers found</p>
          <p className="text-sm text-slate-400 mt-1">Create a new teacher to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Code</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Department</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Designation</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40">
                  <td className="px-4 py-2.5 text-slate-700 font-mono text-xs">{t.teacher_code}</td>
                  <td className="px-4 py-2.5 text-slate-900 font-medium">
                    <button onClick={() => openDetail(t)} className="hover:text-indigo-700 transition text-left">
                      {t.first_name} {t.last_name}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{t.email || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600">{t.department || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600">{t.designation || "—"}</td>
                  <td className="px-4 py-2.5">{statusBadge(t.status)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openDetail(t)} className="px-2 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition" title="View Details">👁</button>
                      <button onClick={() => openEdit(t)} className="px-2 py-1 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition" title="Edit">✏️</button>
                      <button onClick={() => { setSelected(t); setResetPwOpen(true); setNewPassword(""); }} className="px-2 py-1 rounded-lg text-xs font-medium text-amber-600 hover:bg-amber-50 transition" title="Reset Password">🔑</button>
                      <button onClick={() => toggleStatusMut.mutate(t)} className={`px-2 py-1 rounded-lg text-xs font-medium transition ${t.status === "ACTIVE" ? "text-orange-600 hover:bg-orange-50" : "text-emerald-600 hover:bg-emerald-50"}`} title={t.status === "ACTIVE" ? "Deactivate" : "Activate"}>
                        {t.status === "ACTIVE" ? "⏸" : "▶"}
                      </button>
                      <button onClick={() => { setSelected(t); setDeleteOpen(true); }} className="px-2 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition" title="Delete">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition">← Prev</button>
            <span className="text-sm text-slate-500">Page {page + 1}</span>
            <button disabled={teachers.length < 50} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition">Next →</button>
          </div>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Teacher" wide>
        <TeacherForm data={form} onChange={setForm} isCreate subjects={subjects} />
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
          <button onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => createMut.mutate(form)} disabled={createMut.isPending || !form.first_name || !form.last_name} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60">
            {createMut.isPending ? "Creating…" : "Create Teacher"}
          </button>
        </div>
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Teacher" wide>
        <TeacherForm data={form} onChange={setForm} isCreate={false} subjects={subjects} />
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
          <button onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => editMut.mutate(form)} disabled={editMut.isPending || !form.first_name || !form.last_name} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60">
            {editMut.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </Modal>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Teacher Details" wide>
        {detail ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
                {detail.first_name.charAt(0)}{detail.last_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{detail.first_name} {detail.last_name}</h3>
                <p className="text-sm text-slate-500">{detail.teacher_code}</p>
                <div className="mt-1">{statusBadge(detail.status)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="text-slate-900">{detail.email || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="text-slate-900">{detail.phone || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Department</span><span className="text-slate-900">{detail.department || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Designation</span><span className="text-slate-900">{detail.designation || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Joining Date</span><span className="text-slate-900">{detail.joining_date || "—"}</span></div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Assigned Subjects</h4>
                {detail.subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {detail.subjects.map((s) => (
                      <span key={s.id} className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-semibold">
                        {s.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No subjects assigned</p>
                )}
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Assigned Sections</h4>
                {detail.sections.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {detail.sections.map((s) => (
                      <span key={s.id} className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold">
                        {s.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No sections assigned</p>
                )}
              </div>
              {detail.user && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Login Account</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="text-slate-900">{detail.user.email}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Username</span><span className="text-slate-900">{detail.user.username || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Account Active</span><span className={detail.user.is_active ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>{detail.user.is_active ? "Yes" : "No"}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 animate-pulse">Loading…</div>
        )}
      </Modal>

      <Modal open={resetPwOpen} onClose={() => setResetPwOpen(false)} title="Reset Password">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Set a new password for <strong>{selected?.first_name} {selected?.last_name}</strong></p>
          <input
            type="password"
            placeholder="New password (min 8 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => setResetPwOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
            <button onClick={() => resetPwMut.mutate()} disabled={resetPwMut.isPending || newPassword.length < 8} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60">
              {resetPwMut.isPending ? "Resetting…" : "Reset Password"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMut.mutate()}
        title="Delete Teacher"
        message={`Are you sure you want to delete ${selected?.first_name} ${selected?.last_name}? This action will permanently remove the teacher and their login account. This cannot be undone.`}
        confirmLabel="Delete Teacher"
        loading={deleteMut.isPending}
      />
    </div>
  );
}
