import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { EmptyState } from "../components/ui/EmptyState";

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  OVERDUE: "bg-red-100 text-red-700 border-red-200",
};

interface SalaryData {
  structure: { monthly_amount: number; effective_from: string | null; } | null;
  payments: { id: number; month: number; year: number; amount: number; status: string; paid_at: string | null; }[];
}

export function TeacherSalaryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-salary"],
    queryFn: async () => (await api.get("/salary/my-salary")).data as SalaryData,
  });

  const totalPaid = data?.payments.filter(p => p.status === "PAID").reduce((s, p) => s + p.amount, 0) || 0;
  const totalPending = data?.payments.filter(p => p.status !== "PAID").reduce((s, p) => s + p.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-2xl p-6 text-white shadow">
        <h2 className="text-2xl font-extrabold">My Salary</h2>
        <p className="text-emerald-100 text-sm mt-1">View your salary details and payment history</p>
      </div>

      {/* Salary Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Monthly Salary</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">TK {data?.structure?.monthly_amount?.toLocaleString() || "—"}</p>
          {data?.structure?.effective_from && <p className="text-[10px] text-slate-400 mt-1">Since {data.structure.effective_from}</p>}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Total Received</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">TK {totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Pending</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">TK {totalPending.toLocaleString()}</p>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Payment History</h3>
        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}</div>
        ) : !data?.payments || data.payments.length === 0 ? (
          <EmptyState
            icon="💰"
            title="No salary records yet"
            description="Salary will appear once the admin sets up your salary structure."
          />
        ) : (
          <div className="space-y-3">
            {data.payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-violet-700">{MONTHS[p.month]?.slice(0, 3)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{MONTHS[p.month]} {p.year}</p>
                    <p className="text-xs text-slate-500">TK {p.amount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.paid_at && <p className="text-[10px] text-slate-400">Paid {new Date(p.paid_at).toLocaleDateString()}</p>}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[p.status] || "bg-slate-100 text-slate-600"}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
