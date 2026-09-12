import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

interface UserProfile {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export function ProfilePage() {
  const { email, role } = useAuth();
  const [form, setForm] = useState({ email: email || "", currentPassword: "", newPassword: "", confirmPassword: "" });
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/auth/me")).data as UserProfile,
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { current_password: string; new_password: string }) => {
      return api.post("/auth/change-password", data);
    },
    onSuccess: () => {
      setMsg({ type: "success", text: "Password changed successfully!" });
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
      setTimeout(() => setMsg(null), 3000);
    },
    onError: () => {
      setMsg({ type: "error", text: "Failed to change password. Check your current password." });
      setTimeout(() => setMsg(null), 3000);
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (form.newPassword.length < 6) {
      setMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    changePasswordMutation.mutate({
      current_password: form.currentPassword,
      new_password: form.newPassword,
    });
  };

  const initials = email ? email.slice(0, 2).toUpperCase() : "??";
  const joinDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-600 to-indigo-500" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-black text-indigo-700">
              {initials}
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-slate-900">{email}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {role}
                </span>
                <span className="text-xs text-slate-400">Joined {joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Email Address</label>
            <p className="mt-1 text-sm text-slate-900 bg-slate-50 rounded-lg px-3 py-2">{email}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Role</label>
            <p className="mt-1 text-sm text-slate-900 bg-slate-50 rounded-lg px-3 py-2">{role}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Account Status</label>
            <p className="mt-1 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 font-medium">Active</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Member Since</label>
            <p className="mt-1 text-sm text-slate-900 bg-slate-50 rounded-lg px-3 py-2">{joinDate}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Change Password</h3>
        {msg && (
          <div className={`mb-4 text-sm px-4 py-2.5 rounded-lg border ${
            msg.type === "success"
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : "text-red-700 bg-red-50 border-red-200"
          }`}>
            {msg.text}
          </div>
        )}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Current Password</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500">New Password</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Confirm New Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition"
            >
              {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
