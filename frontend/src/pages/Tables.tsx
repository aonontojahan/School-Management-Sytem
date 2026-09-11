import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

function Table({ title, endpoint }: { title: string; endpoint: string }) {
  const { data, isLoading, error } = useQuery({ queryKey: [endpoint], queryFn: async () => (await api.get(endpoint)).data });
  if (isLoading) return <p>Loading {title}…</p>;
  if (error) return <p className="text-red-600">Failed to load {title}: {(error as Error).message}</p>;
  const rows: Record<string, unknown>[] = Array.isArray(data) ? data : [];
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title} ({rows.length})</h2>
      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left">
            {rows.length > 0 && Object.keys(rows[0]).slice(0, 8).map((k) => <th key={k} className="px-3 py-2">{k}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b">
                {Object.values(r).slice(0, 8).map((v, j) => <td key={j} className="px-3 py-2">{String(v ?? "")}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const Students = () => <Table title="Students" endpoint="/students" />;
export const Teachers = () => <Table title="Teachers" endpoint="/teachers" />;
export const Guardians = () => <Table title="Guardians" endpoint="/guardians" />;
export const Classes = () => <Table title="Classes" endpoint="/academic/classes" />;
export const Subjects = () => <Table title="Subjects" endpoint="/academic/subjects" />;
export const AttendancePage = () => <Table title="Attendance" endpoint="/attendance" />;
export const ExamsPage = () => <Table title="Exams" endpoint="/exams" />;
export const AssignmentsPage = () => <Table title="Assignments" endpoint="/assignments" />;
export const FeesPage = () => <Table title="Fee Invoices" endpoint="/fees/invoices" />;
export const ResultsPage = () => <Table title="Results (open an exam to see marks)" endpoint="/exams" />;
export const ReportsPage = () => <Table title="Reports (dashboard summary source)" endpoint="/dashboard/summary" />;
export const ChildrenPage = () => <Table title="Children" endpoint="/guardians" />;
export const ProfilePage = () => <Table title="My Profile (via /auth/me)" endpoint="/auth/me" />;
