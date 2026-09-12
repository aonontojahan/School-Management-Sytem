import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/ui/Toast";

interface Subject {
  id: number;
  name: string;
  code: string;
  description: string | null;
}

export function AdminSubjectPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: async () => (await api.get("/admin/subjects")).data as Subject[],
  });

  const filtered = subjects?.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  const createMut = useMutation({
    mutationFn: async (data: typeof form) => (await api.post("/admin/subjects", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
      setCreateOpen(false);
      setForm({ name: "", code: "", description: "" });
      showToast("Subject created");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to create", "error");
    },
  });

  const editMut = useMutation({
    mutationFn: async (data: typeof form) => (await api.put(`/admin/subjects/${selected!.id}`, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
      setEditOpen(false);
      setSelected(null);
      showToast("Subject updated");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to update", "error");
    },
  });

  const deleteMut = useMutation({
    mutationFn: async () => await api.delete(`/admin/subjects/${selected!.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
      setDeleteOpen(false);
      setSelected(null);
      showToast("Subject deleted");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to delete", "error");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Subjects</h1>
          <p className="text-sm text-slate-500 mt-1">Manage subjects across all classes</p>
        </div>
        <button
          onClick={() => { setForm({ name: "", code: "", description: "" }); setCreateOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
        >
          + Add Subject
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or code..."
            className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-500 animate-pulse">
          Loading subjects…
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-2xl mb-4">📚</div>
          <p className="text-slate-500">{search ? "No subjects match your search" : "No subjects yet"}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Code</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Description</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40">
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">{s.code}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-900 font-medium">{s.name}</td>
                  <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate">{s.description || "—"}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => { setSelected(s); setForm({ name: s.name, code: s.code, description: s.description || "" }); setEditOpen(true); }}
                        className="px-2 py-1 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setSelected(s); setDeleteOpen(true); }}
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
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Subject">
        <SubjectForm form={form} setForm={setForm} />
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
          <button
            onClick={() => createMut.mutate(form)}
            disabled={createMut.isPending || !form.name.trim() || !form.code.trim()}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {createMut.isPending ? "Creating…" : "Create"}
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Subject">
        <SubjectForm form={form} setForm={setForm} />
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
          <button
            onClick={() => editMut.mutate(form)}
            disabled={editMut.isPending || !form.name.trim() || !form.code.trim()}
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
        title="Delete Subject"
        message={`Are you sure you want to delete "${selected?.name}"? This will remove it from all classes.`}
        confirmLabel="Delete"
        loading={deleteMut.isPending}
      />
    </div>
  );
}

function SubjectForm({ form, setForm }: { form: { name: string; code: string; description: string }; setForm: (f: typeof form) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Physics"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Code <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          placeholder="e.g. PHY"
          maxLength={16}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Optional description"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}
