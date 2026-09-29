import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Academics", to: "/academics" },
  { label: "Admission", to: "/admission" },
  { label: "Facilities", to: "/facilities" },
  { label: "Notices", to: "/notices" },
  { label: "Contact", to: "/contact" },
];

function StarLogo() {
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shrink-0">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.52 4.67a1 1 0 00.95.69h4.91c.97 0 1.37 1.24.59 1.81l-3.98 2.89a1 1 0 00-.36 1.12l1.52 4.67c.3.92-.76 1.69-1.54 1.12l-3.97-2.89a1 1 0 00-1.18 0l-3.97 2.89c-.78.57-1.84-.2-1.54-1.12l1.52-4.67a1 1 0 00-.36-1.12L.71 9.09c-.78-.57-.38-1.81.59-1.81h4.91a1 1 0 00.95-.69l1.89-4.66z" />
      </svg>
    </div>
  );
}

/**
 * Shared public-site navbar: Home, About, Academics, Admission,
 * Facilities, Notices, Contact + Portal Login. Transparent over the
 * landing hero, solid white everywhere else.
 */
export function SiteNavbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const transparent = location.pathname === "/" && !scrolled;

  const linkCls = (active: boolean) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
      transparent
        ? active
          ? "text-white bg-white/15"
          : "text-white/80 hover:text-white hover:bg-white/10"
        : active
          ? "text-blue-900 bg-amber-100"
          : "text-slate-600 hover:text-blue-900 hover:bg-amber-50"
    }`;

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-slate-950/80 backdrop-blur-md border-b border-white/10"
          : "bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100"
      }`}
    >
      <div className="w-full px-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <StarLogo />
            <span className="leading-tight">
              <span className={`block font-extrabold text-[15px] ${transparent ? "text-white" : "text-blue-950"}`}>
                Little Star School
              </span>
              <span className={`hidden sm:block text-[10px] font-medium ${transparent ? "text-white/60" : "text-slate-500"}`}>
                Bhendabari, Pirgonj, Rangpur
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link key={item.to} to={item.to} className={linkCls(location.pathname === item.to)}>
                  {item.label}
                </Link>
              ))}
            </div>

            <div className={`hidden lg:block w-px h-6 mx-2 ${transparent ? "bg-white/20" : "bg-slate-200"}`} />

            <Link
              to="/login"
              className={`hidden lg:inline-flex px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 ${
                transparent
                  ? "bg-white text-slate-900 hover:bg-white/90 shadow-lg shadow-black/20"
                  : "bg-amber-400 hover:bg-amber-500 text-blue-950 shadow-sm shadow-amber-200"
              }`}
            >
              Portal Login
            </Link>

            <button
              aria-label="Toggle menu"
              className={`lg:hidden p-2 rounded-lg transition ${transparent ? "hover:bg-white/10" : "hover:bg-slate-100"}`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <svg className={`w-5 h-5 ${transparent ? "text-white" : "text-slate-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className={`w-5 h-5 ${transparent ? "text-white" : "text-slate-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-lg">
          <div className="px-6 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  location.pathname === item.to ? "text-blue-900 bg-amber-100" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-slate-100">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-4 py-2.5 rounded-xl text-sm font-bold text-blue-950 bg-amber-400 hover:bg-amber-500 transition"
              >
                Portal Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
