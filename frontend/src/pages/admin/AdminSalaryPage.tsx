import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

interface DropdownItem { id: number; name: string; }
interface Structure { id: number; teacher_id: number; teacher_name: string | null; monthly_amount: number; effective_from: string | null; }
interface Payment { id: number; salary_structure_id: number; teacher_id: number; teacher_name: string | null; month: number; year: number; amount: number; status: string; paid_at: string | null; }

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  OVERDUE: "bg-red-100 text-red-700 border-red-200",
};

export function AdminSalaryPage() {
  const queryClient = useQueryClient();
  const [showStructureForm, setShowStructureForm] = useState(false);
  const [structForm, setStructForm] = useState({ teacher_id: "", monthly_amount: "" });
  const [genMonth, setGenMonth] = useState(String(new Date().getMonth() + 1));
  const [genYear, setGenYear] = useState(String(new Date().getFullYear()));
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const { data: structures, isLoading: structuresLoading } = useQuery({
    queryKey: ["salary-structures"],
    queryFn: async () => (await api.get("/salary/structures")).data as Structure[],
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

  const { data: teachers } = useQuery({
    queryKey: ["admin-teachers-list"],
    queryFn: async () => (await api.get("/admin/teachers")).data as DropdownItem[],
  });

  const createStructMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post("/salary/structures", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-structures"] });
      setShowStructureForm(false);
      setStructForm({ teacher_id: "", monthly_amount: "" });
    },
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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-700 to-violet-500 rounded-2xl p-6 text-white shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Salary Management</h2>
            <p className="text-violet-100 text-sm mt-1">Set teacher salaries, generate monthly payouts and track payments</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowStructureForm(!showStructureForm)}
              className="px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition">
              {showStructureForm ? "Cancel" : "+ Set Salary"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Total Paid</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Total Pending</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">${totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Teachers with Salary</p>
          <p className="text-2xl font-extrabold text-violet-600 mt-1">{structures?.length || 0}</p>
        </div>
      </div>

      {/* Set Salary Structure Form */}
      {showStructureForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Set Teacher Salary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Teacher *</label>
              <select value={structForm.teacher_id} onChange={(e) => setStructForm({ ...structForm, teacher_id: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">Select teacher...</option>
                {teachers?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Monthly Amount *</label>
              <input type="number" value={structForm.monthly_amount} onChange={(e) => setStructForm({ ...structForm, monthly_amount: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-3">
            <button onClick={() => setShowStructureForm(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
            <button onClick={() => {
              if (!structForm.teacher_id || !structForm.monthly_amount) return;
              createStructMutation.mutate({ teacher_id: Number(structForm.teacher_id), monthly_amount: Number(structForm.monthly_amount) });
            }} disabled={createStructMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition">
              {createStructMutation.isPending ? "Saving..." : "Save Salary"}
            </button>
          </div>
        </div>
      )}

      {/* Generate Monthly Salaries */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Generate Monthly Salary Payments</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Month *</label>
            <select value={genMonth} onChange={(e) => setGenMonth(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              {MONTHS.map((m, i) => i > 0 && <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Year *</label>
            <input type="number" value={genYear} onChange={(e) => setGenYear(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div className="flex items-end">
            <button onClick={() => generateMutation.mutate({ month: Number(genMonth), year: Number(genYear) })}
              disabled={generateMutation.isPending}
              className="w-full px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition">
              {generateMutation.isPending ? "Generating..." : "Generate Salaries"}
            </button>
          </div>
        </div>
        {generateMutation.isSuccess && (
          <p className="text-xs text-emerald-600 mt-2">Generated {generateMutation.data.generated} salary records. Teachers have been notified.</p>
        )}
      </div>

      {/* Salary Structures */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Salary Structures</h3>
        {structuresLoading ? (
          <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}</div>
        ) : !structures || structures.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No salary structures set. Click "+ Set Salary" to add one.</p>
        ) : (
          <div className="space-y-2">
            {structures.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{s.teacher_name || `Teacher #${s.teacher_id}`}</p>
                  <p className="text-xs text-slate-500">${s.monthly_amount.toLocaleString()}/month</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Salary Payments */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700">Salary Payments{payments ? ` (${payments.length})` : ""}</h3>
          <div className="flex gap-2">
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="">All Months</option>
              {MONTHS.map((m, i) => i > 0 && <option key={i} value={i}>{m}</option>)}
            </select>
            <input type="number" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} placeholder="Year"
              className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>
        {!payments || payments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No salary payments yet. Generate monthly salaries above.</p>
        ) : (
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-slate-900">{p.teacher_name || `Teacher #${p.teacher_id}`}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[p.status] || "bg-slate-100 text-slate-600"}`}>{p.status}</span>
                  </div>
                  <p className="text-xs text-slate-500">{MONTHS[p.month]} {p.year} — ${p.amount.toLocaleString()}</p>
                  {p.paid_at && <p className="text-[10px] text-slate-400">Paid: {new Date(p.paid_at).toLocaleDateString()}</p>}
                </div>
                {p.status === "PENDING" && (
                  <button onClick={() => payMutation.mutate(p.id)} disabled={payMutation.isPending}
                    className="ml-4 shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50">
                    Mark Paid
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
