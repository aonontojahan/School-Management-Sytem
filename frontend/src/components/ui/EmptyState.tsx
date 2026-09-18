import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = "📋", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-4">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-900 mb-1">{title}</p>
      {description && <p className="text-xs text-slate-500 text-center max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
