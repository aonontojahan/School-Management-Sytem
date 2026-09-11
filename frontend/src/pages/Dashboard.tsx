import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function Dashboard() {
  const { data } = useQuery({ queryKey: ["summary"], queryFn: async () => (await api.get("/dashboard/summary")).data });
  const cards: [string, number][] = data
    ? [
        ["Students", data.students], ["Teachers", data.teachers], ["Guardians", data.guardians],
        ["Classes", data.classes], ["Exams", data.exams], ["Invoices", data.invoices],
      ]
    : [];
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        {cards.map(([k, v]) => (
          <div key={k} className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">{k}</div>
            <div className="text-2xl font-bold">{v}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-600">Backend: {import.meta.env.VITE_API_URL}</p>
    </div>
  );
}
