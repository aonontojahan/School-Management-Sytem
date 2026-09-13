import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

interface DropdownItem { id: number; name: string; }
interface Structure { id: number; teacher_id: number; teacher_name: string | null; designation: string | null; monthly_amount: number; effective_from: string | null; }
interface Payment { id: number; salary_structure_id: number; teacher_id: number; teacher_name: string | null; month: number; year: number; amount: number; status: string; paid_at: string | null; }

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  OVERDUE: "bg-red-100 text-red-700 border-red-200",
};

export function AdminSalaryPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ teacher_id: "", monthly_amount: "" });
  const [genMonth, setGenMonth] = useState(String(new Date().getMonth() + 1));
  const [genYear, setGenYear] = useState(String(new Date().getFullYear()));
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const { data: structures, isLoading: structuresLoading } = useQuery({
    queryKey: ["salary-structures"],
    queryFn: async () => (await api.get("/salary/structures")).data as Structure[],
  });

  const { data: teachers } = useQuery({
    queryKey: ["admin-teachers-list"],
    queryFn: async () => {
      const d = (await api.get("/admin/teachers")).data as { id: number; first_name: string; last_name: string; designation: string | null }[];
      return d.map(t => ({ id: t.id, name: `${t.first_name} ${t.last_name}`, designation: t.designation || "" }));
    },
  });

  const { data: payments } = useQuery({
    queryKey: ["salary-payments", filterMonth, filterYear],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterMonth) params.set("month", filterMonth);
      if (filterYear) params.set("year", filterYear);
      return (await api.get(`/salary/payments?${params}`)).data as Payment[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { teacher_id: number; monthly_amount: number }) => (await api.post("/salary/structures", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-structures"] });
      setShowForm(false);
      setForm({ teacher_id: "", monthly_amount: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { teacher_id: number; monthly_amount: number } }) =>
      (await api.post("/salary/structures", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-structures"] });
      setEditingId(null);
      setForm({ teacher_id: "", monthly_amount: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/salary/structures/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salary-structures"] }),
  });

  const generateMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post("/salary/payments/generate", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-payments"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const payMutation = useMutation({
    mutationFn: async (id: number) => (await api.post(`/salary/payments/${id}/pay`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-payments"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const totalPending = payments?.filter(p => p.status === "PENDING").reduce((s, p) => s + p.amount, 0) || 0;
  const totalPaid = payments?.filter(p => p.status === "PAID").reduce((s, p) => s + p.amount, 0) || 0;

  const startEdit = (s: Structure) => {
    setEditingId(s.id);
    setForm({ teacher_id: String(s.teacher_id), monthly_amount: String(s.monthly_amount) });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ teacher_id: "", monthly_amount: "" });
  };

  const submitForm = () => {
    if (!form.teacher_id || !form.monthly_amount) return;
    const payload = { teacher_id: Number(form.teacher_id), monthly_amount: Number(form.monthly_amount) };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const selectedTeacher = teachers?.find(t => t.id === Number(form.teacher_id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Salary Management</h1>
            <p className="text-violet-100 text-sm mt-0.5">Manage teacher salaries, generate monthly payouts and track payments</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-[40px] -z-0" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Paid</p>
            </div>
            <p className="text-2xl font-extrabold text-emerald-600">TK {totalPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-bl-[40px] -z-0" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Pending</p>
            </div>
            <p className="text-2xl font-extrabold text-amber-600">TK {totalPending.toLocaleString()}</p>
          </div>
        </div>
        <div className="relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-violet-50 rounded-bl-[40px] -z-0" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Teachers with Salary</p>
            </div>
            <p className="text-2xl font-extrabold text-violet-600">{structures?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Salary Structure */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Salary Structures</h2>
              <p className="text-xs text-slate-500">{structures?.length || 0} teachers configured</p>
            </div>
          </div>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ teacher_id: "", monthly_amount: "" }); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition shadow-sm shadow-violet-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Salary
          </button>
        </div>

        {/* Add/Edit Form Inline */}
        {showForm && (
          <div className="px-6 py-5 bg-violet-50/50 border-b border-violet-100">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${editingId ? "bg-amber-100" : "bg-violet-100"}`}>
                {editingId ? (
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </div>
              <p className="text-sm font-bold text-slate-700">{editingId ? "Edit Salary Structure" : "Add New Salary Structure"}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Teacher *</label>
                <select value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                  disabled={!!editingId}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition">
                  <option value="">Select teacher...</option>
                  {teachers?.map(t => <option key={t.id} value={t.id}>{t.name}{t.designation ? ` — ${t.designation}` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Monthly Salary (TK) *</label>
                <input type="number" value={form.monthly_amount} onChange={(e) => setForm({ ...form, monthly_amount: e.target.value })}
                  placeholder="e.g. 20000"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition" />
              </div>
              <div className="flex gap-2">
                <button onClick={cancelForm}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                  Cancel
                </button>
                <button onClick={submitForm}
                  disabled={createMutation.isPending || updateMutation.isPending || !form.teacher_id || !form.monthly_amount}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition shadow-sm">
                  {editingId
                    ? (updateMutation.isPending ? "Updating..." : "Update Salary")
                    : (createMutation.isPending ? "Saving..." : "Save Salary")}
                </button>
              </div>
            </div>
            {selectedTeacher && !editingId && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Designation: <span className="font-semibold text-slate-700">{selectedTeacher.designation || "Not set"}</span>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="p-6">
          {structuresLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />)}</div>
          ) : !structures || structures.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1">No salary structures yet</p>
              <p className="text-xs text-slate-500 mb-4">Add salary structures for teachers to enable salary generation</p>
              <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ teacher_id: "", monthly_amount: "" }); }}
                className="px-5 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition">
                + Add First Structure
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</th>
                    <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</th>
                    <th className="text-right pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Salary</th>
                    <th className="text-right pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {structures.map(s => (
                    <tr key={s.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {s.teacher_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "T"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{s.teacher_name || `Teacher #${s.teacher_id}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {s.designation || "—"}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <span className="text-base font-extrabold text-violet-600">TK {s.monthly_amount.toLocaleString()}</span>
                        <span className="text-xs text-slate-400 ml-1">/mo</span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(s)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition" title="Edit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => { if (confirm(`Delete salary structure for ${s.teacher_name}?`)) deleteMutation.mutate(s.id); }}
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
          )}
        </div>
      </div>

      {/* Generate Monthly Salaries */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Generate Monthly Salaries</h2>
            <p className="text-xs text-slate-500">Create salary payment records for all configured teachers</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Month *</label>
              <select value={genMonth} onChange={(e) => setGenMonth(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                {MONTHS.map((m, i) => i > 0 && <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Year *</label>
              <input type="number" value={genYear} onChange={(e) => setGenYear(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
            </div>
            <div className="flex items-end">
              <button onClick={() => generateMutation.mutate({ month: Number(genMonth), year: Number(genYear) })}
                disabled={generateMutation.isPending || !structures || structures.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm shadow-indigo-200">
                {generateMutation.isPending ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Salaries
                  </>
                )}
              </button>
            </div>
          </div>
          {generateMutation.isSuccess && (
            <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-emerald-700">Generated {generateMutation.data.generated} salary records. Teachers have been notified.</p>
            </div>
          )}
          {(!structures || structures.length === 0) && (
            <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
              <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm font-medium text-amber-700">Add salary structures first before generating payments.</p>
            </div>
          )}
        </div>
      </div>

      {/* Salary Payments */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Salary Payments{payments ? ` (${payments.length})` : ""}</h2>
              <p className="text-xs text-slate-500">Track and manage monthly salary payments</p>
            </div>
          </div>
          <div className="flex gap-2">
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition">
              <option value="">All Months</option>
              {MONTHS.map((m, i) => i > 0 && <option key={i} value={i}>{m}</option>)}
            </select>
            <input type="number" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} placeholder="Year"
              className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition" />
          </div>
        </div>
        <div className="p-6">
          {!payments || payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1">No salary payments yet</p>
              <p className="text-xs text-slate-500">Generate monthly salaries above to create payment records</p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {p.teacher_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "T"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{p.teacher_name || `Teacher #${p.teacher_id}`}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[p.status] || "bg-slate-100 text-slate-600"}`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{MONTHS[p.month]} {p.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-base font-extrabold text-slate-900">TK {p.amount.toLocaleString()}</p>
                      {p.paid_at && <p className="text-[10px] text-slate-400 mt-0.5">Paid {new Date(p.paid_at).toLocaleDateString()}</p>}
                    </div>
                    {p.status === "PENDING" && (
                      <button onClick={() => payMutation.mutate(p.id)} disabled={payMutation.isPending}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm shadow-emerald-200">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Pay
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
