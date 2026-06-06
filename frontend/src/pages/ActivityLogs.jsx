import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToasts.jsx';
import { exportCSV } from '../utils/export';
import { useFormatCurrency, useFormatDate, formatDateTime } from '../utils/format';

const SEED = [
  {
    id: 'a1',
    ts: Date.now() - 60 * 60 * 1000,
    category: 'approval',
    badge: 'Approval Required',
    badgeClass: 'text-error bg-error-container/30',
    dotClass: 'bg-error',
    title: "RFQ #10492 Exceeds Threshold",
    body: "Vendor 'Lumina Textiles' submitted a quotation that is 14% above the pre-approved budget limit for Q3 synthetics.",
    amount: null,
    assignee: 'Sarah Jenkins',
    assigneeInitials: 'SJ',
    to: '/approvals',
  },
  {
    id: 'a2',
    ts: Date.now() - 2 * 60 * 60 * 1000,
    category: 'invoice',
    badge: 'Invoice Processed',
    badgeClass: 'text-surface-tint',
    dotClass: 'bg-surface-tint',
    title: 'Payment Cleared: Global Logistics Inc.',
    body: 'Invoice INV-2023-884 for October freight forwarding services has been automatically processed and settled via ACH.',
    amount: 42500,
    amountLabel: 'settled',
    to: '/activity-logs',
  },
  {
    id: 'a3',
    ts: Date.now() - 24 * 60 * 60 * 1000 - 60 * 60 * 1000,
    category: 'rfq',
    badge: 'RFQ Update',
    badgeClass: 'text-on-surface-variant',
    dotClass: 'bg-outline-variant',
    title: 'New Bid Submitted',
    body: 'Nexus Materials has submitted a preliminary bid for RFQ #10495 (Raw Aluminum). The bid is currently under automated compliance review.',
    amount: null,
    to: '/quotations',
  },
  {
    id: 'a4',
    ts: Date.now() - 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000,
    category: 'system',
    badge: 'System Audit',
    badgeClass: 'text-on-surface-variant',
    dotClass: 'bg-outline-variant',
    title: 'Automated integrity check completed',
    body: 'Database backup and integrity check completed successfully. 0 anomalies detected.',
    amount: null,
    muted: true,
    to: '/activity-logs',
  },
];

const OLDER = [
  {
    id: 'a5',
    ts: Date.now() - 2 * 24 * 60 * 60 * 1000,
    category: 'rfq',
    badge: 'RFQ Update',
    badgeClass: 'text-on-surface-variant',
    dotClass: 'bg-outline-variant',
    title: 'Vendor Bid Withdrawn',
    body: 'Meridian Logistics withdrew their bid for RFQ #10481 citing capacity constraints.',
    amount: null,
    to: '/quotations',
  },
  {
    id: 'a6',
    ts: Date.now() - 3 * 24 * 60 * 60 * 1000,
    category: 'approval',
    badge: 'Approval Required',
    badgeClass: 'text-error bg-error-container/30',
    dotClass: 'bg-error',
    title: 'PO #10477 Awaiting Finance Sign-off',
    body: 'Marquise Editions • Editorial prints Q4 — pending Finance Director approval.',
    amount: 28900,
    amountLabel: 'PO value',
    assignee: 'Elena Russo',
    assigneeInitials: 'ER',
    to: '/approvals',
  },
  {
    id: 'a7',
    ts: Date.now() - 4 * 24 * 60 * 60 * 1000,
    category: 'invoice',
    badge: 'Invoice Processed',
    badgeClass: 'text-surface-tint',
    dotClass: 'bg-surface-tint',
    title: 'Invoice INV-2023-879 Settled',
    body: 'GlobalTech Materials • Q3 hardware procurement batch settled via wire transfer.',
    amount: 96400,
    amountLabel: 'settled',
    to: '/activity-logs',
  },
];

const TABS = [
  { id: 'all', label: 'All Events' },
  { id: 'approval', label: 'Approval Required' },
  { id: 'rfq', label: 'RFQ Updates' },
  { id: 'invoice', label: 'Invoice Processed' },
  { id: 'system', label: 'System Audit' },
];

