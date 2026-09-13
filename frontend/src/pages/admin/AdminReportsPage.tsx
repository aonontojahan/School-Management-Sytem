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
interface AdminStats {
  totals: { students: number; active_students: number; teachers: number; active_teachers: number; classes: number; sections: number; };
  exams: { upcoming: number; ongoing: number; };
  attendance: { today: { total: number; present: number; rate: number; }; week: { total: number; present: number; rate: number; }; };
  fees: { pending: number; overdue: number; };
  recent: { students: { id: number; name: string; }[]; teachers: { id: number; name: string; }[]; exams: { id: number; name: string; exam_type: string; }[]; };
}
interface MonthlyAttendance { month: string; month_full: string; present: number; absent: number; total: number; }
interface ClassAttendance { class_name: string; present: number; absent: number; total: number; }

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
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
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
            <text x={padding.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">TK {tick.toLocaleString()}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={i} x={toX(i)} y={height - 8} textAnchor="middle" className="fill-slate-400 text-[10px]">{d.month}</text>
        ))}
        <polyline points={feePoints} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => <circle key={`f-${i}`} cx={toX(i)} cy={toY(d.fee_collected)} r="4" fill="#10b981" stroke="white" strokeWidth="2" />)}
        <polyline points={salaryPoints} fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => <circle key={`s-${i}`} cx={toX(i)} cy={toY(d.salary_paid)} r="4" fill="#f87171" stroke="white" strokeWidth="2" />)}
        <polyline points={revenuePoints} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="6 3" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => <circle key={`r-${i}`} cx={toX(i)} cy={toY(d.revenue)} r="3" fill="#6366f1" stroke="white" strokeWidth="2" />)}
      </svg>
    </div>
  );
}

