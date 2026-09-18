import { useNavigate } from "react-router-dom";

export function BackButton({ to, label }: { to?: string; label?: string }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => to ? nav(to) : nav(-1)}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition mb-4"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {label || "Back"}
    </button>
  );
}
