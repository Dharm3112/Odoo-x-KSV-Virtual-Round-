import React from 'react';
import { Link } from 'react-router-dom';
import { useFormatCurrency, useFormatCurrencyCompact } from '../utils/format';

const STAT_CARDS = [
  { label: 'Pending Approvals', value: '12', to: '/approvals', delay: 'delay-100' },
  { label: 'Active RFQs', value: '8', to: '/rfqs', delay: 'delay-200', offset: true },
  { label: 'Recent POs', value: '45', to: '/purchase-orders', delay: 'delay-300' },
  { label: 'Recent Invoices', value: '128', to: '/activity-logs?tab=invoice', delay: 'delay-400', offset: true },
];

const ANALYTICS = [
  {
    label: 'Cost Savings YTD',
    value: 845000,
    kind: 'currencyCompact',
    delta: '+12.5%',
    deltaPositive: true,
    sub: 'vs. last quarter',
    icon: 'savings',
    tone: 'secondary',
  },
  {
    label: 'Avg. Approval Time',
    value: '1.8 d',
    kind: 'text',
    delta: '−0.4 d',
    deltaPositive: true,
    sub: 'last 30 days',
    icon: 'bolt',
    tone: 'primary',
  },
  {
    label: 'On-time Delivery',
    value: '94%',
    kind: 'text',
    delta: '+2.1%',
    deltaPositive: true,
    sub: 'this quarter',
    icon: 'schedule',
    tone: 'tertiary',
  },
  {
    label: 'Vendor Compliance',
    value: '98%',
    kind: 'text',
    delta: 'Stable',
    deltaPositive: true,
    sub: 'audits passed',
    icon: 'verified_user',
    tone: 'secondary',
  },
];

const QUICK_ACTIONS = [
  { label: 'New Request', sub: 'Initiate RFQ', to: '/rfqs', icon: 'add_circle', tone: 'primary' },
  { label: 'Add Vendor', sub: 'Onboard supplier', to: '/vendors?add=1', icon: 'add_business', tone: 'secondary' },
  { label: 'Create PO', sub: 'Issue purchase order', to: '/purchase-orders', icon: 'shopping_cart', tone: 'tertiary' },
  { label: 'Review Approvals', sub: '12 pending', to: '/approvals', icon: 'fact_check', tone: 'secondary' },
  { label: 'Generate Report', sub: 'Q3 performance', to: '/reports', icon: 'picture_as_pdf', tone: 'primary' },
  { label: 'View Activity', sub: 'Audit log', to: '/activity-logs', icon: 'history', tone: 'tertiary' },
];

const TONE_DISC = {
  primary: 'bg-primary text-on-primary',
  secondary: 'bg-secondary text-on-secondary',
  tertiary: 'bg-tertiary text-on-tertiary',
};

const TONE_BORDER = {
  primary: 'hover:border-primary/40 hover:shadow-[0_20px_40px_-20px_rgba(var(--primary-rgb),0.35)]',
  secondary: 'hover:border-secondary/40',
  tertiary: 'hover:border-tertiary/40',
};