function AttendanceBarChart({ data }: { data: MonthlyAttendance[] }) {
  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barW = Math.min(chartW / data.length / 2 - 3, 16);
  const maxVal = Math.max(...data.map(d => d.total), 1);
  const toY = (v: number) => padding.top + chartH - (v / maxVal) * chartH;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-700">Monthly Attendance</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-emerald-500" /> Present</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-red-400" /> Absent</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <g key={p}>
            <line x1={padding.left} y1={toY(maxVal * p)} x2={width - padding.right} y2={toY(maxVal * p)} stroke="#e2e8f0" strokeDasharray="4 4" />
            <text x={padding.left - 8} y={toY(maxVal * p) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{Math.round(maxVal * p)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = padding.left + (i / data.length) * chartW + (chartW / data.length) / 2;
          return (
            <g key={i}>
              <rect x={cx - barW - 2} y={toY(d.present)} width={barW} height={chartH - (chartH - (d.present / maxVal) * chartH)} fill="#10b981" rx="3" />
              <rect x={cx + 2} y={toY(d.absent)} width={barW} height={chartH - (chartH - (d.absent / maxVal) * chartH)} fill="#f87171" rx="3" />
              <text x={cx} y={height - 8} textAnchor="middle" className="fill-slate-400 text-[10px]">{d.month}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ClassAttendanceChart({ data }: { data: ClassAttendance[] }) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="text-sm font-bold text-slate-700 mb-4">Today's Class Attendance</h3>
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600 w-24 truncate">{d.class_name}</span>
            <div className="flex-1 flex items-center gap-1">
              <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden flex">
                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(d.present / maxVal) * 100}%` }} />
                <div className="bg-red-400 h-full transition-all" style={{ width: `${(d.absent / maxVal) * 100}%` }} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 w-12 text-right">{d.present}/{d.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminReportsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "finance">("overview");

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/dashboard/admin/stats")).data as AdminStats,
  });

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

  const { data: monthlyAttendance } = useQuery({
    queryKey: ["monthly-attendance"],
    queryFn: async () => (await api.get("/dashboard/monthly-attendance")).data as MonthlyAttendance[],
  });

  const { data: classAttendance } = useQuery({
    queryKey: ["class-attendance"],
    queryFn: async () => (await api.get("/dashboard/class-attendance")).data as ClassAttendance[],
  });

  const totalFee = yearlyData?.reduce((s, y) => s + y.fee_collected, 0) || 0;
  const totalSalary = yearlyData?.reduce((s, y) => s + y.salary_paid, 0) || 0;

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { key: "attendance" as const, label: "Attendance", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
    { key: "finance" as const, label: "Finance", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Reports</h1>
            <div className="inline-flex items-center gap-1.5 mt-1.5 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
              <svg className="w-3.5 h-3.5 text-purple-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-purple-50 text-xs font-semibold">Academic, attendance, and financial analytics for your school</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 flex gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === t.key ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-600 hover:bg-slate-50"
            }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
            </svg>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════ OVERVIEW TAB ═══════════ */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          {/* Academic Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Academic Overview</h2>
              <p className="text-xs text-slate-500">Total students, teachers, classes, and exams</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-6 divide-x divide-slate-100">
              {[
                { label: "Students", value: stats.totals.students, color: "blue" },
                { label: "Active", value: stats.totals.active_students, color: "emerald" },
                { label: "Teachers", value: stats.totals.teachers, color: "violet" },
                { label: "Classes", value: stats.totals.classes, color: "amber" },
                { label: "Sections", value: stats.totals.sections, color: "cyan" },
                { label: "Exams", value: stats.exams.upcoming + stats.exams.ongoing, color: "rose" },
              ].map((s, i) => (
                <div key={i} className="px-5 py-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</p>
                  <p className={`text-2xl font-extrabold text-${s.color}-600 mt-1`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Attendance Snapshot</h2>
              <p className="text-xs text-slate-500">Today and this week's attendance summary</p>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div className="p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Today</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-extrabold text-emerald-600">{stats.attendance.today.rate}%</span>
                  <span className="text-xs text-slate-500 mb-1">{stats.attendance.today.present}/{stats.attendance.today.total} present</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${stats.attendance.today.rate}%` }} />
                </div>
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">This Week</p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-extrabold text-blue-600">{stats.attendance.week.rate}%</span>
                  <span className="text-xs text-slate-500 mb-1">{stats.attendance.week.present}/{stats.attendance.week.total} present</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${stats.attendance.week.rate}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Fee Status */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summary && [
              { label: "Fee Collected", value: `TK ${summary.fee_collected.toLocaleString()}`, color: "emerald", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1" },
              { label: "Salary Paid", value: `TK ${summary.salary_paid.toLocaleString()}`, color: "red", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
              { label: "Pending Fees", value: summary.pending_fees.toString(), color: "amber", icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Overdue Fees", value: summary.overdue_fees.toString(), color: "red", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" },
            ].map((s, i) => (
              <div key={i} className="relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden">
                <div className={`absolute top-0 right-0 w-20 h-20 bg-${s.color}-50 rounded-bl-[40px]`} />
                <div className="relative z-10">
                  <div className={`w-8 h-8 rounded-lg bg-${s.color}-100 flex items-center justify-center mb-2`}>
                    <svg className={`w-4 h-4 text-${s.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</p>
                  <p className={`text-xl font-extrabold text-${s.color}-600 mt-1`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { title: "Recent Students", items: stats.recent.students, color: "blue", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
              { title: "Recent Teachers", items: stats.recent.teachers, color: "violet", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
              { title: "Recent Exams", items: stats.recent.exams.map(e => ({ id: e.id, name: e.name })), color: "amber", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            ].map((section, si) => (
              <div key={si} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg bg-${section.color}-100 flex items-center justify-center`}>
                    <svg className={`w-4 h-4 text-${section.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={section.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold text-slate-700">{section.title}</h3>
                </div>
                <div className="p-4">
                  {section.items.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-3">No records yet</p>
                  ) : (
                    <div className="space-y-2">
                      {section.items.slice(0, 5).map(item => (
                        <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50">
                          <div className={`w-6 h-6 rounded-full bg-${section.color}-100 flex items-center justify-center text-[9px] font-bold text-${section.color}-700`}>
                            {(item as { name: string }).name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <span className="text-xs font-medium text-slate-700 truncate">{(item as { name: string }).name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ ATTENDANCE TAB ═══════════ */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {monthlyAttendance && <AttendanceBarChart data={monthlyAttendance} />}
          {classAttendance && <ClassAttendanceChart data={classAttendance} />}
          {monthlyAttendance && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900">Monthly Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Month</th>
                      <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase">Total</th>
                      <th className="text-center px-5 py-3 text-xs font-bold text-emerald-500 uppercase">Present</th>
                      <th className="text-center px-5 py-3 text-xs font-bold text-red-500 uppercase">Absent</th>
                      <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyAttendance.filter(m => m.total > 0).map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900">{m.month_full}</td>
                        <td className="px-5 py-3 text-center text-sm text-slate-700">{m.total}</td>
                        <td className="px-5 py-3 text-center text-sm font-semibold text-emerald-600">{m.present}</td>
                        <td className="px-5 py-3 text-center text-sm font-semibold text-red-500">{m.absent}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            m.total > 0 && (m.present / m.total * 100) >= 80 ? "bg-emerald-100 text-emerald-700" :
                            m.total > 0 && (m.present / m.total * 100) >= 60 ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {m.total > 0 ? Math.round(m.present / m.total * 100) : 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ FINANCE TAB ═══════════ */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          {/* Lifetime Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-[40px]" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Fees Collected</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">TK {totalFee.toLocaleString()}</p>
              </div>
            </div>
            <div className="relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-bl-[40px]" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Salary Paid</p>
                <p className="text-2xl font-extrabold text-red-500 mt-1">TK {totalSalary.toLocaleString()}</p>
              </div>
            </div>
            <div className="relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-[40px]" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Net Revenue</p>
                <p className={`text-2xl font-extrabold mt-1 ${totalFee - totalSalary >= 0 ? "text-indigo-600" : "text-red-600"}`}>
                  TK {(totalFee - totalSalary).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Chart */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700">Monthly Revenue</h3>
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {Array.from({ length: 5 }, (_, i) => currentYear - 4 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            {monthlyLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 h-72 animate-pulse" />
            ) : monthlyData ? (
              <RevenueChart data={monthlyData} />
            ) : null}
          </div>

          {/* Yearly Chart */}
          {yearlyData && <YearlyBarChart data={yearlyData} />}
        </div>
      )}
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
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-700">Yearly Revenue</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-emerald-500" /> Fees</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-red-400" /> Salary</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <g key={p}>
            <line x1={padding.left} y1={toY(maxVal * p)} x2={width - padding.right} y2={toY(maxVal * p)} stroke="#e2e8f0" strokeDasharray="4 4" />
            <text x={padding.left - 8} y={toY(maxVal * p) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">TK {Math.round(maxVal * p).toLocaleString()}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const groupX = padding.left + (i / data.length) * chartW + (chartW / data.length) / 2;
          return (
            <g key={i}>
              <rect x={groupX - barWidth - 2} y={toY(d.fee_collected)} width={barWidth} height={(d.fee_collected / maxVal) * chartH} fill="#10b981" rx="3" />
              <rect x={groupX + 2} y={toY(d.salary_paid)} width={barWidth} height={(d.salary_paid / maxVal) * chartH} fill="#f87171" rx="3" />
              <text x={groupX} y={height - 8} textAnchor="middle" className="fill-slate-400 text-[10px]">{d.year}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
