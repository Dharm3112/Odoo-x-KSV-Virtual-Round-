import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../hooks/useToasts.jsx';
import { useFormatCurrency } from '../utils/format';

const OPEN_RFQS = [
  {
    id: 'rfq-2024-892', title: 'High-Tensile Steel Cabling', category: 'Raw Materials',
    buyer: 'Astra Manufacturing Ltd.', deadline: '2026-06-30', deadlineTime: '17:00',
    delivery: 'Warehouse 3, Mumbai', terms: 'Net 30', currency: 'INR',
    lines: [
      { id: 'l1', item: 'High-tensile steel cable, 8mm', sku: 'HTS-8MM', qty: 1200, unit: 'Metre', targetPrice: 110 },
      { id: 'l2', item: 'Stainless termination fittings', sku: 'STF-A2', qty: 240, unit: 'Each', targetPrice: 40 },
      { id: 'l3', item: 'Installation certification', sku: 'CERT-ISO', qty: 1, unit: 'Set', targetPrice: 10000 },
    ],
  },
  {
    id: 'rfq-2024-901', title: 'Premium Packaging Materials Q3', category: 'Packaging',
    buyer: 'Astra Manufacturing Ltd.', deadline: '2026-07-15', deadlineTime: '17:00',
    delivery: 'Warehouse 2, Bengaluru', terms: 'Net 45', currency: 'INR',
    lines: [
      { id: 'l1', item: 'Corrugated shipping boxes 12x10x6', sku: 'BOX-12-100', qty: 5000, unit: 'Each', targetPrice: 42 },
      { id: 'l2', item: 'Void fill paper, 30gsm roll', sku: 'PAP-VF-30', qty: 200, unit: 'Kg', targetPrice: 75 },
    ],
  },
  {
    id: 'rfq-2024-915', title: 'Cloud Hosting Annual Renewal', category: 'IT & Software',
    buyer: 'Astra Manufacturing Ltd.', deadline: '2026-06-20', deadlineTime: '12:00',
    delivery: 'Digital delivery', terms: 'Net 30', currency: 'USD',
    lines: [
      { id: 'l1', item: 'Managed cloud hosting, 12 months', sku: 'CLD-MGT-12M', qty: 1, unit: 'Set', targetPrice: 48000 },
      { id: 'l2', item: 'Premium support, 24/7', sku: 'SUP-247', qty: 12, unit: 'Hour', targetPrice: 250 },
    ],
  },
];

const VENDOR = {
  name: 'Apex Industries',
  code: 'APX-FR-001',
  country: 'Germany',
  city: 'Frankfurt',
  rating: 4.8,
};

const TERMS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Advance', '50% Advance / 50% Delivery', 'Letter of Credit'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'SEK', 'CNY', 'AUD'];
const STATUSES = [
  { key: 'draft', label: 'Draft', bg: '#eae6df', ink: '#6b6b6b' },
  { key: 'submitted', label: 'Submitted', bg: '#e8f3e8', ink: '#2e592e' },
  { key: 'revised', label: 'Revised', bg: '#fdf2e9', ink: '#b35900' },
];

const StatusPill = ({ kind }) => {
  const s = STATUSES.find((x) => x.key === kind) || STATUSES[0];
  return (
    <span style={{ background: s.bg, color: s.ink }} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-caps text-label-caps uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.ink }}></span>
      {s.label}
    </span>
  );
};

const StepHeader = ({ step, total, title, subtitle }) => (
  <header className="mb-8 flex items-baseline justify-between">
    <div>
      <h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">{title}</h3>
      {subtitle && <p className="font-body-md text-sm text-on-surface-variant mt-1">{subtitle}</p>}
    </div>
    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em]">{String(step).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
  </header>
);