const Dashboard = () => {
  const fmt = useFormatCurrency();
  const fmtCompact = useFormatCurrencyCompact();

  const renderValue = (item) => {
    if (item.kind === 'currencyCompact') return fmtCompact(item.value);
    if (item.kind === 'currency') return fmt(item.value);
    return item.value;
  };

  return (
    <div className="container-page">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-element-gap mb-20">
        {STAT_CARDS.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className={`flex flex-col gap-4 group cursor-pointer animate-fade-in-up ${c.delay} ${c.offset ? 'md:mt-8' : ''} rounded-sm -mx-2 px-2 py-1 transition-colors hover:bg-surface-bright/50`}
            aria-label={`View ${c.label}`}
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-primary tracking-tighter group-hover:text-tertiary-container transition-colors">{c.value}</span>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary group-hover:translate-x-1 transition-all text-[20px]">arrow_forward</span>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30 pb-2 inline-block w-3/4 group-hover:border-primary group-hover:text-primary transition-colors">{c.label}</span>
          </Link>
        ))}
      </div>

      <section className="mb-20 animate-fade-in-up delay-300">
        <div className="flex items-end justify-between mb-8 border-b border-outline-variant pb-4">
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-widest">Quick actions</p>
            <h2 className="font-headline-sm text-headline-sm text-primary">Common tasks</h2>
          </div>
          <span className="font-mono-data text-mono-data text-on-surface-variant hidden md:block">6 shortcuts</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {QUICK_ACTIONS.map((a, idx) => (
            <Link
              key={a.label}
              to={a.to}
              className={`group bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 flex flex-col gap-5 transition-all duration-300 ${TONE_BORDER[a.tone]} hover:-translate-y-1`}
              style={{ animationDelay: `${100 + idx * 60}ms` }}
              aria-label={a.label}
            >
              <div className="flex justify-between items-start">
                <span className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 ${TONE_DISC[a.tone]}`}>
                  <span className="material-symbols-outlined fill" style={{ fontSize: '28px', lineHeight: 1 }}>{a.icon}</span>
                </span>
                <span className="material-symbols-outlined text-outline-variant text-[18px] group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_outward</span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-data-lg text-data-lg text-primary leading-tight group-hover:text-tertiary-container transition-colors">{a.label}</span>
                <span className="font-mono-data text-mono-data text-on-surface-variant truncate">{a.sub}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-20 animate-fade-in-up delay-500">
        <div className="flex items-end justify-between mb-8 border-b border-outline-variant pb-4">
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-widest">Analytics</p>
            <h2 className="font-headline-sm text-headline-sm text-primary">Performance snapshot</h2>
          </div>
          <Link to="/reports" className="font-label-caps text-label-caps text-primary hover:text-tertiary transition-colors flex items-center gap-2 group">
            Full report
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ANALYTICS.map((m) => (
            <div
              key={m.label}
              className="bg-surface-container-lowest rounded-xl luxury-shadow p-6 flex flex-col gap-4 border border-outline-variant/10 hover:border-outline-variant/30 transition-colors group"
            >
              <div className="flex justify-between items-start">
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">{m.label}</p>
                <span className="material-symbols-outlined text-surface-dim group-hover:text-primary transition-colors text-[20px]">{m.icon}</span>
              </div>
              <div>
                <p className="font-display-md text-display-md text-on-background tracking-tight leading-none">{renderValue(m)}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`font-mono-data text-mono-data ${m.deltaPositive ? 'text-secondary' : 'text-error'}`}>{m.delta}</span>
                  <span className="font-mono-data text-mono-data text-on-surface-variant">{m.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 bg-surface-container-lowest soft-shadow rounded-xl p-10 flex flex-col relative overflow-hidden animate-fade-in-up delay-600">
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Spending Trends</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Q3 Corporate Output vs Projection</p>
            </div>
            <div className="flex gap-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed inline-block"></span> Actual
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border border-outline inline-block"></span> Projection
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] relative w-full mt-auto">
            <svg className="w-full h-full preserve-aspect-ratio-none overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 300">
              <line stroke="#f0f1f1" strokeWidth="1" x1="0" x2="800" y1="50" y2="50"></line>
              <line stroke="#f0f1f1" strokeWidth="1" x1="0" x2="800" y1="150" y2="150"></line>
              <line stroke="#f0f1f1" strokeWidth="1" x1="0" x2="800" y1="250" y2="250"></line>
              <path d="M 0 250 L 0 200 Q 100 220 200 150 T 400 100 T 600 180 T 800 80 L 800 250 Z" fill="#e7e2d9" opacity="0.6"></path>
              <path className="chart-path" d="M 0 200 Q 100 220 200 150 T 400 100 T 600 180 T 800 80" fill="none" stroke="#615e57" strokeWidth="2"></path>
              <path d="M 0 180 Q 200 190 400 150 T 800 100" fill="none" stroke="#c4c7c7" strokeDasharray="6 6" strokeWidth="1.5"></path>
            </svg>
            <div className="absolute bottom-[-30px] left-0 w-full flex justify-between text-mono-data font-mono-data text-outline">
              <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 pl-8 lg:border-l border-outline-variant/30 relative animate-fade-in-up delay-600">
          <div className="mb-10 flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-primary">Recent Activity</h3>
            <Link to="/activity-logs" className="text-on-surface-variant hover:text-primary transition-colors" aria-label="View all activity">
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-0 w-[1px] bg-outline-variant/30"></div>
            <ul className="flex flex-col gap-10">
              <li className="relative pl-8 group">
                <span className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-surface bg-primary transition-transform group-hover:scale-125"></span>
                <div className="flex flex-col gap-1">
                  <span className="font-mono-data text-mono-data text-outline">10:42 AM</span>
                  <p className="font-data-lg text-data-lg text-primary">PO #8902 Approved</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">Lumina Textiles • {fmt(14500)}</p>
                </div>
              </li>
              <li className="relative pl-8 group">
                <span className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-surface bg-surface-variant transition-transform group-hover:scale-125"></span>
                <div className="flex flex-col gap-1">
                  <span className="font-mono-data text-mono-data text-outline">09:15 AM</span>
                  <p className="font-data-lg text-data-lg text-primary">New RFQ Published</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">Packaging Materials Q4</p>
                </div>
              </li>
              <li className="relative pl-8 group">
                <span className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-surface bg-surface-variant transition-transform group-hover:scale-125"></span>
                <div className="flex flex-col gap-1">
                  <span className="font-mono-data text-mono-data text-outline">Yesterday, 16:30</span>
                  <p className="font-data-lg text-data-lg text-primary">Invoice Received</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">Atlas Logistics • INV-9921</p>
                </div>
              </li>
              <li className="relative pl-8 group">
                <span className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-surface bg-error transition-transform group-hover:scale-125"></span>
                <div className="flex flex-col gap-1">
                  <span className="font-mono-data text-mono-data text-error">Yesterday, 14:00</span>
                  <p className="font-data-lg text-data-lg text-primary">Vendor Alert: Delay</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">Shipment #402 delayed by 48h</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
