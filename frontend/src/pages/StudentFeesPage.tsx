import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

interface Invoice {
  id: number; fee_type_name: string | null; total_amount: number; paid_amount: number;
  due_amount: number; due_date: string | null; status: string;
  payments: { amount: number; method: string; paid_at: string | null; }[];
}

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PARTIAL: "bg-amber-100 text-amber-700 border-amber-200",
  PENDING: "bg-sky-100 text-sky-700 border-sky-200",
  OVERDUE: "bg-red-100 text-red-700 border-red-200",
};

export function StudentFeesPage() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["student-invoices"],
    queryFn: async () => (await api.get("/fees/my-invoices")).data as Invoice[],
  });

  const totalDue = invoices?.reduce((s, i) => s + i.due_amount, 0) || 0;
  const totalPaid = invoices?.reduce((s, i) => s + i.paid_amount, 0) || 0;
  const unpaid = invoices?.filter(i => i.status !== "PAID") || [];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-6 text-white shadow">
        <h2 className="text-2xl font-extrabold">My Fees</h2>
        <p className="text-blue-100 text-sm mt-1">View your fee invoices and payment history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Total Paid</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Total Due</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">${totalDue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Unpaid Invoices</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{unpaid.length}</p>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Fee Invoices</h3>
        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse" />)}</div>
        ) : !invoices || invoices.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No fee invoices yet.</p>
        ) : (
          <div className="space-y-3">
            {invoices.map(inv => (
              <div key={inv.id} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-slate-900">{inv.fee_type_name || "Fee"}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[inv.status] || "bg-slate-100 text-slate-600"}`}>{inv.status}</span>
                  </div>
                  <p className="text-xs text-slate-500">Due: {inv.due_date || "—"}</p>
                </div>
                <div className="flex gap-6 text-xs text-slate-600">
                  <span>Total: <strong>${inv.total_amount}</strong></span>
                  <span>Paid: <strong className="text-emerald-600">${inv.paid_amount}</strong></span>
                  <span>Due: <strong className="text-red-600">${inv.due_amount}</strong></span>
                </div>
                {inv.payments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-[10px] font-semibold text-slate-500 mb-1">Payment History</p>
                    {inv.payments.map((p, i) => (
                      <div key={i} className="flex gap-4 text-[10px] text-slate-500">
                        <span>${p.amount} via {p.method}</span>
                        <span>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
