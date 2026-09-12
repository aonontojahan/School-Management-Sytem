import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

function cell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function Table({ title, endpoint, hint }: { title: string; endpoint: string; hint?: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint],
    queryFn: async () => (await api.get(endpoint)).data,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-500">
        Loading {title}…
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-red-600 mt-2">Failed to load: {(error as Error).message}</p>
      </div>
    );
  }
  const rows: Record<string, unknown>[] = Array.isArray(data) ? data : [];
  const cols = rows.length > 0 ? Object.keys(rows[0]).slice(0, 8) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          {rows.length}
        </span>
      </div>
      {hint && <p className="text-sm text-slate-500">{hint}</p>}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-auto">
        {rows.length === 0 ? (
          <p className="p-8 text-sm text-slate-500">No records yet. New entries created by admins and teachers will appear here.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                {cols.map((k) => (
                  <th key={k} className="px-4 py-3 font-semibold text-slate-600 capitalize">{k.replace(/_/g, " ")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40">
                  {cols.map((k) => (
                    <td key={k} className="px-4 py-2.5 text-slate-700 max-w-56 truncate">{cell(r[k])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export const Students = () => <Table title="Students" endpoint="/students" hint="Search, filter and class assignments are available via the API query parameters." />;
export const Teachers = () => <Table title="Teachers" endpoint="/teachers" />;
export const Guardians = () => <Table title="Guardians" endpoint="/guardians" />;
export const Classes = () => <Table title="Classes" endpoint="/academic/classes" />;
export const Subjects = () => <Table title="Subjects" endpoint="/academic/subjects" />;
export const AttendancePage = () => <Table title="Attendance" endpoint="/attendance" />;
export const ExamsPage = () => <Table title="Exams" endpoint="/exams" />;
export const AssignmentsPage = () => <Table title="Assignments" endpoint="/assignments" />;
export const FeesPage = () => <Table title="Fee Invoices" endpoint="/fees/invoices" hint="Total, paid and due amounts update automatically with each payment." />;
export const ResultsPage = () => <Table title="Results" endpoint="/exams" hint="Open an exam to see subject-wise marks, grades and GPA." />;
export const ReportsPage = () => <Table title="Reports" endpoint="/dashboard/summary" />;
export const ChildrenPage = () => <Table title="My Children" endpoint="/guardians" />;
export const ProfilePage = () => <Table title="My Profile" endpoint="/auth/me" />;
