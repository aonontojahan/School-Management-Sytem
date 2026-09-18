interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = "", lines }: SkeletonProps) {
  if (lines) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${80 - (i % 3) * 10}%` }} />
        ))}
      </div>
    );
  }
  return <div className={`bg-slate-100 rounded-lg animate-pulse ${className}`} />;
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-10 bg-slate-100 rounded-lg animate-pulse flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-32 bg-slate-50 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}