const formatTime = (ts) => {
  const d = new Date(ts);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const formatRelativeDay = (ts) => {
  const d = new Date(ts);
  const today = new Date();
  const isSameDay = d.toDateString() === today.toDateString();
  if (isSameDay) return 'Today';
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
};

const ActivityLogs = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const fmtCurrency = useFormatCurrency();
  const fmtDate = useFormatDate();

  const [activeTab, setActiveTab] = useState('all');
  const [range, setRange] = useState('7d');
  const [items, setItems] = useState(SEED);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const counts = useMemo(() => {
    const c = { all: items.length, approval: 0, rfq: 0, invoice: 0, system: 0 };
    items.forEach((i) => { c[i.category] = (c[i.category] || 0) + 1; });
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    let list = activeTab === 'all' ? items : items.filter((i) => i.category === activeTab);
    if (range !== 'all') {
      const days = range === '7d' ? 7 : 30;
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      list = list.filter((i) => i.ts >= cutoff);
    }
    return list;
  }, [items, activeTab, range]);

  const onExport = () => {
    const rows = filtered.map((i) => ({
      time: formatDateTime(new Date(i.ts)),
      category: i.category,
      title: i.title,
      body: i.body,
      amount: i.amount != null ? fmtCurrency(i.amount) : '',
    }));
    exportCSV(rows, [
      { key: 'time', label: 'Time' },
      { key: 'category', label: 'Category' },
      { key: 'title', label: 'Title' },
      { key: 'body', label: 'Description' },
      { key: 'amount', label: 'Amount' },
    ], `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`Exported ${rows.length} events to CSV.`);
  };

  const onReview = (item) => {
    if (item.to) {
      navigate(item.to);
      toast.info(`Opening ${item.title}`);
    }
  };

  const onLoadOlder = () => {
    setItems((arr) => [...OLDER, ...arr]);
    toast.success(`Loaded ${OLDER.length} older events.`);
  };

  const toggleMenu = (id) => setOpenMenuId((cur) => (cur === id ? null : id));
  const markUnread = (id) => {
    toast.info('Marked as unread (demo).');
    setOpenMenuId(null);
  };
  const copyId = (id) => {
    try {
      navigator.clipboard?.writeText(id);
      toast.success('Event ID copied to clipboard.');
    } catch {
      toast.error('Could not access clipboard.');
    }
    setOpenMenuId(null);
  };

  return (
    <div className="container-page">
      <div className="mb-16">
        <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4 tracking-tight">System Activity</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">A comprehensive, real-time audit log of all logistical events, approvals, and system changes across VendorBridge Master.</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-16 border-b border-outline-variant pb-1">
        {TABS.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`font-data-lg text-data-lg pb-3 px-1 -mb-[1.5px] transition-colors ${isActive ? 'text-primary border-b-[1.5px] border-primary' : 'text-on-surface-variant hover:text-primary border-b-[1.5px] border-transparent'}`}
              aria-pressed={isActive}
            >
              {t.label}
              {t.id === 'approval' && counts.approval > 0 && (
                <span className="ml-2 bg-error-container text-on-error-container text-[11px] px-2 py-0.5 rounded-full relative -top-2">{counts.approval}</span>
              )}
            </button>
          );
        })}

        <div className="flex-1 min-w-[20px]"></div>

        <div className="flex items-center gap-3 mb-3" ref={menuRef}>
          <button
            onClick={() => setRange((r) => (r === '7d' ? 'all' : '7d'))}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-mono-data text-mono-data border border-outline-variant px-4 py-1.5 rounded-full"
            aria-pressed={range === '7d'}
          >
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            {range === '7d' ? 'Last 7 Days' : 'All Time'}
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-mono-data text-mono-data border border-outline-variant px-4 py-1.5 rounded-full"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      <div className="relative max-w-[900px]">
        <div className="absolute left-[100px] top-4 bottom-12 w-px bg-surface-variant hidden md:block"></div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-on-surface-variant text-[36px]">inbox</span>
            <p className="font-body-md text-body-md text-on-surface-variant mt-3">No events match the current filter.</p>
          </div>
        )}

        {filtered.map((i, idx) => (
          <div key={i.id} className={`relative flex flex-col md:flex-row items-start mb-16 group stagger-${Math.min(idx + 1, 7)}`}>
            <div className="md:w-[100px] md:text-right md:pr-8 pt-1 mb-4 md:mb-0 shrink-0">
              <div className={`font-mono-data text-mono-data ${i.category === 'approval' ? 'text-primary' : 'text-on-surface-variant'}`}>{formatTime(i.ts)}</div>
              <div className="font-mono-data text-[11px] text-on-surface-variant mt-1">{formatRelativeDay(i.ts)}</div>
            </div>
            <div className={`hidden md:block absolute left-[96px] top-[10px] w-2 h-2 rounded-full ${i.dotClass} ring-4 ring-background z-10 transition-transform group-hover:scale-125`}></div>

            <div className={`flex-1 ${i.muted ? 'py-4' : 'p-8'} ${i.muted ? 'flex items-start gap-4 opacity-70' : ''} ${i.muted ? '' : (i.category === 'approval' ? 'bg-surface-container-lowest shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] rounded-sm border border-transparent hover:border-outline-variant/30' : 'bg-surface-bright border border-outline-variant/20') + ' rounded-sm transition-all duration-300'}`}>
              {i.muted ? (
                <>
                  <span className="material-symbols-outlined text-outline-variant">memory</span>
                  <div className="relative">
                    <span className="font-label-caps text-label-caps text-on-surface-variant block mb-1">{i.badge}</span>
                    <span className="font-mono-data text-mono-data text-on-surface-variant">{i.body}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`font-label-caps text-label-caps tracking-wider ${i.badgeClass} ${i.category === 'approval' ? 'px-3 py-1 rounded-sm' : ''}`}>{i.badge}</span>
                    <div className="relative">
                      <button
                        onClick={() => toggleMenu(i.id)}
                        className="p-1 -m-1 text-outline-variant hover:text-primary rounded transition-colors"
                        aria-label="More actions"
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === i.id}
                      >
                        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                      </button>
                      {openMenuId === i.id && (
                        <div role="menu" className="absolute right-0 top-8 w-44 bg-surface-container-lowest rounded-lg shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] border border-outline-variant/20 z-30 py-1">
                          <button onClick={() => { onReview(i); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright transition-colors text-left">
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">open_in_new</span>
                            <span className="font-body-md text-sm text-on-surface">View details</span>
                          </button>
                          <button onClick={() => markUnread(i.id)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright transition-colors text-left">
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">mark_email_unread</span>
                            <span className="font-body-md text-sm text-on-surface">Mark unread</span>
                          </button>
                          <button onClick={() => copyId(i.id)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright transition-colors text-left">
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">content_copy</span>
                            <span className="font-body-md text-sm text-on-surface">Copy event ID</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className={`font-headline-sm ${i.category === 'approval' ? 'text-headline-sm' : 'text-[20px]'} text-primary mb-2`}>{i.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">{i.body}</p>

                  {i.amount != null && (
                    <div className="inline-flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-sm border border-outline-variant/30">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">receipt_long</span>
                      <span className="font-mono-data text-mono-data text-primary font-medium">{fmtCurrency(i.amount)} {i.amountLabel && <span className="text-on-surface-variant ml-1">{i.amountLabel}</span>}</span>
                    </div>
                  )}

                  {i.assignee && (
                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-outline-variant/30">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary font-mono-data text-[10px]">{i.assigneeInitials}</div>
                      <span className="font-mono-data text-mono-data text-on-surface-variant flex-1">Assigned to: {i.assignee}</span>
                      <button
                        onClick={() => onReview(i)}
                        className="bg-primary-container text-on-primary font-mono-data text-mono-data px-6 py-2 rounded-sm hover:bg-primary hover:text-on-primary transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length === SEED.length && (
        <div className="mt-16 max-w-[900px] flex justify-center md:pl-[100px]">
          <button onClick={onLoadOlder} className="font-mono-data text-mono-data text-on-surface-variant hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1">
            Load Older Events
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
