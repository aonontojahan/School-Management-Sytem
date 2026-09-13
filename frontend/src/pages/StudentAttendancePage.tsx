import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface AttendanceRecord {
  id: number;
  student_id: number;
  class_id: number;
  section_id: number;
  date: string;
  status: string;
  period: number | null;
  marked_by: number | null;
}

interface AttendanceRate {
  student_id: number;
  present_days: number;
  total_days: number;
  rate: number;
}

interface StudentProfile {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  class_id: number | null;
  section_id: number | null;
}

interface ProfileData {
  profile: StudentProfile;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getStatusConfig(status: string) {
  switch (status) {
    case "PRESENT":
      return { label: "Present", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "ABSENT":
      return { label: "Absent", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" };
    case "LATE":
      return { label: "Late", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" };
    default:
      return { label: status, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200", dot: "bg-slate-500" };
  }
}

export function StudentAttendancePage() {
  const [monthFilter, setMonthFilter] = useState<string>("all");

  const { data: profileData } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: async () => (await api.get("/dashboard/student")).data as ProfileData,
  });

  const studentId = profileData?.profile?.id;

  const { data: attendanceRate } = useQuery({
    queryKey: ["student-attendance-rate", studentId],
    queryFn: async () => (await api.get(`/attendance/rate/${studentId}`)).data as AttendanceRate,
    enabled: !!studentId,
  });

  const { data: records, isLoading } = useQuery({
    queryKey: ["student-attendance", studentId],
    queryFn: async () => {
      const res = await api.get("/attendance", { params: { student_id: studentId } });
      return res.data as AttendanceRecord[];
    },
    enabled: !!studentId,
  });

  const allRecords = records || [];

  // Filter by month
  const filteredRecords = monthFilter === "all"
    ? allRecords
    : allRecords.filter((r) => {
        const d = new Date(r.date);
        return d.getMonth().toString() === monthFilter;
      });

  // Group by month for summary
  const monthlyData: Record<string, { present: number; absent: number; late: number; total: number }> = {};
  for (const r of allRecords) {
    const monthKey = new Date(r.date).getMonth().toString();
    if (!monthlyData[monthKey]) monthlyData[monthKey] = { present: 0, absent: 0, late: 0, total: 0 };
    monthlyData[monthKey].total++;
    if (r.status === "PRESENT") monthlyData[monthKey].present++;
    else if (r.status === "ABSENT") monthlyData[monthKey].absent++;
    else if (r.status === "LATE") monthlyData[monthKey].late++;
  }

  // Get unique months with data
  const monthsWithData = Object.keys(monthlyData).sort((a, b) => parseInt(b) - parseInt(a));

  // Today's status
  const today = new Date().toISOString().split("T")[0];
  const todayRecord = allRecords.find((r) => r.date === today);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-5 -bottom-5 w-28 h-28 bg-white/10 rounded-full blur-xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold">My Attendance</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mt-2 text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Your attendance records and report
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Attendance Rate</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{attendanceRate?.rate || 0}%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Overall</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Present Days</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{attendanceRate?.present_days || 0}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Out of {attendanceRate?.total_days || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Absent Days</p>
              <p className="text-2xl font-extrabold text-red-600 mt-1">
                {(attendanceRate?.total_days || 0) - (attendanceRate?.present_days || 0)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Missed classes</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Today</p>
              <p className={`text-lg font-extrabold mt-1 ${todayRecord?.status === "PRESENT" ? "text-emerald-600" : todayRecord?.status === "ABSENT" ? "text-red-600" : "text-slate-400"}`}>
                {todayRecord?.status || "No record"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{today}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
              todayRecord?.status === "PRESENT" ? "bg-gradient-to-br from-emerald-400 to-green-500" :
              todayRecord?.status === "ABSENT" ? "bg-gradient-to-br from-rose-400 to-red-500" :
              "bg-gradient-to-br from-slate-300 to-slate-400"
            }`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      {monthsWithData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Monthly Summary</h3>
          <div className="space-y-3">
            {monthsWithData.map((monthKey) => {
              const data = monthlyData[monthKey];
              const rate = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
              const monthName = MONTHS[parseInt(monthKey)];
              return (
                <div key={monthKey} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <div className="w-12 text-center shrink-0">
                    <p className="text-sm font-bold text-slate-900">{monthName}</p>
                    <p className="text-[10px] text-slate-400">{data.total} days</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-10 text-right">{rate}%</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{data.present} present</span>
                      <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500" />{data.absent} absent</span>
                      {data.late > 0 && <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" />{data.late} late</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attendance Records */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700">Attendance History</h3>
          <div className="flex items-center gap-2">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border-0 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Months</option>
              {monthsWithData.map((m) => (
                <option key={m} value={m}>{MONTHS[parseInt(m)]}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">No attendance records</p>
            <p className="text-xs text-slate-400 mt-1">No records found for this period</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRecords.map((record) => {
              const config = getStatusConfig(record.status);
              const d = new Date(record.date);
              const isToday = record.date === today;
              return (
                <div
                  key={record.id}
                  className={`flex items-center gap-4 p-3 rounded-xl border ${config.bg} ${config.border} ${isToday ? "ring-2 ring-indigo-200" : ""}`}
                >
                  {/* Date */}
                  <div className="w-14 text-center shrink-0">
                    <p className="text-xs font-bold text-slate-900">{d.getDate()}</p>
                    <p className="text-[10px] text-slate-500">{MONTHS[d.getMonth()]} {d.getFullYear()}</p>
                  </div>

                  {/* Divider */}
                  <div className={`w-0.5 h-10 rounded-full ${config.dot} shrink-0`} />

                  {/* Status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                      <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
                      {isToday && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-semibold">Today</span>
                      )}
                    </div>
                    {record.period && (
                      <p className="text-[10px] text-slate-500 mt-0.5">Period {record.period}</p>
                    )}
                  </div>

                  {/* Day */}
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
