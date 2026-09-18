import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-slate-300">/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-indigo-600 transition font-medium">{item.label}</Link>
          ) : (
            <span className="text-slate-700 font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
