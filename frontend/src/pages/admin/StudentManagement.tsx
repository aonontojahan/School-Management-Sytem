import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/ui/Toast";

interface Student {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  class_id: number | null;
  section_id: number | null;
  roll_number: number | null;
  division: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  status: string;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  admission_date: string | null;
}

interface StudentDetail extends Student {
  class: { id: number; name: string; code: string } | null;
  section: { id: number; name: string; capacity: number } | null;
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

interface StudentFormData {
  first_name: string;
  last_name: string;
  email: string;
  initial_password: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  class_id: number | null;
  section_id: number | null;
  roll_number: number | null;
  division: string;
  guardian_name: string;
  guardian_phone: string;
}

const emptyForm: StudentFormData = {
  first_name: "",
  last_name: "",
  email: "",
  initial_password: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  address: "",
  class_id: null,
  section_id: null,
  roll_number: null,
  division: "",
  guardian_name: "",
  guardian_phone: "",
};

const DIVISIONS = ["Science", "Arts", "Commerce"];
const GENDERS = ["MALE", "FEMALE", "OTHER"];

export function StudentManagement() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDivision, setFilterDivision] = useState<string>("");
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetPwOpen, setResetPwOpen] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentFormData>(emptyForm);
  const [newPassword, setNewPassword] = useState("");

  const { data: classes } = useQuery({
    queryKey: ["admin-classes"],
    queryFn: async () => (await api.get("/admin/classes")).data as DropdownItem[],
  });

  const { data: allSections } = useQuery({
    queryKey: ["admin-sections"],
    queryFn: async () => (await api.get("/admin/sections")).data as DropdownItem[],
  });

  const sections = form.class_id
    ? allSections?.filter((s) => s.class_id === form.class_id)
    : allSections;

  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (filterClass) params.set("class_id", String(filterClass));
  if (filterStatus) params.set("status", filterStatus);
  if (filterDivision) params.set("division", filterDivision);
  params.set("skip", String(page * 50));
  params.set("limit", "50");

  const { data: students, isLoading, isError } = useQuery({
    queryKey: ["admin-students", search, filterClass, filterStatus, filterDivision, page],
    queryFn: async () => (await api.get(`/admin/students?${params.toString()}`)).data as Student[],
  });

  const { data: detail } = useQuery({
    queryKey: ["admin-student-detail", selected?.id],
    queryFn: async () => (await api.get(`/admin/students/${selected!.id}/detail`)).data as StudentDetail,
    enabled: detailOpen && !!selected,
  });

  const createMut = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const payload: Record<string, unknown> = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || undefined,
        initial_password: data.initial_password || undefined,
        phone: data.phone || undefined,
        date_of_birth: data.date_of_birth || undefined,
        gender: data.gender || undefined,
        address: data.address || undefined,
        class_id: data.class_id || undefined,
        section_id: data.section_id || undefined,
        roll_number: data.roll_number || undefined,
        division: data.division || undefined,
        guardian_name: data.guardian_name || undefined,
        guardian_phone: data.guardian_phone || undefined,
      };
      return (await api.post("/admin/students", payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      setCreateOpen(false);
      setForm(emptyForm);
      showToast("Student created successfully");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to create student", "error");
    },
  });

  const editMut = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const payload: Record<string, unknown> = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        date_of_birth: data.date_of_birth || undefined,
        gender: data.gender || undefined,
        address: data.address || undefined,
        class_id: data.class_id || undefined,
        section_id: data.section_id || undefined,
        roll_number: data.roll_number || undefined,
        division: data.division || undefined,
        guardian_name: data.guardian_name || undefined,
        guardian_phone: data.guardian_phone || undefined,
      };
      return (await api.patch(`/admin/students/${selected!.id}`, payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      setEditOpen(false);
      setSelected(null);
      setForm(emptyForm);
      showToast("Student updated successfully");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to update student", "error");
    },
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/students/${selected!.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      setDeleteOpen(false);
      setSelected(null);
      showToast("Student deleted successfully");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to delete student", "error");
    },
  });

  const toggleStatusMut = useMutation({
    mutationFn: async (s: Student) => {
      const endpoint = s.status === "ACTIVE" ? "deactivate" : "activate";
      return (await api.patch(`/admin/students/${s.id}/${endpoint}`)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      showToast("Student status updated");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to update status", "error");
    },
  });

  const resetPwMut = useMutation({
    mutationFn: async () => {
      return (await api.patch(`/admin/students/${selected!.id}/reset-password`, { new_password: newPassword })).data;
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

  const openEdit = (s: Student) => {
    setSelected(s);
    setForm({
      first_name: s.first_name,
      last_name: s.last_name,
      email: s.email || "",
      initial_password: "",
      phone: s.phone || "",
      date_of_birth: s.date_of_birth || "",
      gender: s.gender || "",
      address: s.address || "",
      class_id: s.class_id,
      section_id: s.section_id,
      roll_number: s.roll_number,
      division: s.division || "",
      guardian_name: s.guardian_name || "",
      guardian_phone: s.guardian_phone || "",
    });
    setEditOpen(true);
  };

  const openDetail = (s: Student) => {
    setSelected(s);
    setDetailOpen(true);
  };

  const statusBadge = (status: string) =>
    status === "ACTIVE" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        Inactive
      </span>
    );

  const InputField = ({
    label,
    name: _name,
    type = "text",
    required,
    placeholder,
    value,
    onChange,
  }: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    value: string | number | null;
    onChange: (v: string) => void;
  }) => (
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

  const SelectField = ({
    label,
    name: _name,
    options,
    placeholder,
    value,
    onChange,
  }: {
    label: string;
    name: string;
    options: { value: string; label: string }[];
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
      >
        <option value="">{placeholder || "Select…"}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  const StudentForm = ({
    data,
    onChange,
    isCreate,
  }: {
    data: StudentFormData;
    onChange: (d: StudentFormData) => void;
    isCreate: boolean;
  }) => (
    <div className="grid grid-cols-2 gap-4">
      <InputField label="First Name" name="first_name" required value={data.first_name} onChange={(v) => onChange({ ...data, first_name: v })} />
      <InputField label="Last Name" name="last_name" required value={data.last_name} onChange={(v) => onChange({ ...data, last_name: v })} />
      <InputField label="Email" name="email" type="email" value={data.email} onChange={(v) => onChange({ ...data, email: v })} />
      {isCreate && (
        <InputField label="Initial Password" name="initial_password" type="password" value={data.initial_password} onChange={(v) => onChange({ ...data, initial_password: v })} />
      )}
      <InputField label="Phone" name="phone" value={data.phone} onChange={(v) => onChange({ ...data, phone: v })} />
      <InputField label="Date of Birth" name="date_of_birth" type="date" value={data.date_of_birth} onChange={(v) => onChange({ ...data, date_of_birth: v })} />
      <SelectField label="Gender" name="gender" options={GENDERS.map((g) => ({ value: g, label: g }))} value={data.gender} onChange={(v) => onChange({ ...data, gender: v })} />
      <InputField label="Address" name="address" value={data.address} onChange={(v) => onChange({ ...data, address: v })} />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
        <select
          value={data.class_id ?? ""}
          onChange={(e) => {
            const cid = e.target.value ? Number(e.target.value) : null;
            onChange({ ...data, class_id: cid, section_id: null });
          }}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Select class…</option>
          {classes?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
        <select
          value={data.section_id ?? ""}
          onChange={(e) => onChange({ ...data, section_id: e.target.value ? Number(e.target.value) : null })}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Select section…</option>
          {sections?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <InputField label="Roll Number" name="roll_number" type="number" value={data.roll_number} onChange={(v) => onChange({ ...data, roll_number: v ? Number(v) : null })} />
      <SelectField label="Division (Class 9)" name="division" options={DIVISIONS.map((d) => ({ value: d, label: d }))} value={data.division} onChange={(v) => onChange({ ...data, division: v })} />
      <InputField label="Guardian Name" name="guardian_name" value={data.guardian_name} onChange={(v) => onChange({ ...data, guardian_name: v })} />
      <InputField label="Guardian Phone" name="guardian_phone" value={data.guardian_phone} onChange={(v) => onChange({ ...data, guardian_phone: v })} />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-2xl font-extrabold text-slate-900">Students</h2>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          {students?.length ?? 0}
        </span>
        <div className="ml-auto">
          <button
            onClick={() => { setForm(emptyForm); setCreateOpen(true); }}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
          >
            + New Student
          </button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search students…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={filterClass}
          onChange={(e) => { setFilterClass(e.target.value ? Number(e.target.value) : ""); setPage(0); }}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Classes</option>
          {classes?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select
          value={filterDivision}
          onChange={(e) => { setFilterDivision(e.target.value); setPage(0); }}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Divisions</option>
          {DIVISIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-500 animate-pulse">
          Loading students…
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8">
          <p className="text-sm text-red-600">Failed to load students.</p>
        </div>
      ) : !students || students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-2xl mb-4">📚</div>
          <p className="text-slate-500">No students found</p>
          <p className="text-sm text-slate-400 mt-1">Create a new student to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Code</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Class</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Section</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Roll</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const cls = classes?.find((c) => c.id === s.class_id);
                const sec = allSections?.find((sec) => sec.id === s.section_id);
                return (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40">
                    <td className="px-4 py-2.5 text-slate-700 font-mono text-xs">{s.student_code}</td>
                    <td className="px-4 py-2.5 text-slate-900 font-medium">
                      <button onClick={() => openDetail(s)} className="hover:text-indigo-700 transition text-left">
                        {s.first_name} {s.last_name}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{s.email || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-600">{cls?.name || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-600">{sec?.name || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-600">{s.roll_number ?? "—"}</td>
                    <td className="px-4 py-2.5">{statusBadge(s.status)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openDetail(s)} className="px-2 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition" title="View Details">👁</button>
                        <button onClick={() => openEdit(s)} className="px-2 py-1 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition" title="Edit">✏️</button>
                        <button onClick={() => { setSelected(s); setResetPwOpen(true); setNewPassword(""); }} className="px-2 py-1 rounded-lg text-xs font-medium text-amber-600 hover:bg-amber-50 transition" title="Reset Password">🔑</button>
                        <button onClick={() => toggleStatusMut.mutate(s)} className={`px-2 py-1 rounded-lg text-xs font-medium transition ${s.status === "ACTIVE" ? "text-orange-600 hover:bg-orange-50" : "text-emerald-600 hover:bg-emerald-50"}`} title={s.status === "ACTIVE" ? "Deactivate" : "Activate"}>
                          {s.status === "ACTIVE" ? "⏸" : "▶"}
                        </button>
                        <button onClick={() => { setSelected(s); setDeleteOpen(true); }} className="px-2 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition" title="Delete">🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition">← Prev</button>
            <span className="text-sm text-slate-500">Page {page + 1}</span>
            <button disabled={students.length < 50} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition">Next →</button>
          </div>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Student" wide>
        <StudentForm data={form} onChange={setForm} isCreate />
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
          <button onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => createMut.mutate(form)} disabled={createMut.isPending || !form.first_name || !form.last_name} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
            {createMut.isPending ? "Creating…" : "Create Student"}
          </button>
        </div>
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Student" wide>
        <StudentForm data={form} onChange={setForm} isCreate={false} />
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
          <button onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => editMut.mutate(form)} disabled={editMut.isPending || !form.first_name || !form.last_name} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
            {editMut.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </Modal>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Student Details" wide>
        {detail ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-bold">
                {detail.first_name.charAt(0)}{detail.last_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{detail.first_name} {detail.last_name}</h3>
                <p className="text-sm text-slate-500">{detail.student_code}</p>
                <div className="mt-1">{statusBadge(detail.status)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="text-slate-900">{detail.email || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="text-slate-900">{detail.phone || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Date of Birth</span><span className="text-slate-900">{detail.date_of_birth || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Gender</span><span className="text-slate-900">{detail.gender || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Address</span><span className="text-slate-900 text-right max-w-[200px] truncate">{detail.address || "—"}</span></div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Academic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Class</span><span className="text-slate-900">{detail.class?.name || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Section</span><span className="text-slate-900">{detail.section?.name || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Roll Number</span><span className="text-slate-900">{detail.roll_number ?? "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Division</span><span className="text-slate-900">{detail.division || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Admission Date</span><span className="text-slate-900">{detail.admission_date || "—"}</span></div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Guardian Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Guardian Name</span><span className="text-slate-900">{detail.guardian_name || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Guardian Phone</span><span className="text-slate-900">{detail.guardian_phone || "—"}</span></div>
                </div>
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
            <button onClick={() => resetPwMut.mutate()} disabled={resetPwMut.isPending || newPassword.length < 8} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
              {resetPwMut.isPending ? "Resetting…" : "Reset Password"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMut.mutate()}
        title="Delete Student"
        message={`Are you sure you want to delete ${selected?.first_name} ${selected?.last_name}? This action will permanently remove the student and their login account. This cannot be undone.`}
        confirmLabel="Delete Student"
        loading={deleteMut.isPending}
      />
    </div>
  );
}
