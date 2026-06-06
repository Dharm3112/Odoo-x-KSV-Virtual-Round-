import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormatCurrency } from '../utils/format';

const SEED = [
  {
    id: 'n1',
    icon: 'fact_check',
    iconBg: 'bg-error-container text-on-error-container',
    title: 'PO-2023-4921 awaiting your approval',
    bodyParts: [
      { text: 'Aura Textiles • ' },
      { kind: 'currency', value: 14550 },
      { text: ' • Finance Director sign-off' },
    ],
    time: '2 min ago',
    unread: true,
    to: '/approvals',
  },
  {
    id: 'n2',
    icon: 'request_quote',
    iconBg: 'bg-secondary-container text-on-secondary-container',
    title: 'New quotation received',
    bodyParts: [{ text: 'GlobalTech Materials responded to RFQ-2024-892' }],
    time: '34 min ago',
    unread: true,
    to: '/quotations',
  },
  {
    id: 'n3',
    icon: 'verified',
    iconBg: 'bg-secondary-container text-on-secondary-container',
    title: 'Vendor compliance renewed',
    bodyParts: [{ text: 'Atelier Maison Noir annual audit passed' }],
    time: '2 hours ago',
    unread: true,
    to: '/vendors',
  },
  {
    id: 'n4',
    icon: 'receipt_long',
    iconBg: 'bg-tertiary-container text-on-tertiary-container',
    title: 'Invoice INV-9921 processed',
    bodyParts: [
      { text: 'Atlas Logistics • ' },
      { kind: 'currency', value: 42500 },
      { text: ' settled via ACH' },
    ],
    time: 'Yesterday, 16:30',
    unread: false,
    to: '/activity-logs',
  },
  {
    id: 'n5',
    icon: 'memory',
    iconBg: 'bg-surface-container-high text-on-surface-variant',
    title: 'System audit completed',
    bodyParts: [{ text: 'Automated integrity check — 0 anomalies detected' }],
    time: 'Yesterday, 02:00',
    unread: false,
    to: '/activity-logs',
  },
];

const NotificationsDropdown = ({ open, onClose }) => {
  const fmt = useFormatCurrency();
  const [items, setItems] = useState(SEED);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  const unread = items.filter((i) => i.unread).length;

  const markAll = () => setItems((arr) => arr.map((i) => ({ ...i, unread: false })));
  const markOne = (id) => setItems((arr) => arr.map((i) => (i.id === id ? { ...i, unread: false } : i)));
  const clearAll = () => setItems([]);

  const renderBody = (parts) => parts.map((p, idx) => p.kind === 'currency' ? (
    <span key={idx} className="font-medium text-on-surface">{fmt(p.value)}</span>
  ) : (
    <span key={idx}>{p.text}</span>
  ));

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-[380px] max-w-[calc(100vw-2rem)] bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] border border-outline-variant/20 z-50 overflow-hidden"
      role="dialog"
      aria-label="Notifications"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">Notifications</span>
          {unread > 0 && (
            <span className="bg-error text-on-error font-mono-data text-[10px] px-1.5 py-0.5 rounded-full">{unread} new</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={markAll} disabled={unread === 0} className="font-mono-data text-mono-data text-on-surface-variant hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1">
            Mark all read
          </button>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center">
            <span className="material-symbols-outlined text-on-surface-variant text-[36px]">notifications_off</span>
            <p className="font-body-md text-body-md text-on-surface">You're all caught up</p>
            <p className="font-mono-data text-mono-data text-on-surface-variant">No notifications right now.</p>
          </div>
        ) : (
          <ul className="divide-y divide-outline-variant/15">
            {items.map((n) => (
              <li key={n.id} className={`group ${n.unread ? 'bg-primary-container/5' : ''}`}>
                <Link
                  to={n.to}
                  onClick={() => { markOne(n.id); onClose(); }}
                  className="flex items-start gap-3 p-4 hover:bg-surface-bright transition-colors"
                >
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.iconBg}`}>
                    <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-data-lg text-data-lg leading-snug ${n.unread ? 'text-on-surface' : 'text-on-surface-variant'}`}>{n.title}</p>
                      {n.unread && <span className="w-2 h-2 rounded-full bg-error mt-2 shrink-0" />}
                    </div>
                    <p className="font-body-md text-sm text-on-surface-variant mt-0.5 line-clamp-2">{renderBody(n.bodyParts)}</p>
                    <p className="font-mono-data text-mono-data text-on-surface-variant mt-1">{n.time}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20 bg-surface-bright/50">
        <button onClick={clearAll} disabled={items.length === 0} className="font-mono-data text-mono-data text-on-surface-variant hover:text-error disabled:opacity-40 disabled:cursor-not-allowed">
          Clear all
        </button>
        <Link to="/activity-logs" onClick={onClose} className="font-label-caps text-label-caps text-primary hover:text-on-surface transition-colors">
          View activity log
        </Link>
      </div>
    </div>
  );
};

export default NotificationsDropdown;
