import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

interface MonthlyRevenue { month: string; month_full: string; fee_collected: number; salary_paid: number; revenue: number; }
interface YearlyRevenue { year: number; fee_collected: number; salary_paid: number; revenue: number; }
interface FinancialSummary {
  month: number; year: number; month_name: string;
  fee_collected: number; salary_paid: number; revenue: number;
  pending_fees: number; overdue_fees: number; total_invoices: number; paid_invoices: number;
}

function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
  const width = 600;
  const height = 260;
  const padding = { top: 20, right: 20, bottom: 30, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => Math.max(d.fee_collected, d.salary_paid, Math.abs(d.revenue))), 1);
  const toX = (i: number) => padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const toY = (v: number) => padding.top + chartH - (Math.max(0, v) / maxVal) * chartH;

  const feePoints = data.map((d, i) => `${toX(i)},${toY(d.fee_collected)}`).join(" ");
  const salaryPoints = data.map((d, i) => `${toX(i)},${toY(d.salary_paid)}`).join(" ");
  const revenuePoints = data.map((d, i) => `${toX(i)},${toY(d.revenue)}`).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => Math.round(maxVal * p));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-700">Monthly Revenue</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 rounded" /> Fees</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-400 rounded" /> Salary</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-500 rounded" /> Revenue</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line x1={padding.left} y1={toY(tick)} x2={width - padding.right} y2={toY(tick)} stroke="#e2e8f0" strokeDasharray="4 4" />
            <text x={padding.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">${tick.toLocaleString()}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={i} x={toX(i)} y={height - 8} textAnchor="middle" className="fill-slate-400 text-[10px]">{d.month}</text>
        ))}
        <polyline points={feePoints} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={`f-${i}`} cx={toX(i)} cy={toY(d.fee_collected)} r="4" fill="#10b981" stroke="white" strokeWidth="2" />
        ))}
        <polyline points={salaryPoints} fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={`s-${i}`} cx={toX(i)} cy={toY(d.salary_paid)} r="4" fill="#f87171" stroke="white" strokeWidth="2" />
        ))}
        <polyline points={revenuePoints} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="6 3" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={`r-${i}`} cx={toX(i)} cy={toY(d.revenue)} r="3" fill="#6366f1" stroke="white" strokeWidth="2" />
        ))}
      </svg>
    </div>
  );
}

function YearlyBarChart({ data }: { data: YearlyRevenue[] }) {
  const width = 500;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barWidth = Math.min(chartW / data.length / 3 - 4, 30);

  const maxVal = Math.max(...data.map(d => Math.max(d.fee_collected, d.salary_paid)), 1);
  const toY = (v: number) => padding.top + chartH - (v / maxVal) * chartH;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-700">Yearly Revenue</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-emerald-500" /> Fees</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-red-400" /> Salary</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <g key={p}>
            <line x1={padding.left} y1={toY(maxVal * p)} x2={width - padding.right} y2={toY(maxVal * p)} stroke="#e2e8f0" strokeDasharray="4 4" />
            <text x={padding.left - 8} y={toY(maxVal * p) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">${Math.round(maxVal * p).toLocaleString()}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const groupX = padding.left + (i / data.length) * chartW + (chartW / data.length) / 2;
          const feeH = (d.fee_collected / maxVal) * chartH;
          const salaryH = (d.salary_paid / maxVal) * chartH;
          return (
            <g key={i}>
              <rect x={groupX - barWidth - 2} y={toY(d.fee_collected)} width={barWidth} height={feeH} fill="#10b981" rx="3" />
              <rect x={groupX + 2} y={toY(d.salary_paid)} width={barWidth} height={salaryH} fill="#f87171" rx="3" />
              <text x={groupX} y={height - 8} textAnchor="middle" className="fill-slate-400 text-[10px]">{d.year}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function AdminReportsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: summary } = useQuery({
    queryKey: ["financial-summary"],
    queryFn: async () => (await api.get("/dashboard/financial-summary")).data as FinancialSummary,
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ["monthly-revenue", selectedYear],
    queryFn: async () => (await api.get(`/dashboard/monthly-revenue?year=${selectedYear}`)).data as MonthlyRevenue[],
  });

  const { data: yearlyData } = useQuery({
    queryKey: ["yearly-revenue"],
    queryFn: async () => (await api.get("/dashboard/yearly-revenue")).data as YearlyRevenue[],
  });

  const totalFee = yearlyData?.reduce((s, y) => s + y.fee_collected, 0) || 0;
  const totalSalary = yearlyData?.reduce((s, y) => s + y.salary_paid, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white shadow">
        <h2 className="text-2xl font-extrabold">Financial Reports</h2>
        <p className="text-indigo-100 text-sm mt-1">Revenue analysis, fee collection and salary payouts</p>
      </div>

      {/* Current Month Summary */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500">Fee Collected ({summary.month_name})</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">${summary.fee_collected.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500">Salary Paid ({summary.month_name})</p>
            <p className="text-2xl font-extrabold text-red-500 mt-1">${summary.salary_paid.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500">Net Revenue ({summary.month_name})</p>
            <p className={`text-2xl font-extrabold mt-1 ${summary.revenue >= 0 ? "text-indigo-600" : "text-red-600"}`}>${summary.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500">Pending Fees</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{summary.pending_fees}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500">Paid / Total Invoices</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{summary.paid_invoices}/{summary.total_invoices}</p>
          </div>
        </div>
      )}

      {/* Lifetime Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Total Fees Collected (All Time)</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">${totalFee.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Total Salary Paid (All Time)</p>
          <p className="text-2xl font-extrabold text-red-500 mt-1">${totalSalary.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Net Revenue (All Time)</p>
          <p className={`text-2xl font-extrabold mt-1 ${totalFee - totalSalary >= 0 ? "text-indigo-600" : "text-red-600"}`}>
            ${(totalFee - totalSalary).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-700">Monthly Revenue</h3>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {Array.from({ length: 5 }, (_, i) => currentYear - 4 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        {monthlyLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 h-72 animate-pulse" />
        ) : monthlyData ? (
          <RevenueChart data={monthlyData} />
        ) : null}
      </div>

      {/* Yearly Revenue Chart */}
      {yearlyData && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-2">Yearly Revenue</h3>
          <YearlyBarChart data={yearlyData} />
        </div>
      )}
    </div>
  );
}
