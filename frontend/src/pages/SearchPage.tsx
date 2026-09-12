import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface Student {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  class_id: number | null;
  section_id: number | null;
  status: string;
}

interface Teacher {
  id: number;
  teacher_code: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  designation: string | null;
  status: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INACTIVE: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[status] || colors.INACTIVE}`}>
      {status}
    </span>
  );
}

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ["search-students", q],
    queryFn: async () => (await api.get(`/students?q=${encodeURIComponent(q)}&limit=20`)).data as Student[],
    enabled: q.length > 0,
  });

  const { data: teachers, isLoading: loadingTeachers } = useQuery({
    queryKey: ["search-teachers", q],
    queryFn: async () => (await api.get(`/teachers?q=${encodeURIComponent(q)}&limit=20`)).data as Teacher[],
    enabled: q.length > 0,
  });

  const isLoading = loadingStudents || loadingTeachers;
  const studentResults = students || [];
  const teacherResults = teachers || [];
  const totalResults = studentResults.length + teacherResults.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Search Results</h1>
        {q && (
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? (
              "Searching..."
            ) : (
              <>Found <span className="font-semibold text-slate-700">{totalResults}</span> result{totalResults !== 1 ? "s" : ""} for "<span className="font-semibold text-slate-700">{q}</span>"</>
            )}
          </p>
        )}
      </div>

      {!q && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-slate-500">Type a name or ID in the search bar above to find students or teachers.</p>
        </div>
      )}

      {q && isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-slate-100 rounded" />
                  <div className="h-3 w-48 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {q && !isLoading && totalResults === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-900 font-semibold">No results found</p>
          <p className="text-sm text-slate-500 mt-1">Try searching with a different name or ID.</p>
        </div>
      )}

      {/* Students */}
      {studentResults.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Students ({studentResults.length})
          </h2>
          <div className="space-y-2">
            {studentResults.map((s) => (
              <Link
                key={s.id}
                to="/students"
                className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {s.first_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 group-hover:text-indigo-700 truncate">
                        {s.first_name} {s.last_name}
                      </p>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {s.student_code}
                      {s.email && <> · {s.email}</>}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 shrink-0 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Teachers */}
      {teacherResults.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Teachers ({teacherResults.length})
          </h2>
          <div className="space-y-2">
            {teacherResults.map((t) => (
              <Link
                key={t.id}
                to="/teachers"
                className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 hover:shadow-sm transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {t.first_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 group-hover:text-emerald-700 truncate">
                        {t.first_name} {t.last_name}
                      </p>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.teacher_code}
                      {t.department && <> · {t.department}</>}
                      {t.designation && <> · {t.designation}</>}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 shrink-0 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
