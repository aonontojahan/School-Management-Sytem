import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

interface SettingSection {
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-indigo-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function SettingsPage() {
  const { role } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections: SettingSection[] = [
    {
      title: "Notifications",
      description: "Manage how you receive notifications",
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Push Notifications</p>
              <p className="text-xs text-slate-500">Receive push notifications in browser</p>
            </div>
            <Toggle enabled={notifications} onChange={() => setNotifications(!notifications)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Email Alerts</p>
              <p className="text-xs text-slate-500">Get email for important updates</p>
            </div>
            <Toggle enabled={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
          </div>
        </div>
      ),
    },
    {
      title: "Security",
      description: "Manage your account security",
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
              <p className="text-xs text-slate-500">Add extra security to your account</p>
            </div>
            <Toggle enabled={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
          </div>
          <div className="pt-2">
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Change Password →
            </button>
          </div>
        </div>
      ),
    },
    {
      title: "Appearance",
      description: "Customize your display settings",
      icon: (
        <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
        </svg>
      ),
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Dark Mode</p>
              <p className="text-xs text-slate-500">Switch to dark theme</p>
            </div>
            <Toggle enabled={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-900">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="en">English</option>
              <option value="bn">Bengali</option>
              <option value="hi">Hindi</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
        </div>
      ),
    },
  ];

  const adminSections: SettingSection[] = [
    {
      title: "School Settings",
      description: "Manage school-wide configuration",
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
        </svg>
      ),
      content: (
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition">
            <p className="text-sm font-medium text-slate-900">School Profile</p>
            <p className="text-xs text-slate-500">Name, address, contact details</p>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition">
            <p className="text-sm font-medium text-slate-900">Academic Year</p>
            <p className="text-xs text-slate-500">Set current academic year and terms</p>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition">
            <p className="text-sm font-medium text-slate-900">Grading System</p>
            <p className="text-xs text-slate-500">Configure grade bands and GPA</p>
          </button>
        </div>
      ),
    },
    {
      title: "User Management",
      description: "Manage admin and user accounts",
      icon: (
        <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      content: (
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition">
            <p className="text-sm font-medium text-slate-900">Admin Accounts</p>
            <p className="text-xs text-slate-500">Manage administrator access</p>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition">
            <p className="text-sm font-medium text-slate-900">Login History</p>
            <p className="text-xs text-slate-500">View recent login activity</p>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition">
            <p className="text-sm font-medium text-slate-900">Sessions</p>
            <p className="text-xs text-slate-500">Manage active sessions</p>
          </button>
        </div>
      ),
    },
    {
      title: "Data & Export",
      description: "Export and backup your data",
      icon: (
        <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
      ),
      content: (
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition">
            <p className="text-sm font-medium text-slate-900">Export Students (CSV)</p>
            <p className="text-xs text-slate-500">Download student data as CSV</p>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition">
            <p className="text-sm font-medium text-slate-900">Export Teachers (CSV)</p>
            <p className="text-xs text-slate-500">Download teacher data as CSV</p>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition">
            <p className="text-sm font-medium text-slate-900">Export Attendance Report</p>
            <p className="text-xs text-slate-500">Download attendance summary</p>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and system preferences</p>
      </div>

      {saved && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
          Settings saved successfully!
        </div>
      )}

      {/* General Settings */}
      {sections.map((section) => (
        <div key={section.title} className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              {section.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{section.title}</h3>
              <p className="text-xs text-slate-500">{section.description}</p>
            </div>
          </div>
          {section.content}
        </div>
      ))}

      {/* Admin Only Settings */}
      {role === "ADMIN" && adminSections.map((section) => (
        <div key={section.title} className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              {section.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{section.title}</h3>
              <p className="text-xs text-slate-500">{section.description}</p>
            </div>
          </div>
          {section.content}
        </div>
      ))}

      {/* Save Button */}
      <div className="flex justify-end pb-6">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-indigo-200 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
