import React, { useState } from 'react';
import { useToast } from '../hooks/useToasts.jsx';
import { exportCSV, exportHTML } from '../utils/export';
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

  const buildReportHTML = () => {
    const stamp = new Date().toLocaleString();
    const allocRows = ALLOCATION.map(
      (r) => `<tr><td>${r.name}</td><td style="text-align:right">${r.share}%</td></tr>`
    ).join('');
    const riskRows = RISK.map(
      (r) => `<tr><td>${r.tier}</td><td style="text-align:right">${r.value}%</td></tr>`
    ).join('');
    return `<!doctype html>
<html><head><meta charset="utf-8"/><title>VendorBridge — Q3 Performance Report</title>
<style>
  :root { color-scheme: light; }
  body { font-family: 'Space Grotesk', -apple-system, system-ui, sans-serif; color: #1a1a1a; margin: 48px; background: #fafaf7; }
  h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 36px; margin: 0 0 4px; }
  h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; margin: 32px 0 8px; border-bottom: 1px solid #e5e1d8; padding-bottom: 6px; }
  .meta { color: #6b6b6b; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; margin-top: 24px; }
  .card { background: #fff; border: 1px solid #eae6df; border-radius: 12px; padding: 24px; }
  .kpi { font-family: 'Playfair Display', Georgia, serif; font-size: 32px; margin: 4px 0; }
  .label { color: #6b6b6b; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { text-align: left; padding: 8px 0; border-bottom: 1px solid #f0ece4; font-size: 14px; }
  th { color: #6b6b6b; font-weight: 500; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; }
</style></head>
<body>
  <p class="meta">Q3 Performance • Generated ${stamp}</p>
  <h1>Reports &amp; Analytics</h1>
  <p class="meta">VendorBridge Enterprise — Internal</p>
  <div class="grid">
    <div class="card"><div class="label">Total Spend</div><div class="kpi">${fmtCompact(14200000)}</div><div class="meta">+8.4% vs last quarter</div></div>
    <div class="card"><div class="label">Active Vendors</div><div class="kpi">342</div><div class="meta">Stable allocation</div></div>
    <div class="card"><div class="label">Open POs</div><div class="kpi">1,840</div><div class="meta">-2.1% clearance rate</div></div>
    <div class="card"><div class="label">Cost Savings</div><div class="kpi">${fmtCompact(845000)}</div><div class="meta">+12.5% negotiation yield</div></div>
  </div>
  <h2>Procurement Allocation</h2>
  <table><thead><tr><th>Category</th><th style="text-align:right">Share</th></tr></thead><tbody>${allocRows}</tbody></table>
  <h2>Risk Matrix</h2>
  <table><thead><tr><th>Tier</th><th style="text-align:right">Share</th></tr></thead><tbody>${riskRows}</tbody></table>
  <p class="meta" style="margin-top:48px">Open in browser and use Print → Save as PDF to export a PDF copy.</p>
</body></html>`;
  };

  const onConfirmGenerate = () => {
    setConfirmOpen(false);
    const html = buildReportHTML();
    exportHTML(html, `vendorbridge-q3-report-${new Date().toISOString().slice(0, 10)}.html`);
    toast.success('Q3 performance report generated. Open the HTML file in your browser to print or save as PDF.');
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
