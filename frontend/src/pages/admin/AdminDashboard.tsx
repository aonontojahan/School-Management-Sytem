import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

interface AdminStats {
  totals: {
    students: number;
    active_students: number;
    teachers: number;
    active_teachers: number;
    classes: number;
    sections: number;
  };
  exams: {
    upcoming: number;
    ongoing: number;
  };
  attendance: {
    today: { total: number; present: number; rate: number };
    week: { total: number; present: number; rate: number };
  };
  fees: {
    pending: number;
    overdue: number;
  };
}

interface MonthlyData {
  month: string;
  month_full: string;
  present: number;
  absent: number;
  total: number;
}

interface ClassAttendance {
  class_name: string;
  class_code: string;
  present: number;
  absent: number;
  total: number;
}

function StatCard({ label, value, sub, icon, color }: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function MonthlyAttendanceLineChart({ data }: { data: MonthlyData[] }) {
  const width = 500;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxPresent = Math.max(...data.map((d) => d.present), 1);
  const maxAbsent = Math.max(...data.map((d) => d.absent), 1);
  const maxVal = Math.max(maxPresent, maxAbsent);

  const toX = (i: number) => padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const toY = (v: number) => padding.top + chartH - (v / maxVal) * chartH;

  const presentPoints = data.map((d, i) => `${toX(i)},${toY(d.present)}`).join(" ");
  const absentPoints = data.map((d, i) => `${toX(i)},${toY(d.absent)}`).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => Math.round(maxVal * p));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-700">Monthly Attendance Report</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-500 rounded" /> Present</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-400 rounded" /> Absent</span>
        </div>
      </div>
      {data.every((d) => d.total === 0) ? (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          No attendance data recorded yet
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={toY(tick)}
                x2={width - padding.right}
                y2={toY(tick)}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
              <text x={padding.left - 8} y={toY(tick) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
                {tick}
              </text>
            </g>
          ))}
          {/* X-axis labels */}
          {data.map((d, i) => (
            <text key={i} x={toX(i)} y={height - 8} textAnchor="middle" className="fill-slate-400 text-[10px]">
              {d.month}
            </text>
          ))}
          {/* Present line */}
          <polyline
            points={presentPoints}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Present dots */}
          {data.map((d, i) => (
            <circle key={`p-${i}`} cx={toX(i)} cy={toY(d.present)} r="4" fill="#6366f1" stroke="white" strokeWidth="2" />
          ))}
          {/* Absent line */}
          <polyline
            points={absentPoints}
            fill="none"
            stroke="#f87171"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Absent dots */}
          {data.map((d, i) => (
            <circle key={`a-${i}`} cx={toX(i)} cy={toY(d.absent)} r="4" fill="#f87171" stroke="white" strokeWidth="2" />
          ))}
        </svg>
      )}
    </div>
  );
}

function ClassAttendanceBarChart({ data }: { data: ClassAttendance[] }) {
  const maxVal = Math.max(...data.map((d) => d.present + d.absent), 1);
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-700">Class-wise Attendance (Today)</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Present</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400" /> Absent</span>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          No classes or attendance data yet
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-[10px] text-slate-400">
            <span>{maxVal}</span>
            <span>{Math.round(maxVal * 0.75)}</span>
            <span>{Math.round(maxVal * 0.5)}</span>
            <span>{Math.round(maxVal * 0.25)}</span>
            <span>0</span>
          </div>
          <div className="ml-12">
            <div className="relative" style={{ height: chartHeight }}>
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                <div
                  key={pct}
                  className="absolute w-full border-t border-dashed border-slate-100"
                  style={{ top: `${(1 - pct) * 100}%` }}
                />
              ))}
              <div className="absolute inset-0 flex items-end justify-between gap-2">
                {data.map((d, i) => {
                  const presentH = maxVal > 0 ? (d.present / maxVal) * chartHeight : 0;
                  const absentH = maxVal > 0 ? (d.absent / maxVal) * chartHeight : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                        {d.class_name}: {d.present}P / {d.absent}A
                      </div>
                      <div className="w-full flex gap-px items-end" style={{ height: chartHeight }}>
                        <div
                          className="flex-1 bg-emerald-500 rounded-t-sm hover:bg-emerald-600 transition cursor-pointer"
                          style={{ height: presentH }}
                        />
                        <div
                          className="flex-1 bg-red-400 rounded-t-sm hover:bg-red-500 transition cursor-pointer"
                          style={{ height: absentH }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 text-center leading-tight truncate w-full">{d.class_name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/dashboard/admin/stats")).data as AdminStats,
  });

  const { data: monthlyData = [] } = useQuery({
    queryKey: ["monthly-attendance"],
    queryFn: async () => (await api.get("/dashboard/monthly-attendance")).data as MonthlyData[],
  });

  const { data: classData = [] } = useQuery({
    queryKey: ["class-attendance"],
    queryFn: async () => (await api.get("/dashboard/class-attendance")).data as ClassAttendance[],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                  <div className="h-7 w-16 bg-slate-100 rounded" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 h-72 animate-pulse">
              <div className="h-4 w-40 bg-slate-100 rounded mb-4" />
              <div className="h-full bg-slate-50 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-8 text-center">
        <svg className="w-12 h-12 text-red-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p className="text-slate-900 font-semibold">Could not load dashboard</p>
        <p className="text-sm text-slate-500 mt-1">Check that the backend is running.</p>
      </div>
    );
  }

  const absentToday = data.attendance.today.total - data.attendance.today.present;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back! Here is your school overview.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/students"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-indigo-200 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Student
          </Link>
          <Link
            to="/teachers"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-emerald-200 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Teacher
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={data.totals.students}
          sub={`${data.totals.active_students} active`}
          color="bg-indigo-500"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          label="Present Today"
          value={data.attendance.today.present}
          sub={`${data.attendance.today.rate}% attendance rate`}
          color="bg-emerald-500"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Absent Today"
          value={absentToday}
          sub={`out of ${data.attendance.today.total} total`}
          color="bg-red-500"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Teachers"
          value={data.totals.teachers}
          sub={`${data.totals.active_teachers} active`}
          color="bg-violet-500"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{data.totals.classes}</p>
              <p className="text-xs text-slate-500">Classes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{data.exams.upcoming}</p>
              <p className="text-xs text-slate-500">Upcoming Exams</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{data.fees.pending}</p>
              <p className="text-xs text-slate-500">Pending Fees</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{data.fees.overdue}</p>
              <p className="text-xs text-slate-500">Overdue Fees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MonthlyAttendanceLineChart data={monthlyData} />
        <ClassAttendanceBarChart data={classData} />
      </div>
    </div>
  );
}
