import React, { useState } from 'react';
import { useToast } from '../hooks/useToasts.jsx';
import { exportCSV, exportReportsPDF } from '../utils/export';
import { useFormatCurrency, useFormatCurrencyCompact } from '../utils/format';

const ALLOCATION = [
  { name: 'Raw Materials', share: 42 },
  { name: 'Logistics & Freight', share: 28 },
  { name: 'IT & Infrastructure', share: 15 },
  { name: 'Professional Services', share: 10 },
  { name: 'Marketing & Media', share: 5 },
];

const RISK = [
  { tier: 'Monitor', value: 18 },
  { tier: 'Critical', value: 8 },
  { tier: 'Stable', value: 62 },
  { tier: 'Watchlist', value: 12 },
];

const Reports = () => {
  const toast = useToast();
  const fmtCompact = useFormatCurrencyCompact();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const onExportCSV = () => {
    exportCSV(
      ALLOCATION.map((r) => ({ category: r.name, sharePct: r.share })),
      [
        { key: 'category', label: 'Category' },
        { key: 'sharePct', label: 'Share (%)' },
      ],
      'procurement-allocation.csv'
    );
    toast.success('Procurement allocation exported to CSV.');
  };

  const onGenerateReport = () => setConfirmOpen(true);

  const buildReport = async () => {
    const kpis = [
      { label: 'Total Spend', value: fmtCompact(14200000), delta: '+8.4%', deltaPositive: true, sub: 'vs last quarter' },
      { label: 'Active Vendors', value: '342', delta: 'Stable', deltaPositive: true, sub: 'allocation' },
      { label: 'Open POs', value: '1,840', delta: '−2.1%', deltaPositive: false, sub: 'clearance rate' },
      { label: 'Cost Savings', value: fmtCompact(845000), delta: '+12.5%', deltaPositive: true, sub: 'negotiation yield' },
    ];
    const allocation = ALLOCATION.map((r, i) => ({
      ...r,
      color: ['#615e57', '#8e8b83', '#a8a39a', '#c4c0b8', '#dad6cf'][i] || '#615e57',
    }));
    const risk = [
      { tier: 'Monitor', value: 18, bg: '#eae6df', ink: '#6b6b6b' },
      { tier: 'Critical', value: 8, bg: '#c4c0b8', ink: '#1a1a1a' },
      { tier: 'Stable', value: 62, bg: '#fafaf7', ink: '#9a9a9a' },
      { tier: 'Watchlist', value: 12, bg: '#dcd5c5', ink: '#1a1a1a' },
    ];
    await exportReportsPDF({
      kpis, allocation, risk,
      filename: `vendorbridge-q3-report-${new Date().toISOString().slice(0, 10)}.pdf`,
    });
  };

  const onConfirmGenerate = async () => {
    setConfirmOpen(false);
    try {
      await buildReport();
      toast.success('Q3 performance PDF generated.');
    } catch (err) {
      console.error('Generate report failed', err);
      toast.error(`Could not generate PDF: ${err?.message || 'unknown error'}`);
    }
  };

  return (
    <div className="container-page min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 stagger-1">
        <div className="max-w-2xl">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-widest">Q3 Performance</p>
          <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Reports & Analytics</h2>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={onExportCSV} className="px-6 py-3 rounded-full bg-transparent text-primary font-label-caps text-label-caps hover:bg-surface-variant transition-colors flex items-center gap-2 group">
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-y-0.5 transition-transform">download</span>
            Export CSV
          </button>
          <button onClick={onGenerateReport} className="px-6 py-3 rounded-full bg-primary text-on-primary font-label-caps text-label-caps hover:bg-tertiary transition-colors shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Generate Report
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        <div className="bg-surface-container-lowest rounded-xl luxury-shadow p-8 flex flex-col justify-between group cursor-default stagger-2 border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
          <div className="flex justify-between items-start mb-12">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Spend</h3>
            <span className="material-symbols-outlined text-surface-dim group-hover:text-primary transition-colors">account_balance_wallet</span>
          </div>
          <div>
            <div className="font-display-md text-display-md text-on-background mb-2">{fmtCompact(14200000)}</div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">trending_up</span>
              <span className="font-mono-data text-mono-data text-on-surface-variant">+8.4% vs last quarter</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl luxury-shadow p-8 flex flex-col justify-between group cursor-default stagger-3 border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
          <div className="flex justify-between items-start mb-12">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Active Vendors</h3>
            <span className="material-symbols-outlined text-surface-dim group-hover:text-primary transition-colors">storefront</span>
          </div>
          <div>
            <div className="font-display-md text-display-md text-on-background mb-2">342</div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-surface-tint text-[16px]">trending_flat</span>
              <span className="font-mono-data text-mono-data text-surface-tint">Stable allocation</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl luxury-shadow p-8 flex flex-col justify-between group cursor-default stagger-4 border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
          <div className="flex justify-between items-start mb-12">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Open POs</h3>
            <span className="material-symbols-outlined text-surface-dim group-hover:text-primary transition-colors">receipt_long</span>
          </div>
          <div>
            <div className="font-display-md text-display-md text-on-background mb-2">1,840</div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">trending_down</span>
              <span className="font-mono-data text-mono-data text-on-surface-variant">-2.1% clearance rate</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl luxury-shadow p-8 flex flex-col justify-between group cursor-default relative overflow-hidden stagger-5 border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex justify-between items-start mb-12 relative z-10">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Cost Savings</h3>
            <span className="material-symbols-outlined text-surface-dim group-hover:text-primary transition-colors">savings</span>
          </div>
          <div className="relative z-10">
            <div className="font-display-md text-display-md text-on-background mb-2">{fmtCompact(845000)}</div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">trending_up</span>
              <span className="font-mono-data text-mono-data text-on-surface-variant">+12.5% negotiation yield</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl luxury-shadow p-10 md:p-12 stagger-6 border border-outline-variant/10">
          <div className="flex justify-between items-end mb-12 border-b border-surface-variant pb-6">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-background mb-2">Procurement Allocation</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Distribution of spend across primary operational categories.</p>
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>

          <div className="space-y-8">
            {ALLOCATION.map((row) => (
              <div key={row.name}>
                <div className="flex justify-between mb-2">
                  <span className="font-data-lg text-data-lg text-on-background">{row.name}</span>
                  <span className="font-mono-data text-mono-data text-on-surface-variant">{row.share}%</span>
                </div>
                <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${row.share}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl luxury-shadow p-10 md:p-12 flex flex-col stagger-7 border border-outline-variant/10">
          <div className="mb-12 border-b border-surface-variant pb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-background mb-2">Risk Matrix</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Vendor exposure mapped by likelihood and operational impact.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="relative flex h-full">
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-center whitespace-nowrap">
                <span className="font-label-caps text-label-caps text-surface-tint uppercase tracking-widest">Likelihood</span>
              </div>

              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 aspect-square max-w-[400px] mx-auto w-full">
                <div className="bg-surface-variant/50 rounded-lg p-6 flex flex-col items-start justify-between group hover:bg-surface-variant transition-colors cursor-default">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">Monitor</span>
                  <span className="font-display-md text-display-md text-on-background">18<span className="text-lg text-on-surface-variant">%</span></span>
                </div>

                <div className="bg-secondary-container rounded-lg p-6 flex flex-col items-start justify-between group hover:bg-secondary/20 transition-colors cursor-default">
                  <span className="font-label-caps text-label-caps text-on-secondary-container">Critical</span>
                  <span className="font-display-md text-display-md text-on-secondary-fixed">8<span className="text-lg opacity-70">%</span></span>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-6 flex flex-col items-start justify-between group hover:bg-surface-bright transition-colors cursor-default">
                  <span className="font-label-caps text-label-caps text-surface-tint">Stable</span>
                  <span className="font-display-md text-display-md text-surface-tint">62<span className="text-lg opacity-70">%</span></span>
                </div>

                <div className="bg-secondary-fixed/50 rounded-lg p-6 flex flex-col items-start justify-between group hover:bg-secondary-fixed transition-colors cursor-default">
                  <span className="font-label-caps text-label-caps text-on-secondary-fixed-variant">Watchlist</span>
                  <span className="font-display-md text-display-md text-on-background">12<span className="text-lg text-on-surface-variant">%</span></span>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <span className="font-label-caps text-label-caps text-surface-tint uppercase tracking-widest">Impact</span>
            </div>
          </div>
        </div>
      </section>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setConfirmOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Generate Q3 report" className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-md p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">picture_as_pdf</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Generate Q3 Report?</h3>
                <p className="font-body-md text-sm text-on-surface-variant">A printable HTML report will be generated. You can save it as PDF using your browser's print dialog.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Cancel</button>
              <button onClick={onConfirmGenerate} className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-caps text-label-caps hover:bg-tertiary transition-colors">Generate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