const VendorQuotation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRfqId = searchParams.get('rfq') || OPEN_RFQS[0].id;
  const toast = useToast();
  const fmt = useFormatCurrency();

  const [rfqId, setRfqId] = useState(initialRfqId);
  const rfq = useMemo(() => OPEN_RFQS.find((r) => r.id === rfqId) || OPEN_RFQS[0], [rfqId]);

  const [status, setStatus] = useState('draft');
  const [lines, setLines] = useState(() => rfq.lines.map((l) => ({ ...l, unitPrice: '', leadDays: 14, deliveryDate: '' })));
  const [shipping, setShipping] = useState(0);
  const [taxRate, setTaxRate] = useState(0.18);
  const [terms, setTerms] = useState(rfq.terms);
  const [currency, setCurrency] = useState(rfq.currency);
  const [validityDays, setValidityDays] = useState(30);
  const [notes, setNotes] = useState('');
  const [dirty, setDirty] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  React.useEffect(() => {
    setLines(rfq.lines.map((l) => ({ ...l, unitPrice: '', leadDays: 14, deliveryDate: '' })));
    setCurrency(rfq.currency);
    setTerms(rfq.terms);
    setDirty(false);
    setStatus('draft');
  }, [rfqId]);

  const markDirty = () => setDirty(true);

  const updateLine = (id, patch) => {
    setLines((arr) => arr.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    markDirty();
  };

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0), 0),
    [lines]
  );
  const tax = useMemo(() => subtotal * (Number(taxRate) || 0), [subtotal, taxRate]);
  const total = useMemo(() => subtotal + Number(shipping || 0) + tax, [subtotal, shipping, tax]);
  const maxLead = useMemo(() => Math.max(0, ...lines.map((l) => Number(l.leadDays) || 0)), [lines]);

  const isValid = useMemo(() => {
    if (lines.length === 0) return false;
    if (!lines.every((l) => l.item.trim() && Number(l.qty) > 0 && Number(l.unitPrice) >= 0 && l.deliveryDate)) return false;
    if (!terms) return false;
    if (!validityDays || validityDays < 1) return false;
    if (maxLead <= 0) return false;
    return true;
  }, [lines, terms, validityDays, maxLead]);

  const saveDraft = () => {
    setStatus('draft');
    setDirty(false);
    toast.success('Draft saved. You can return to edit anytime.');
  };

  const submitQuotation = () => {
    setConfirmSubmit(false);
    setStatus('submitted');
    setDirty(false);
    toast.success(`Quotation submitted to ${rfq.buyer}. Total ${fmt(total)} (${currency}).`);
    setTimeout(() => navigate('/quotations'), 900);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-surface-bright">
      <div className="container-page max-w-[1200px] transition-all duration-500 ease-in-out opacity-100 transform translate-y-0">
        <div className="mb-12 flex flex-col gap-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em]">Vendor Portal</span>
              <h2 className="font-display-lg text-display-lg text-on-surface tracking-tight mt-2">Submit Quotation</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-3 max-w-2xl">Respond to a buyer's request for quotation. Fill in your pricing, delivery commitments, and any notes, then submit before the deadline.</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest">Vendor</span>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg">
                <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-caps text-xs">
                  {VENDOR.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <div className="flex flex-col">
                  <span className="font-body-md text-sm text-on-surface">{VENDOR.name}</span>
                  <span className="font-mono-data text-mono-data text-on-surface-variant">{VENDOR.code} · {VENDOR.city}, {VENDOR.country}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '14px' }}>edit</span>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-[0.15em]">Quote</span>
            </div>
            <div className="h-[1px] w-20 bg-outline-variant/40"></div>

            <div className="flex items-center gap-4">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isValid ? 'bg-primary-container' : 'border-2 border-secondary-fixed bg-transparent'}`}>
                {isValid && <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '14px' }}>check</span>}
              </div>
              <span className={`font-label-caps text-label-caps uppercase tracking-[0.15em] ${isValid ? 'text-on-surface' : 'text-on-surface-variant opacity-60'}`}>Review</span>
            </div>
            <div className="h-[1px] w-20 bg-outline-variant/40"></div>

            <div className="flex items-center gap-4">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${status === 'submitted' ? 'bg-primary-container' : 'border-2 border-secondary-fixed bg-transparent'}`}>
                {status === 'submitted' && <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '14px' }}>send</span>}
              </div>
              <span className={`font-label-caps text-label-caps uppercase tracking-[0.15em] ${status === 'submitted' ? 'text-on-surface' : 'text-on-surface-variant opacity-60'}`}>Submit</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-16">
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-8">
            <section className="bg-surface-container-lowest p-10 rounded-xl border border-surface-container-low shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)]">
              <StepHeader step={1} total={4} title="Respond to RFQ" subtitle="Select which request you'd like to quote on." />
              <div className="flex flex-col gap-4">
                <div className="flex flex-col group">
                  <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-widest">Open RFQ</label>
                  <select
                    value={rfqId}
                    onChange={(e) => { setRfqId(e.target.value); markDirty(); }}
                    className="w-full border border-outline-variant rounded px-4 py-4 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                  >
                    {OPEN_RFQS.map((r) => (
                      <option key={r.id} value={r.id}>{r.id} — {r.title} (due {r.deadline})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="p-4 bg-surface-bright rounded border border-outline-variant/30">
                    <div className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest mb-1">Buyer</div>
                    <div className="font-body-md text-sm text-on-surface">{rfq.buyer}</div>
                  </div>
                  <div className="p-4 bg-surface-bright rounded border border-outline-variant/30">
                    <div className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest mb-1">Deadline</div>
                    <div className="font-mono-data text-on-surface">{rfq.deadline} {rfq.deadlineTime}</div>
                  </div>
                  <div className="p-4 bg-surface-bright rounded border border-outline-variant/30">
                    <div className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest mb-1">Deliver to</div>
                    <div className="font-body-md text-sm text-on-surface">{rfq.delivery}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest p-10 rounded-xl border border-surface-container-low shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)]">
              <StepHeader step={2} total={4} title="Line Items & Pricing" subtitle="Set your unit price, lead time, and delivery date for each requested line." />
              <div className="border border-outline-variant/40 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-surface-bright font-label-caps text-xs text-on-surface-variant uppercase tracking-widest">
                  <div className="col-span-4">Item</div>
                  <div className="col-span-2">SKU</div>
                  <div className="col-span-1 text-right">Qty</div>
                  <div className="col-span-1">Unit</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-1 text-right">Lead (d)</div>
                  <div className="col-span-1"></div>
                </div>
                <ul>
                  {lines.map((l) => {
                    const lineTotal = (Number(l.qty) || 0) * (Number(l.unitPrice) || 0);
                    const target = Number(l.targetPrice) || 0;
                    const variance = target > 0 && l.unitPrice !== '' ? ((Number(l.unitPrice) - target) / target) * 100 : null;
                    return (
                      <li key={l.id} className="border-t border-outline-variant/30">
                        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center">
                          <div className="col-span-4">
                            <div className="font-body-md text-sm text-on-surface">{l.item}</div>
                            <div className="font-mono-data text-mono-data text-on-surface-variant">Target: {target > 0 ? fmt(target) : '—'}</div>
                          </div>
                          <div className="col-span-2 font-mono-data text-mono-data text-on-surface">{l.sku}</div>
                          <div className="col-span-1 font-mono-data text-mono-data text-on-surface text-right">{l.qty}</div>
                          <div className="col-span-1 font-mono-data text-mono-data text-on-surface">{l.unit}</div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={l.unitPrice}
                              onChange={(e) => updateLine(l.id, { unitPrice: e.target.value })}
                              className="w-full bg-transparent font-mono-data text-mono-data text-on-surface text-right outline-none focus:bg-surface-bright rounded px-1 py-0.5 border-b border-outline-variant/40 focus:border-primary-container"
                              placeholder="0.00"
                            />
                            {variance !== null && (
                              <div className={`font-mono-data text-[10px] text-right mt-0.5 ${variance > 5 ? 'text-error' : variance < -2 ? 'text-success' : 'text-on-surface-variant'}`}>
                                {variance > 0 ? '+' : ''}{variance.toFixed(1)}% vs target
                              </div>
                            )}
                          </div>
                          <div className="col-span-1">
                            <input
                              type="number"
                              min="0"
                              value={l.leadDays}
                              onChange={(e) => updateLine(l.id, { leadDays: e.target.value })}
                              className="w-full bg-transparent font-mono-data text-mono-data text-on-surface text-right outline-none focus:bg-surface-bright rounded px-1 py-0.5 border-b border-outline-variant/40 focus:border-primary-container"
                            />
                          </div>
                          <div className="col-span-1 text-right font-mono-data text-mono-data text-on-surface">{lineTotal > 0 ? lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}</div>
                        </div>
                        <div className="grid grid-cols-12 gap-2 px-4 pb-3 items-center text-mono-data text-mono-data text-on-surface-variant">
                          <div className="col-span-9 col-start-1 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">event</span>
                            <span className="font-label-caps text-xs uppercase tracking-widest opacity-70">Deliver by:</span>
                            <input
                              type="date"
                              value={l.deliveryDate}
                              onChange={(e) => updateLine(l.id, { deliveryDate: e.target.value })}
                              className="bg-transparent font-mono-data text-mono-data text-on-surface outline-none border-b border-outline-variant/40 focus:border-primary-container"
                            />
                          </div>
                          <div className="col-span-3 text-right font-mono-data text-on-surface">
                            {lineTotal > 0 ? `${lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}` : '—'}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>

            <section className="bg-surface-container-lowest p-10 rounded-xl border border-surface-container-low shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)]">
              <StepHeader step={3} total={4} title="Commercial Terms" subtitle="Shipping, tax, currency, payment terms, and quote validity." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4 p-5 border border-outline-variant/40 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col group">
                      <label className="font-label-caps text-xs text-on-surface-variant mb-1 uppercase tracking-widest">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => { setCurrency(e.target.value); markDirty(); }}
                        className="bg-transparent font-body-md text-body-md text-on-surface border-b border-outline-variant/40 focus:border-primary-container outline-none py-1"
                      >
                        {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col group">
                      <label className="font-label-caps text-xs text-on-surface-variant mb-1 uppercase tracking-widest">Payment Terms</label>
                      <select
                        value={terms}
                        onChange={(e) => { setTerms(e.target.value); markDirty(); }}
                        className="bg-transparent font-body-md text-body-md text-on-surface border-b border-outline-variant/40 focus:border-primary-container outline-none py-1"
                      >
                        {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col group">
                      <label className="font-label-caps text-xs text-on-surface-variant mb-1 uppercase tracking-widest">Shipping ({currency})</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={shipping}
                        onChange={(e) => { setShipping(e.target.value); markDirty(); }}
                        className="bg-transparent font-mono-data text-mono-data text-on-surface border-b border-outline-variant/40 focus:border-primary-container outline-none py-1"
                      />
                    </div>

                    <div className="flex flex-col group">
                      <label className="font-label-caps text-xs text-on-surface-variant mb-1 uppercase tracking-widest">Tax Rate</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={(taxRate * 100).toFixed(2)}
                          onChange={(e) => { setTaxRate((Number(e.target.value) || 0) / 100); markDirty(); }}
                          className="w-full bg-transparent font-mono-data text-mono-data text-on-surface border-b border-outline-variant/40 focus:border-primary-container outline-none py-1"
                        />
                        <span className="font-mono-data text-on-surface-variant">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col group">
                    <label className="font-label-caps text-xs text-on-surface-variant mb-1 uppercase tracking-widest">Quote Validity (days)</label>
                    <input
                      type="number"
                      min="1"
                      value={validityDays}
                      onChange={(e) => { setValidityDays(e.target.value); markDirty(); }}
                      className="bg-transparent font-mono-data text-mono-data text-on-surface border-b border-outline-variant/40 focus:border-primary-container outline-none py-1"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 p-5 border border-outline-variant/40 rounded-lg bg-primary-container/5">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-serif">Totals</h4>
                  <dl className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest">Subtotal</dt>
                      <dd className="font-mono-data text-on-surface">{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest">Shipping</dt>
                      <dd className="font-mono-data text-on-surface">{(Number(shipping) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest">Tax ({(taxRate * 100).toFixed(1)}%)</dt>
                      <dd className="font-mono-data text-on-surface">{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</dd>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-outline-variant/40">
                      <dt className="font-label-caps text-xs text-on-surface uppercase tracking-widest">Total Landed Cost</dt>
                      <dd className="font-data-lg text-data-lg text-primary font-medium">{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</dd>
                    </div>
                    <div className="flex justify-between text-xs">
                      <dt className="text-on-surface-variant">Max lead time</dt>
                      <dd className="font-mono-data text-on-surface-variant">{maxLead} day(s)</dd>
                    </div>
                  </dl>
                  <p className="font-mono-data text-mono-data text-on-surface-variant mt-auto pt-2">Buyer display: <span className="text-on-surface">{fmt(total)}</span></p>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest p-10 rounded-xl border border-surface-container-low shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)]">
              <StepHeader step={4} total={4} title="Notes & Comments" subtitle="Assumptions, exclusions, alternate offers, certifications, warranty info…" />
              <textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); markDirty(); }}
                rows="5"
                className="w-full border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all resize-none"
                placeholder="e.g. Pricing valid for 30 days. Lead time assumes 5-day buffer for customs clearance. Alternative alloy available at +6% if 100% spec match required."
              ></textarea>
              <div className="flex justify-between items-center mt-2">
                <p className="font-mono-data text-mono-data text-on-surface-variant">Visible to buyer after submission.</p>
                <p className="font-mono-data text-mono-data text-on-surface-variant">{notes.length} character(s)</p>
              </div>
            </section>
          </div>

          <aside className="col-span-1 lg:col-span-4 flex flex-col gap-6">
            <section className="bg-surface-container-lowest p-8 rounded-xl border border-surface-container-low shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">Submission</h3>
                <StatusPill kind={status} />
              </div>
              <dl className="flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest">Line items</dt>
                  <dd className="font-mono-data text-on-surface">{lines.filter((l) => l.unitPrice !== '').length} / {lines.length} priced</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest">Total</dt>
                  <dd className="font-mono-data text-on-surface">{total > 0 ? total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'} {currency}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest">Max lead</dt>
                  <dd className="font-mono-data text-on-surface">{maxLead} day(s)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest">Validity</dt>
                  <dd className="font-mono-data text-on-surface">{validityDays} day(s)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest">Deadline</dt>
                  <dd className="font-mono-data text-on-surface">{rfq.deadline}</dd>
                </div>
              </dl>
            </section>

            <section className="bg-primary-container/5 p-6 rounded-xl border border-primary-container/20">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-serif mb-3">Buyer Requirements</h3>
              <ul className="flex flex-col gap-2 text-sm">
                {rfq.lines.map((l) => (
                  <li key={l.id} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px] mt-0.5">check_circle</span>
                    <div>
                      <div className="font-body-md text-on-surface">{l.item}</div>
                      <div className="font-mono-data text-mono-data text-on-surface-variant">{l.qty} {l.unit} · target {fmt(l.targetPrice)}/u</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex flex-col gap-3 sticky top-6">
              <button
                onClick={() => setConfirmSubmit(true)}
                disabled={!isValid}
                className={`w-full px-8 py-5 font-label-caps text-label-caps uppercase tracking-widest rounded transition-all duration-300 flex items-center justify-center gap-3 ${
                  isValid
                    ? 'bg-primary-container text-on-primary-container hover:bg-tertiary hover:-translate-y-0.5 hover:shadow-lg'
                    : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                Submit quotation
              </button>
              <button
                onClick={saveDraft}
                disabled={!dirty}
                className="w-full px-8 py-3 font-label-caps text-label-caps uppercase tracking-widest border border-outline-variant rounded text-on-surface hover:bg-surface-bright transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">bookmark</span>
                Save draft
              </button>
              <button
                onClick={() => navigate('/quotations')}
                className="w-full px-8 py-3 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-200 opacity-70 hover:opacity-100"
              >
                Back to comparison
              </button>
            </div>
          </aside>
        </div>
      </div>

      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setConfirmSubmit(false)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirm submission" className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-md p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">send</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Submit this quotation?</h3>
                <p className="font-body-md text-sm text-on-surface-variant">{VENDOR.name} will submit a quotation to {rfq.buyer} for {rfq.title}. The buyer will be notified immediately.</p>
                <div className="mt-4 p-4 bg-surface-bright rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">RFQ</span>
                    <span className="font-mono-data text-primary">{rfq.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Total</span>
                    <span className="font-mono-data text-primary">{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Lead time</span>
                    <span className="font-mono-data text-primary">{maxLead} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Validity</span>
                    <span className="font-mono-data text-primary">{validityDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Deadline</span>
                    <span className="font-mono-data text-primary">{rfq.deadline} {rfq.deadlineTime}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmSubmit(false)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Review again</button>
              <button onClick={submitQuotation} className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-caps text-label-caps hover:bg-tertiary transition-colors">Submit now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorQuotation;
