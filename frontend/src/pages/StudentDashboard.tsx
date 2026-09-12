import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface StudentProfile {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  admission_date: string | null;
  roll_number: number | null;
  group: string | null;
  division: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  status: string;
}

interface AttendanceRecord {
  date: string;
  status: string;
  period: number | null;
}

interface Exam {
  id: number;
  name: string;
  exam_type: string;
  start_date: string | null;
  end_date: string | null;
  total_marks: number;
}

interface ExamRoutine {
  id: number; exam_name: string; subject_name: string;
  exam_date: string; start_time: string; end_time: string; room: string | null;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  ref_id: number | null;
  is_read: boolean;
  created_at: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string | null;
  subject_id: number;
}

interface FeeInvoice {
  id: number;
  fee_type_name: string | null;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  due_date: string | null;
  status: string;
  payments: { amount: number; method: string; paid_at: string | null }[];
}

interface RoutineEntry {
  day: string;
  period_label: string | null;
  start_time: string | null;
  end_time: string | null;
  subject_name: string | null;
  teacher_name: string | null;
}

interface StudentDashboardData {
  profile: StudentProfile;
  class: { id: number; name: string; code: string } | null;
  section: { id: number; name: string } | null;
  subjects: { id: number; name: string; code: string }[];
  attendance: {
    total_days: number;
    present_days: number;
    absent_days: number;
    rate: number;
    recent: AttendanceRecord[];
  };
  upcoming_exams: Exam[];
  recent_assignments: Assignment[];
  routine: RoutineEntry[];
}

const DAYS_ORDER = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_LABELS: Record<string, string> = {
  SUNDAY: "Sun", MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat",
};

function InfoCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function StudentDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: async () => (await api.get("/dashboard/student")).data as StudentDashboardData,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data as Notification[],
  });

  const { data: examRoutines } = useQuery({
    queryKey: ["student-exam-routines"],
    queryFn: async () => (await api.get("/exams/routines")).data as ExamRoutine[],
  });

  const { data: feeData } = useQuery({
    queryKey: ["student-fees"],
    queryFn: async () => {
      const res = await api.get("/fees/my-invoices");
      const invoices = res.data as FeeInvoice[];
      const total_pending = invoices.filter(i => i.status !== "PAID").reduce((sum, i) => sum + (i.total_amount - i.paid_amount), 0);
      return { invoices, total_pending };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 h-24 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-8 text-center">
        <p className="text-slate-900 font-semibold">Could not load dashboard</p>
        <p className="text-sm text-slate-500 mt-1">Check that the backend is running.</p>
      </div>
    );
  }

  const { profile, class: cls, section, subjects, attendance, upcoming_exams, recent_assignments, routine } = data;

  // Group routine by day
  const routineByDay: Record<string, RoutineEntry[]> = {};
  for (const entry of routine) {
    if (!routineByDay[entry.day]) routineByDay[entry.day] = [];
    routineByDay[entry.day].push(entry);
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-extrabold">Welcome, {profile.first_name}!</h1>
        <p className="text-indigo-100 mt-1">
          {cls?.name || "No class"} {section ? `- Section ${section.name}` : ""} | Roll #{profile.roll_number ?? "—"}
        </p>
        <div className="flex items-center gap-4 mt-3 text-sm text-indigo-100">
          <span>Code: {profile.student_code}</span>
          {profile.group && <><span>•</span><span>Group: {profile.group.replace("_", " ")}</span></>}
        </div>
      </div>

      {/* Exam Notifications */}
      {notifications && notifications.filter(n => n.type === "EXAM" && !n.is_read).length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
          <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            New Exam Notifications
          </h3>
          <div className="space-y-2">
            {notifications.filter(n => n.type === "EXAM" && !n.is_read).slice(0, 3).map((n) => (
              <div key={n.id} className="flex items-start gap-2 p-2 bg-white rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                  <p className="text-[11px] text-slate-500">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fee Notifications */}
      {notifications && notifications.filter(n => n.type === "FEE" && !n.is_read).length > 0 && (
        <div className="bg-rose-50 rounded-2xl border border-rose-200 p-5">
          <h3 className="text-sm font-bold text-rose-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Fee Notifications
          </h3>
          <div className="space-y-2">
            {notifications.filter(n => n.type === "FEE" && !n.is_read).slice(0, 3).map((n) => (
              <div key={n.id} className="flex items-start gap-2 p-2 bg-white rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                  <p className="text-[11px] text-slate-500">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fee Summary */}
      {feeData && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Fee Summary</h3>
            <a href="/fees" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View All →</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-600">Total Pending</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">${feeData.total_pending.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600">Total Invoices</p>
              <p className="text-2xl font-extrabold text-slate-700 mt-1">{feeData.invoices?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          label="Attendance Rate"
          value={`${attendance.rate}%`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <InfoCard
          label="Present Days"
          value={attendance.present_days}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <InfoCard
          label="Absent Days"
          value={attendance.absent_days}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        />
        <InfoCard
          label="Total Subjects"
          value={subjects.length}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
      </div>

      {/* Class Routine */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">My Class Routine</h3>
        {routine.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No routine scheduled</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Day</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Time</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Subject</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {DAYS_ORDER.filter(d => routineByDay[d]).map(day => (
                  routineByDay[day].map((entry, i) => (
                    <tr key={`${day}-${i}`} className="border-b border-slate-100 last:border-0">
                      {i === 0 && (
                        <td rowSpan={routineByDay[day].length} className="py-2 px-3 font-semibold text-indigo-700 align-top">
                          {DAY_LABELS[day]}
                        </td>
                      )}
                      <td className="py-2 px-3 text-slate-600">
                        {entry.start_time?.slice(0, 5)} - {entry.end_time?.slice(0, 5)}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">{entry.subject_name}</td>
                      <td className="py-2 px-3 text-slate-600">{entry.teacher_name}</td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Upcoming Exams</h3>
          {upcoming_exams.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No upcoming exams</p>
          ) : (
            <div className="space-y-3">
              {upcoming_exams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{exam.name}</p>
                    <p className="text-xs text-slate-500">{exam.exam_type.replace("_", " ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-indigo-600">{exam.start_date || "TBA"}</p>
                    <p className="text-xs text-slate-400">{exam.total_marks} marks</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exam Routine */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Exam Routine</h3>
            {examRoutines && examRoutines.length > 0 && (
              <a href="/exam-routine" className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700">View All</a>
            )}
          </div>
          {!examRoutines || examRoutines.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No exam routine yet</p>
          ) : (
            <div className="space-y-2">
              {examRoutines.slice(0, 4).map(r => (
                <div key={r.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  <div className="w-12 text-center shrink-0">
                    <p className="text-[10px] font-bold text-indigo-700">{r.start_time}</p>
                    <p className="text-[10px] text-slate-400">to</p>
                    <p className="text-[10px] font-bold text-indigo-700">{r.end_time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{r.subject_name}</p>
                    <p className="text-[10px] text-slate-500">{r.exam_name}</p>
                  </div>
                  {r.room && <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full shrink-0">{r.room}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Assignments */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Recent Assignments</h3>
          {recent_assignments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No assignments yet</p>
          ) : (
            <div className="space-y-3">
              {recent_assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{a.title}</p>
                    <p className="text-xs text-slate-500 truncate">{a.description}</p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="text-xs font-medium text-amber-600">Due: {a.due_date || "TBA"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Recent Attendance</h3>
          {attendance.recent.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No attendance recorded</p>
          ) : (
            <div className="space-y-2">
              {attendance.recent.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-600">{a.date}</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    a.status === "PRESENT" ? "bg-emerald-50 text-emerald-700" :
                    a.status === "ABSENT" ? "bg-red-50 text-red-700" :
                    a.status === "LATE" ? "bg-amber-50 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subjects */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">My Subjects</h3>
          {subjects.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No subjects assigned</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <span key={s.id} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Personal Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-slate-500">Email</span><p className="font-medium text-slate-900">{profile.email || "—"}</p></div>
          <div><span className="text-slate-500">Phone</span><p className="font-medium text-slate-900">{profile.phone || "—"}</p></div>
          <div><span className="text-slate-500">Date of Birth</span><p className="font-medium text-slate-900">{profile.date_of_birth || "—"}</p></div>
          <div><span className="text-slate-500">Gender</span><p className="font-medium text-slate-900">{profile.gender || "—"}</p></div>
          <div><span className="text-slate-500">Guardian</span><p className="font-medium text-slate-900">{profile.guardian_name || "—"}</p></div>
          <div><span className="text-slate-500">Guardian Phone</span><p className="font-medium text-slate-900">{profile.guardian_phone || "—"}</p></div>
          <div><span className="text-slate-500">Address</span><p className="font-medium text-slate-900">{profile.address || "—"}</p></div>
          <div><span className="text-slate-500">Admission Date</span><p className="font-medium text-slate-900">{profile.admission_date || "—"}</p></div>
        </div>
      </div>
    </div>
  );
}
