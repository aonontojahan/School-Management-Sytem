import { useEffect, useRef } from "react";

interface Photo {
  src: string;
  caption: string;
}

interface FeatureModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  hero: string;
  photos: readonly Photo[];
  details: string[];
  stat: string;
  statLabel: string;
}

export function FeatureModal({
  open,
  onClose,
  title,
  description,
  hero,
  photos,
  details,
  stat,
  statLabel,
}: FeatureModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="backdrop:bg-black/60 rounded-3xl border border-slate-200 shadow-2xl p-0 w-[80vw] max-w-6xl max-h-[80vh] mx-auto my-auto overflow-hidden"
    >
      {open && (
        <div className="flex flex-col h-full max-h-[80vh]">
          {/* ── Top Hero Banner ─────────────────────────── */}
          <div className="relative h-52 sm:h-64 shrink-0 overflow-hidden bg-slate-200">
            <img
              src={hero}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Title overlay */}
            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg">{title}</h2>
                <p className="text-sm text-white/80 mt-1 max-w-xl">{description}</p>
              </div>
              <span className="hidden sm:inline-flex px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white text-sm font-bold shrink-0 ml-4">
                {stat} {statLabel}
              </span>
            </div>
          </div>

          {/* ── Scrollable Content ──────────────────────── */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {/* Photo Gallery Grid */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Gallery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photos.map((photo, i) => (
                  <div key={i} className="group rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-lg transition-shadow">
                    <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-200">
                      <img
                        src={photo.src}
                        alt={photo.caption}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-slate-600 leading-relaxed">{photo.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Highlights */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Key Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {details.map((d) => (
                  <div
                    key={d}
                    className="flex items-start gap-2.5 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
                  >
                    <svg
                      className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-700">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
