import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

interface DropdownItem { id: number; name: string; }
interface FeeType { id: number; name: string; description: string | null; }
interface Invoice {
  id: number; student_id: number; fee_type_id: number;
  total_amount: number; paid_amount: number; due_amount: number;
  due_date: string | null; status: string;
}
interface Student { id: number; first_name: string; last_name: string; student_code: string; class_id: number | null; }

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PARTIAL: "bg-amber-100 text-amber-700 border-amber-200",
  PENDING: "bg-sky-100 text-sky-700 border-sky-200",
  OVERDUE: "bg-red-100 text-red-700 border-red-200",
};

export function AdminFeesPage() {
  const queryClient = useQueryClient();
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showPayForm, setShowPayForm] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [bulkForm, setBulkForm] = useState({ class_id: "", fee_type_id: "", total_amount: "", due_date: "" });

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: async () => (await api.get("/fees/invoices")).data as Invoice[],
  });

  const { data: classes } = useQuery({
    queryKey: ["admin-classes"],
    queryFn: async () => (await api.get("/admin/classes")).data as DropdownItem[],
  });

  const { data: feeTypes } = useQuery({
    queryKey: ["fee-types"],
    queryFn: async () => (await api.get("/fees/types")).data as FeeType[],
  });

  const { data: students } = useQuery({
    queryKey: ["admin-students-list"],
    queryFn: async () => (await api.get("/admin/students")).data as Student[],
  });

  const bulkMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post("/fees/invoices/bulk", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      setShowBulkForm(false);
      setBulkForm({ class_id: "", fee_type_id: "", total_amount: "", due_date: "" });
    },
  });

  const payMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      (await api.post(`/fees/invoices/${id}/payments`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      setShowPayForm(null);
      setPayAmount("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/fees/invoices/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-invoices"] }),
  });

  const totalPending = invoices?.filter(i => i.status === "PENDING" || i.status === "OVERDUE").reduce((s, i) => s + i.due_amount, 0) || 0;
  const totalCollected = invoices?.reduce((s, i) => s + i.paid_amount, 0) || 0;
  const totalDue = invoices?.reduce((s, i) => s + i.due_amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-2xl p-6 text-white shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Fee Management</h2>
            <p className="text-emerald-100 text-sm mt-1">Manage tuition fees, collect payments and track invoices</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowBulkForm(!showBulkForm)}
              className="px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition">
              {showBulkForm ? "Cancel" : "+ Bulk Generate"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Total Collected</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">TK {totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Pending / Overdue</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">TK {totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Total Due</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">TK {totalDue.toLocaleString()}</p>
        </div>
      </div>

      {/* Bulk Generate Form */}
      {showBulkForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Bulk Generate Fee Invoices</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Class *</label>
              <select value={bulkForm.class_id} onChange={(e) => setBulkForm({ ...bulkForm, class_id: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Select class...</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Fee Type *</label>
              <select value={bulkForm.fee_type_id} onChange={(e) => setBulkForm({ ...bulkForm, fee_type_id: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Select type...</option>
                {feeTypes?.map(ft => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Amount *</label>
              <input type="number" value={bulkForm.total_amount} onChange={(e) => setBulkForm({ ...bulkForm, total_amount: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Due Date</label>
              <input type="date" value={bulkForm.due_date} onChange={(e) => setBulkForm({ ...bulkForm, due_date: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-3">
            <button onClick={() => setShowBulkForm(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
            <button onClick={() => {
              if (!bulkForm.class_id || !bulkForm.fee_type_id || !bulkForm.total_amount) return;
              bulkMutation.mutate({
                class_id: Number(bulkForm.class_id), fee_type_id: Number(bulkForm.fee_type_id),
                total_amount: Number(bulkForm.total_amount), due_date: bulkForm.due_date || null,
              });
            }} disabled={bulkMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition">
              {bulkMutation.isPending ? "Generating..." : "Generate Invoices"}
            </button>
          </div>
          {bulkMutation.isSuccess && <p className="text-xs text-emerald-600 mt-2 text-right">Invoices generated. Students have been notified.</p>}
        </div>
      )}

      {/* Payment Form Modal */}
      {showPayForm !== null && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Record Payment for Invoice #{showPayForm}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Amount *</label>
              <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Method</label>
              <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {["CASH", "BKASH", "NAGAD", "BANK", "OTHER"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-3">
            <button onClick={() => setShowPayForm(null)} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
            <button onClick={() => {
              if (!payAmount || Number(payAmount) <= 0) return;
              payMutation.mutate({ id: showPayForm, payload: { amount: Number(payAmount), method: payMethod } });
            }} disabled={payMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition">
              {payMutation.isPending ? "Saving..." : "Record Payment"}
            </button>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">All Invoices{invoices ? ` (${invoices.length})` : ""}</h3>
        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}</div>
        ) : !invoices || invoices.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No invoices yet. Click "+ Bulk Generate" to create fee invoices.</p>
        ) : (
          <div className="space-y-3">
            {invoices.map(inv => {
              const student = students?.find(s => s.id === inv.student_id);
              const feeType = feeTypes?.find(ft => ft.id === inv.fee_type_id);
              return (
                <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-semibold text-slate-900">{student ? `${student.first_name} ${student.last_name}` : `Student #${inv.student_id}`}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[inv.status] || "bg-slate-100 text-slate-600"}`}>{inv.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">{feeType?.name || "Fee"} — TK {inv.total_amount} total, TK {inv.paid_amount} paid, TK {inv.due_amount} due</p>
                    <p className="text-[10px] text-slate-400 mt-1">Due: {inv.due_date || "—"}</p>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    {inv.status !== "PAID" && (
                      <button onClick={() => { setShowPayForm(inv.id); setPayAmount(String(inv.due_amount)); }}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition">
                        Pay
                      </button>
                    )}
                    <button onClick={() => { if (confirm("Delete this invoice?")) deleteMutation.mutate(inv.id); }}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
