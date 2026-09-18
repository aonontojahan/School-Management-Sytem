import { useState, useEffect } from "react";

interface AdmissionSubmission {
  id: string;
  studentName: string;
  dateOfBirth: string;
  gender: string;
  appliedClass: string;
  previousSchool: string;
  previousClass: string;
  previousPercentage: string;
  fatherName: string;
  fatherPhone: string;
  fatherOccupation: string;
  motherName: string;
  motherPhone: string;
  guardianNid: string;
  address: string;
  city: string;
  bloodGroup: string;
  medicalConditions: string;
  transportRequired: string;
  howDidYouHear: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function AdminAdmissionsPage() {
  const [submissions, setSubmissions] = useState<AdmissionSubmission[]>([]);
  const [selected, setSelected] = useState<AdmissionSubmission | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("admission_submissions") || "[]");
    setSubmissions(data);
  }, []);

  const updateStatus = (id: string, status: "approved" | "rejected") => {
    const updated = submissions.map((s) => s.id === id ? { ...s, status } : s);
    setSubmissions(updated);
    localStorage.setItem("admission_submissions", JSON.stringify(updated));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const deleteSubmission = (id: string) => {
    const updated = submissions.filter((s) => s.id !== id);
    setSubmissions(updated);
    localStorage.setItem("admission_submissions", JSON.stringify(updated));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = filter === "all" ? submissions : submissions.filter((s) => s.status === filter);
  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admission Applications</h1>
          <p className="text-sm text-slate-400 mt-1">Review and manage student admission submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{submissions.length} total applications</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { key: "all" as const, label: "Total", count: counts.all, color: "text-white" },
          { key: "pending" as const, label: "Pending", count: counts.pending, color: "text-amber-400" },
          { key: "approved" as const, label: "Approved", count: counts.approved, color: "text-emerald-400" },
          { key: "rejected" as const, label: "Rejected", count: counts.rejected, color: "text-red-400" },
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setFilter(stat.key)}
            className={`p-4 rounded-xl border text-left transition-all ${
              filter === stat.key
                ? "bg-white/10 border-white/20"
                : "bg-white/5 border-white/10 hover:bg-white/[0.07]"
            }`}
          >
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.count}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-slate-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-sm text-slate-500">No applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Parent</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{sub.studentName}</p>
                      <p className="text-xs text-slate-500">{sub.gender} • {sub.city || "N/A"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                        Class {sub.appliedClass}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{sub.fatherName}</td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-xs">{sub.fatherPhone}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[sub.status]}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(sub)} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-400 hover:text-white transition-all">
                          View
                        </button>
                        {sub.status === "pending" && (
                          <>
                            <button onClick={() => updateStatus(sub.id, "approved")} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-medium text-emerald-400 transition-all">
                              Approve
                            </button>
                            <button onClick={() => updateStatus(sub.id, "rejected")} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-all">
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 px-8 py-5 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-bold text-white">{selected.studentName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Application {selected.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {selected.status === "pending" && (
                  <>
                    <button onClick={() => updateStatus(selected.id, "approved")} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all">
                      Approve
                    </button>
                    <button onClick={() => updateStatus(selected.id, "rejected")} className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-all">
                      Reject
                    </button>
                  </>
                )}
                <button onClick={() => deleteSubmission(selected.id)} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all">
                  Delete
                </button>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-8 py-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-6">
              {/* Student Info */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Student Information</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Full Name", value: selected.studentName },
                    { label: "Date of Birth", value: selected.dateOfBirth },
                    { label: "Gender", value: selected.gender },
                    { label: "Class Applied", value: `Class ${selected.appliedClass}` },
                    { label: "Blood Group", value: selected.bloodGroup || "N/A" },
                    { label: "Medical Conditions", value: selected.medicalConditions || "None" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm font-medium text-white mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous School */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Previous School</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "School Name", value: selected.previousSchool || "N/A" },
                    { label: "Last Class", value: selected.previousClass || "N/A" },
                    { label: "Percentage", value: selected.previousPercentage || "N/A" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm font-medium text-white mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parent Info */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Parent / Guardian</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Father Name", value: selected.fatherName },
                    { label: "Father Phone", value: selected.fatherPhone },
                    { label: "Occupation", value: selected.fatherOccupation || "N/A" },
                    { label: "Mother Name", value: selected.motherName || "N/A" },
                    { label: "Mother Phone", value: selected.motherPhone || "N/A" },
                    { label: "NID Number", value: selected.guardianNid || "N/A" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm font-medium text-white mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Address & Other</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Address", value: selected.address },
                    { label: "City", value: selected.city },
                    { label: "Transport", value: selected.transportRequired || "N/A" },
                    { label: "Heard Via", value: selected.howDidYouHear || "N/A" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm font-medium text-white mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <p className="text-xs text-slate-500">Submitted: {new Date(selected.submittedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
