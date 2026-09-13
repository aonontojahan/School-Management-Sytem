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

interface ProfileData {
  profile: StudentProfile;
  class: { id: number; name: string; code: string } | null;
  section: { id: number; name: string } | null;
  subjects: { id: number; name: string; code: string }[];
}

export function StudentProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: async () => (await api.get("/dashboard/student")).data as ProfileData,
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-6 h-40 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, class: cls, section, subjects } = data;

  const infoSections = [
    {
      title: "Personal Information",
      color: "from-blue-500 to-indigo-500",
      items: [
        { label: "Full Name", value: `${profile.first_name} ${profile.last_name}` },
        { label: "Student Code", value: profile.student_code },
        { label: "Roll Number", value: profile.roll_number ? `#${profile.roll_number}` : "—" },
        { label: "Gender", value: profile.gender || "—" },
        { label: "Date of Birth", value: profile.date_of_birth || "—" },
        { label: "Status", value: profile.status },
      ],
    },
    {
      title: "Contact Information",
      color: "from-emerald-500 to-teal-500",
      items: [
        { label: "Email", value: profile.email || "—" },
        { label: "Phone", value: profile.phone || "—" },
        { label: "Address", value: profile.address || "—" },
      ],
    },
    {
      title: "Guardian Information",
      color: "from-amber-500 to-orange-500",
      items: [
        { label: "Guardian Name", value: profile.guardian_name || "—" },
        { label: "Guardian Phone", value: profile.guardian_phone || "—" },
      ],
    },
    {
      title: "Academic Information",
      color: "from-purple-500 to-pink-500",
      items: [
        { label: "Class", value: cls?.name || "—" },
        { label: "Section", value: section?.name || "—" },
        { label: "Group", value: profile.group?.replace("_", " ") || "—" },
        { label: "Division", value: profile.division || "—" },
        { label: "Admission Date", value: profile.admission_date || "—" },
        { label: "Total Subjects", value: subjects.length },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-5 -bottom-5 w-28 h-28 bg-white/10 rounded-full blur-xl" />
        <div className="relative flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-extrabold shrink-0">
            {profile.first_name[0]}{profile.last_name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{profile.first_name} {profile.last_name}</h1>
            <p className="text-blue-100 mt-1 text-sm">
              {cls?.name || "No class"}{section ? ` — Section ${section.name}` : ""}
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                Code: {profile.student_code}
              </span>
              {profile.roll_number && (
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                  Roll #{profile.roll_number}
                </span>
              )}
              {profile.group && (
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                  {profile.group.replace("_", " ")}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                profile.status === "ACTIVE" ? "bg-emerald-500/80 text-white" : "bg-rose-500/80 text-white"
              }`}>
                {profile.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {infoSections.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className={`bg-gradient-to-r ${section.color} px-5 py-3`}>
              <h3 className="text-sm font-bold text-white">{section.title}</h3>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-900 text-right max-w-[60%] truncate">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subjects */}
      {subjects.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">My Subjects ({subjects.length})</h3>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <span
                key={s.id}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-sm font-semibold border border-indigo-100"
              >
                {s.name}
                <span className="ml-1.5 text-xs text-indigo-400 font-normal">{s.code}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
