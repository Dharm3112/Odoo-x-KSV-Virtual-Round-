import { useToast } from '../hooks/useToasts.jsx';

const ICON_BY_KIND = {
  success: { name: 'check_circle', className: 'bg-secondary-container text-on-secondary-container' },
  error: { name: 'error', className: 'bg-error-container text-on-error-container' },
  info: { name: 'info', className: 'bg-primary-container text-on-primary-container' },
  warn: { name: 'warning', className: 'bg-tertiary-container text-on-tertiary-container' },
};

const Toaster = () => {
  const { toasts, dismiss } = useToast();
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-[380px] w-[calc(100vw-3rem)] pointer-events-none" role="status" aria-live="polite">
      {toasts.map((t) => {
        const icon = ICON_BY_KIND[t.kind] || ICON_BY_KIND.info;
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] border border-outline-variant/20 p-4 animate-fade-in-up"
          >
            <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${icon.className}`}>
              <span className="material-symbols-outlined text-[18px]">{icon.name}</span>
            </span>
            <div className="flex-1 min-w-0">
              {t.title && <p className="font-data-lg text-data-lg text-on-surface leading-snug">{t.title}</p>}
              {t.message && <p className="font-body-md text-sm text-on-surface-variant mt-0.5 break-words">{t.message}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="p-1 -m-1 text-on-surface-variant hover:text-primary rounded transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toaster;
