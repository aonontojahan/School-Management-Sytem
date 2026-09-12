import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

interface Exam {
  id: number;
  name: string;
  exam_type: string;
  total_marks: number;
  passing_marks: number;
  start_date: string | null;
  end_date: string | null;
  class_id: number;
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

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function examTypeColor(type: string) {
  const colors: Record<string, string> = {
    MID_TERM: "bg-amber-100 text-amber-700",
    FINAL: "bg-red-100 text-red-700",
    CLASS_TEST: "bg-sky-100 text-sky-700",
    MONTHLY_TEST: "bg-emerald-100 text-emerald-700",
  };
  return colors[type] || "bg-slate-100 text-slate-600";
}

export function StudentExamsPage() {
  const queryClient = useQueryClient();

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ["student-exams"],
    queryFn: async () => (await api.get("/exams")).data as Exam[],
  });

  const { data: notifications, isLoading: notifLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data as Notification[],
  });

  const markReadMut = useMutation({
    mutationFn: async (id: number) => api.post(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMut = useMutation({
    mutationFn: async () => api.post("/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const examNotifs = (notifications || []).filter((n) => n.type === "EXAM");
  const unreadExamNotifs = examNotifs.filter((n) => !n.is_read);

  const now = new Date();
  const upcomingExams = (exams || []).filter((e) => {
    if (!e.end_date) return true;
    return new Date(e.end_date) >= now;
  });
  const pastExams = (exams || []).filter((e) => {
    if (!e.end_date) return false;
    return new Date(e.end_date) < now;
  });

  if (examsLoading || notifLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 h-28 animate-pulse" />
        <div className="bg-white rounded-2xl border border-slate-200 p-5 h-48 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white shadow">
        <h2 className="text-2xl font-extrabold">Examinations</h2>
        <p className="text-indigo-100 text-sm mt-1">View your upcoming exams and exam notifications</p>
      </div>

      {/* Exam Notifications */}
      {examNotifs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">
              Exam Notifications
              {unreadExamNotifs.length > 0 && (
                <span className="ml-2 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                  {unreadExamNotifs.length} new
                </span>
              )}
            </h3>
            {unreadExamNotifs.length > 0 && (
              <button
                onClick={() => markAllReadMut.mutate()}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="space-y-2">
            {examNotifs.slice(0, 5).map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 rounded-xl transition ${
                  n.is_read ? "bg-slate-50" : "bg-indigo-50 border border-indigo-100"
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.is_read ? "bg-slate-300" : "bg-indigo-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => markReadMut.mutate(n.id)}
                    className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700 shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Exams */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">
          Upcoming Exams{upcomingExams ? ` (${upcomingExams.length})` : ""}
        </h3>
        {!upcomingExams || upcomingExams.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No upcoming exams</p>
        ) : (
          <div className="space-y-3">
            {upcomingExams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-sm font-semibold text-slate-900">{exam.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${examTypeColor(exam.exam_type)}`}>
                      {exam.exam_type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Total: {exam.total_marks} marks &bull; Pass: {exam.passing_marks} marks
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formatDate(exam.start_date)}{exam.start_date && exam.end_date ? " — " : ""}{formatDate(exam.end_date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Exams */}
      {pastExams && pastExams.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Past Exams ({pastExams.length})</h3>
          <div className="space-y-3">
            {pastExams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl opacity-60">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-sm font-semibold text-slate-900">{exam.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${examTypeColor(exam.exam_type)}`}>
                      {exam.exam_type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {formatDate(exam.start_date)} — {formatDate(exam.end_date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
