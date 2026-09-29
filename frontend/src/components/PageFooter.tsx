import { Link } from "react-router-dom";

const EXPLORE = [
  { label: "About Us", to: "/about" },
  { label: "Academics", to: "/academics" },
  { label: "Admission", to: "/admission" },
  { label: "Facilities", to: "/facilities" },
];

const RESOURCES = [
  { label: "Notices", to: "/notices" },
  { label: "Contact", to: "/contact" },
  { label: "Portal Login", to: "/login" },
  { label: "Home", to: "/" },
];

/** Light official footer shared by the inner pages (About, Academics, Admission, Facilities, Notices, Contact). */
export function PageFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-blue-950 text-white">
      <div className="w-full px-6 sm:px-10 lg:px-14 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.52 4.67a1 1 0 00.95.69h4.91c.97 0 1.37 1.24.59 1.81l-3.98 2.89a1 1 0 00-.36 1.12l1.52 4.67c.3.92-.76 1.69-1.54 1.12l-3.97-2.89a1 1 0 00-1.18 0l-3.97 2.89c-.78.57-1.84-.2-1.54-1.12l1.52-4.67a1 1 0 00-.36-1.12L.71 9.09c-.78-.57-.38-1.81.59-1.81h4.91a1 1 0 00.95-.69l1.89-4.66z" />
              </svg>
            </div>
            <span className="leading-tight">
              <span className="block font-extrabold text-white">Little Star School</span>
              <span className="block text-[11px] text-white/50">Bhendabari, Pirgonj, Rangpur</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-sm">
            Official website of Little Star School — a fully automated school management system
            for students, teachers and admin, from Play to Class 10.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Explore</h4>
          <ul className="space-y-2.5">
            {EXPLORE.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-sm text-white/60 hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Resources</h4>
          <ul className="space-y-2.5">
            {RESOURCES.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-sm text-white/60 hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="w-full px-6 sm:px-10 lg:px-14 py-5 text-center sm:text-left">
          <p className="text-xs text-white/50">&copy; {currentYear} Little Star School, Bhendabari, Pirgonj, Rangpur. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
