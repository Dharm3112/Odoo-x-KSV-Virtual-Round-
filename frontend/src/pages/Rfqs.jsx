import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToasts.jsx';
import vendorCatalog from '../data/vendors.js';

const UNITS = ['Each', 'Box', 'Pack', 'Kg', 'Litre', 'Metre', 'Set', 'Hour', 'Day'];
const CATEGORIES = [
  'Raw Materials', 'Packaging', 'Logistics', 'IT & Software', 'Office Supplies',
  'Manufacturing', 'Services', 'Consulting', 'Maintenance', 'Other',
];
const PRIORITIES = [
  { key: 'low', label: 'Low', ink: '#2e592e', bg: '#e8f3e8' },
  { key: 'medium', label: 'Medium', ink: '#b35900', bg: '#fdf2e9' },
  { key: 'high', label: 'High', ink: '#b00020', bg: '#fde7e7' },
  { key: 'urgent', label: 'Urgent', ink: '#ffffff', bg: '#1a1a1a' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.dwg,.zip';

const formatBytes = (n) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

const fileIcon = (name) => {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (['pdf'].includes(ext)) return 'picture_as_pdf';
  if (['doc', 'docx'].includes(ext)) return 'description';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'table_chart';
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return 'image';
  if (['zip'].includes(ext)) return 'folder_zip';
  if (['dwg'].includes(ext)) return 'architecture';
  return 'insert_drive_file';
};

const emptyLine = () => ({
  id: `li_${Math.random().toString(36).slice(2, 9)}`,
  item: '',
  sku: '',
  description: '',
  qty: '',
  unit: 'Each',
  targetPrice: '',
});

const Rfqs = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [continueOpen, setContinueOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('all');
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({
    title: '',
    reference: '',
    category: '',
    priority: 'medium',
    description: '',
    deadlineDate: '',
    deadlineTime: '17:00',
    deliveryLocation: '',
    paymentTerms: 'Net 30',
    attachments: [],
    lineItems: [emptyLine()],
    assignedVendors: [],
  });

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const updateLine = (id, patch) => {
    update({
      lineItems: form.lineItems.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  };

  const addLine = () => update({ lineItems: [...form.lineItems, emptyLine()] });
  const removeLine = (id) => {
    if (form.lineItems.length === 1) {
      update({ lineItems: [emptyLine()] });
      return;
    }
    update({ lineItems: form.lineItems.filter((l) => l.id !== id) });
  };

  const ingestFiles = (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    const next = [];
    let rejected = 0;
    for (const f of list) {
      if (f.size > MAX_FILE_SIZE) { rejected += 1; continue; }
      next.push({
        id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: f.name,
        size: f.size,
        type: f.type,
        file: f,
      });
    }
    update({ attachments: [...form.attachments, ...next] });
    if (rejected) toast.error(`${rejected} file(s) skipped — over 10 MB.`);
    if (next.length) toast.success(`${next.length} file(s) attached.`);
  };

  const removeAttachment = (id) => {
    update({ attachments: form.attachments.filter((a) => a.id !== id) });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    ingestFiles(e.dataTransfer.files);
  };

  const onFileChange = (e) => {
    ingestFiles(e.target.files);
    e.target.value = '';
  };

  const pickerFiltered = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    return vendorCatalog.filter((v) => {
      if (pickerCategory !== 'all' && !v.categories.toLowerCase().includes(pickerCategory.toLowerCase())) return false;
      if (!q) return true;
      return [v.name, v.code, v.country, v.city, v.categories, v.contact, v.email]
        .some((s) => (s || '').toLowerCase().includes(q));
    });
  }, [pickerSearch, pickerCategory]);

  const toggleVendor = (v) => {
    const has = form.assignedVendors.find((x) => x.id === v.id);
    if (has) {
      update({ assignedVendors: form.assignedVendors.filter((x) => x.id !== v.id) });
    } else {
      update({ assignedVendors: [...form.assignedVendors, { id: v.id, name: v.name, code: v.code, categories: v.categories, country: v.country }] });
    }
  };

  const removeVendor = (id) => {
    update({ assignedVendors: form.assignedVendors.filter((v) => v.id !== id) });
  };

  const computedTotals = useMemo(() => {
    const qty = form.lineItems.reduce((s, l) => s + (Number(l.qty) || 0), 0);
    const value = form.lineItems.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.targetPrice) || 0), 0);
    return { qty, value, items: form.lineItems.filter((l) => l.item.trim()).length };
  }, [form.lineItems]);

  const isValid = useMemo(() => {
    if (!form.title.trim()) return false;
    if (!form.deadlineDate) return false;
    const filled = form.lineItems.filter((l) => l.item.trim() && Number(l.qty) > 0);
    if (filled.length === 0) return false;
    return true;
  }, [form]);

  const onContinue = () => {
    if (!form.title.trim()) return toast.error('Please enter a request title.');
    if (!form.deadlineDate) return toast.error('Please pick a submission deadline.');
    const filled = form.lineItems.filter((l) => l.item.trim() && Number(l.qty) > 0);
    if (filled.length === 0) return toast.error('Add at least one line item with quantity.');
    setContinueOpen(true);
  };

  const commitContinue = () => {
    setContinueOpen(false);
    toast.success(`Request "${form.title}" sent to ${form.assignedVendors.length || 'no'} vendor(s).`);
    setTimeout(() => navigate('/vendors'), 700);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-surface-bright">
      <div className="container-page max-w-[1200px] transition-all duration-500 ease-in-out opacity-100 transform translate-y-0">
        <div className="mb-12 flex flex-col gap-8">
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em]">Procurement</span>
            <h2 className="font-display-lg text-display-lg text-on-surface tracking-tight mt-2">Initiate Quotation Request</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-3 max-w-2xl">Define the products, quantities, timeline, and vendors for this request for quotation. Vendors will be notified to submit their bids.</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '14px' }}>edit</span>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-[0.15em]">Details</span>
            </div>
            <div className="h-[1px] w-20 bg-outline-variant/40"></div>

            <div className={`flex items-center gap-4 ${form.assignedVendors.length ? 'opacity-100' : 'opacity-60'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${form.assignedVendors.length ? 'bg-primary-container' : 'border-2 border-secondary-fixed bg-transparent'}`}>
                {form.assignedVendors.length > 0 && <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '14px' }}>group</span>}
              </div>
              <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-[0.15em]">Vendors</span>
            </div>
            <div className="h-[1px] w-20 bg-outline-variant/40"></div>

            <div className="flex items-center gap-4 opacity-60">
              <div className="w-5 h-5 rounded-full border-2 border-secondary-fixed bg-transparent"></div>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.15em]">Review</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-16">
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-8">
            <section className="bg-surface-container-lowest p-10 rounded-xl border border-surface-container-low shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)]">
              <header className="mb-8 flex items-baseline justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">Request Details</h3>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em]">01 / Basics</span>
              </header>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col group">
                  <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-widest transition-colors group-focus-within:text-primary-container">RFQ Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => update({ title: e.target.value })}
                    className="w-full border border-outline-variant rounded px-4 py-4 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                    placeholder="e.g. Q3 Packaging Materials Procurement"
                    type="text"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col group">
                    <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-widest transition-colors group-focus-within:text-primary-container">Reference Code</label>
                    <input
                      value={form.reference}
                      onChange={(e) => update({ reference: e.target.value })}
                      className="w-full border border-outline-variant rounded px-4 py-4 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-mono"
                      placeholder="RFQ-2024-0142"
                      type="text"
                    />
                  </div>

                  <div className="flex flex-col group">
                    <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-widest transition-colors group-focus-within:text-primary-container">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => update({ category: e.target.value })}
                      className="w-full border border-outline-variant rounded px-4 py-4 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col group">
                    <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-widest transition-colors group-focus-within:text-primary-container">Priority</label>
                    <div className="grid grid-cols-4 gap-2">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => update({ priority: p.key })}
                          className="px-3 py-3 rounded font-label-caps text-label-caps uppercase tracking-widest border transition-all"
                          style={{
                            background: form.priority === p.key ? p.bg : 'transparent',
                            color: form.priority === p.key ? p.ink : undefined,
                            borderColor: form.priority === p.key ? p.ink : 'rgb(var(--color-outline-variant))',
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col group">
                    <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-widest transition-colors group-focus-within:text-primary-container">Payment Terms</label>
                    <select
                      value={form.paymentTerms}
                      onChange={(e) => update({ paymentTerms: e.target.value })}
                      className="w-full border border-outline-variant rounded px-4 py-4 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                    >
                      {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Advance', '50% Advance / 50% Delivery', 'Letter of Credit', 'Custom'].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col group">
                  <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-widest transition-colors group-focus-within:text-primary-container">Product / Service Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => update({ description: e.target.value })}
                    className="w-full border border-outline-variant rounded px-4 py-4 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all resize-none"
                    placeholder="Describe the materials, grade, compliance requirements, certifications..."
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest p-10 rounded-xl border border-surface-container-low shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)]">
              <header className="mb-8 flex items-baseline justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">Line Items</h3>
                  <p className="font-body-md text-sm text-on-surface-variant mt-1">Add each product or service you need quoted.</p>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em]">02 / Products</span>
              </header>

              <div className="flex flex-col gap-4">
                {form.lineItems.map((l, i) => (
                  <div key={l.id} className="border border-outline-variant/60 rounded-lg p-5 bg-surface-bright/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono-data text-mono-data text-on-surface-variant">Item {String(i + 1).padStart(2, '0')}</span>
                      <button
                        type="button"
                        onClick={() => removeLine(l.id)}
                        className="text-on-surface-variant hover:text-error transition-colors flex items-center gap-1.5 font-label-caps text-xs uppercase tracking-widest"
                        aria-label="Remove line item"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-6 flex flex-col group">
                        <label className="font-label-caps text-xs text-on-surface-variant mb-1.5 uppercase tracking-widest">Item / Service *</label>
                        <input
                          value={l.item}
                          onChange={(e) => updateLine(l.id, { item: e.target.value })}
                          className="border border-outline-variant rounded px-3 py-2.5 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                          placeholder="e.g. Corrugated shipping boxes 12x10x6"
                        />
                      </div>

                      <div className="col-span-6 md:col-span-3 flex flex-col group">
                        <label className="font-label-caps text-xs text-on-surface-variant mb-1.5 uppercase tracking-widest">SKU / Code</label>
                        <input
                          value={l.sku}
                          onChange={(e) => updateLine(l.id, { sku: e.target.value })}
                          className="border border-outline-variant rounded px-3 py-2.5 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-mono"
                          placeholder="BOX-12-100"
                        />
                      </div>

                      <div className="col-span-6 md:col-span-3 flex flex-col group">
                        <label className="font-label-caps text-xs text-on-surface-variant mb-1.5 uppercase tracking-widest">Quantity *</label>
                        <input
                          value={l.qty}
                          onChange={(e) => updateLine(l.id, { qty: e.target.value })}
                          className="border border-outline-variant rounded px-3 py-2.5 bg-transparent font-data-lg text-data-lg text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-mono"
                          placeholder="0"
                          type="number"
                          min="0"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-6 flex flex-col group">
                        <label className="font-label-caps text-xs text-on-surface-variant mb-1.5 uppercase tracking-widest">Specifications / Notes</label>
                        <input
                          value={l.description}
                          onChange={(e) => updateLine(l.id, { description: e.target.value })}
                          className="border border-outline-variant rounded px-3 py-2.5 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                          placeholder="Material, grade, color, dimensions..."
                        />
                      </div>

                      <div className="col-span-6 md:col-span-3 flex flex-col group">
                        <label className="font-label-caps text-xs text-on-surface-variant mb-1.5 uppercase tracking-widest">Unit</label>
                        <select
                          value={l.unit}
                          onChange={(e) => updateLine(l.id, { unit: e.target.value })}
                          className="border border-outline-variant rounded px-3 py-2.5 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                        >
                          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>

                      <div className="col-span-6 md:col-span-3 flex flex-col group">
                        <label className="font-label-caps text-xs text-on-surface-variant mb-1.5 uppercase tracking-widest">Target Unit Price</label>
                        <input
                          value={l.targetPrice}
                          onChange={(e) => updateLine(l.id, { targetPrice: e.target.value })}
                          className="border border-outline-variant rounded px-3 py-2.5 bg-transparent font-data-lg text-data-lg text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-mono"
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addLine}
                  className="mt-2 w-full border border-dashed border-outline-variant hover:border-primary-container hover:bg-surface-container-low transition-all rounded-lg p-5 flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary font-label-caps text-label-caps uppercase tracking-[0.15em]"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add line item
                </button>
              </div>
            </section>

            <section className="bg-surface-container-lowest p-10 rounded-xl border border-surface-container-low shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)]">
              <header className="mb-8 flex items-baseline justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">Schedule & Delivery</h3>
                  <p className="font-body-md text-sm text-on-surface-variant mt-1">Set when bids are due and where goods should be delivered.</p>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em]">03 / Timeline</span>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col group">
                  <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-widest transition-colors group-focus-within:text-primary-container">Submission Date *</label>
                  <input
                    value={form.deadlineDate}
                    onChange={(e) => update({ deadlineDate: e.target.value })}
                    className="border border-outline-variant rounded px-4 py-4 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                    type="date"
                  />
                </div>

                <div className="flex flex-col group">
                  <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-widest transition-colors group-focus-within:text-primary-container">Cutoff Time</label>
                  <input
                    value={form.deadlineTime}
                    onChange={(e) => update({ deadlineTime: e.target.value })}
                    className="border border-outline-variant rounded px-4 py-4 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                    type="time"
                  />
                </div>

                <div className="flex flex-col group">
                  <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-widest transition-colors group-focus-within:text-primary-container">Delivery Location</label>
                  <input
                    value={form.deliveryLocation}
                    onChange={(e) => update({ deliveryLocation: e.target.value })}
                    className="border border-outline-variant rounded px-4 py-4 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                    placeholder="Warehouse 3, Mumbai"
                    type="text"
                  />
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest p-10 rounded-xl border border-surface-container-low shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)]">
              <header className="mb-8 flex items-baseline justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">Attachments</h3>
                  <p className="font-body-md text-sm text-on-surface-variant mt-1">Add specifications, drawings, terms or any supporting files. Max 10 MB per file.</p>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em]">04 / Files</span>
              </header>

              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-primary-container bg-primary-container/5' : 'border-outline-variant hover:border-primary-container hover:bg-surface-container-low'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '30px', fontWeight: '300' }}>cloud_upload</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface font-medium mb-1">Drag and drop files here</p>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest opacity-70">or click to browse</p>
                <p className="font-mono-data text-mono-data text-on-surface-variant mt-4 opacity-60">PDF, DOC, XLS, CSV, images, DWG, ZIP — up to 10 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED}
                  onChange={onFileChange}
                  className="hidden"
                />
              </div>

              {form.attachments.length > 0 && (
                <ul className="mt-6 flex flex-col gap-2">
                  {form.attachments.map((a) => (
                    <li key={a.id} className="flex items-center gap-4 p-3 bg-surface-bright rounded border border-outline-variant/40 group">
                      <span className="material-symbols-outlined text-on-surface-variant shrink-0">{fileIcon(a.name)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-body-md text-body-md text-on-surface truncate">{a.name}</div>
                        <div className="font-mono-data text-mono-data text-on-surface-variant">{formatBytes(a.size)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(a.id)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1"
                        aria-label={`Remove ${a.name}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="col-span-1 lg:col-span-4 flex flex-col gap-6">
            <section className="bg-surface-container-lowest p-8 rounded-xl border border-surface-container-low shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)]">
              <header className="mb-6 flex items-baseline justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">Vendor Assignment</h3>
                <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-[0.2em]">05 / Recipients</span>
              </header>

              {form.assignedVendors.length === 0 ? (
                <p className="font-body-md text-sm text-on-surface-variant mb-6">No vendors assigned yet. Pick from your registered vendors to receive this RFQ.</p>
              ) : (
                <ul className="flex flex-col gap-2 mb-4 max-h-72 overflow-y-auto">
                  {form.assignedVendors.map((v) => (
                    <li key={v.id} className="flex items-center gap-3 p-3 bg-surface-bright rounded border border-outline-variant/40">
                      <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-caps text-xs">
                        {v.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-body-md text-sm text-on-surface truncate">{v.name}</div>
                        <div className="font-mono-data text-mono-data text-on-surface-variant truncate">{v.code} · {v.country}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVendor(v.id)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1"
                        aria-label={`Remove ${v.name}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="w-full px-5 py-3 border border-outline-variant rounded text-on-surface hover:bg-surface-container-low transition-colors font-label-caps text-label-caps uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">group_add</span>
                {form.assignedVendors.length ? 'Manage vendors' : 'Select vendors'}
              </button>
            </section>

            <section className="bg-primary-container/5 p-8 rounded-xl border border-primary-container/20">
              <header className="mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">Live Summary</h3>
              </header>
              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest">Line items</dt>
                  <dd className="font-mono-data text-on-surface">{computedTotals.items} / {form.lineItems.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest">Total qty</dt>
                  <dd className="font-mono-data text-on-surface">{computedTotals.qty.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest">Est. value</dt>
                  <dd className="font-mono-data text-on-surface">{computedTotals.value > 0 ? computedTotals.value.toLocaleString() : '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest">Attachments</dt>
                  <dd className="font-mono-data text-on-surface">{form.attachments.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest">Vendors</dt>
                  <dd className="font-mono-data text-on-surface">{form.assignedVendors.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest">Deadline</dt>
                  <dd className="font-mono-data text-on-surface">{form.deadlineDate ? `${form.deadlineDate} ${form.deadlineTime || ''}` : '—'}</dd>
                </div>
              </dl>
            </section>

            <div className="flex flex-col gap-3 sticky top-6">
              <button
                onClick={onContinue}
                disabled={!isValid}
                className={`w-full px-8 py-5 font-label-caps text-label-caps uppercase tracking-widest rounded transition-all duration-300 flex items-center justify-center gap-3 ${
                  isValid
                    ? 'bg-primary-container text-on-primary hover:bg-tertiary hover:-translate-y-0.5 hover:shadow-lg'
                    : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                }`}
              >
                Send to Vendors
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </button>
              <button
                onClick={() => setCancelOpen(true)}
                className="w-full px-8 py-3 font-label-caps text-label-caps uppercase tracking-widest text-on-surface hover:text-primary transition-colors duration-200 opacity-70 hover:opacity-100"
              >
                Discard draft
              </button>
            </div>
          </aside>
        </div>
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setPickerOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Select vendors" className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-3xl max-h-[85vh] flex flex-col">
            <header className="p-6 border-b border-outline-variant/40 flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-serif">Select Vendors</h3>
                <p className="font-body-md text-sm text-on-surface-variant mt-1">{form.assignedVendors.length} selected · {pickerFiltered.length} matching</p>
              </div>
              <button onClick={() => setPickerOpen(false)} className="text-on-surface-variant hover:text-on-surface p-1" aria-label="Close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="p-6 border-b border-outline-variant/40 flex flex-col gap-3">
              <input
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search by name, code, country, category…"
                className="w-full border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
              />
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest shrink-0">Category:</span>
                <button
                  onClick={() => setPickerCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-label-caps uppercase tracking-widest transition-colors ${
                    pickerCategory === 'all' ? 'bg-primary-container text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >All</button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setPickerCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-label-caps uppercase tracking-widest transition-colors shrink-0 ${
                      pickerCategory === c ? 'bg-primary-container text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >{c}</button>
                ))}
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto p-3">
              {pickerFiltered.length === 0 ? (
                <li className="p-10 text-center text-on-surface-variant font-body-md">No vendors match your search.</li>
              ) : pickerFiltered.map((v) => {
                const selected = !!form.assignedVendors.find((x) => x.id === v.id);
                return (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => toggleVendor(v)}
                      className={`w-full text-left flex items-center gap-4 p-4 rounded-lg transition-colors ${
                        selected ? 'bg-primary-container/10' : 'hover:bg-surface-container-low'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'bg-primary-container border-primary-container' : 'border-outline-variant'
                      }`}>
                        {selected && <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '16px' }}>check</span>}
                      </span>
                      <span className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface flex items-center justify-center font-label-caps text-xs shrink-0">
                        {v.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-body-md text-body-md text-on-surface truncate">{v.name}</div>
                        <div className="font-mono-data text-mono-data text-on-surface-variant truncate">{v.code} · {v.city}, {v.country}</div>
                        <div className="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest mt-0.5 opacity-80">{v.categories}</div>
                      </div>
                      <span className={`font-label-caps text-xs px-2.5 py-1 rounded-full uppercase tracking-widest shrink-0 ${
                        v.statusKind === 'approved' ? 'bg-success-container text-on-success-container'
                        : v.statusKind === 'pending' ? 'bg-tertiary-container text-on-tertiary-container'
                        : 'bg-surface-container-high text-on-surface-variant'
                      }`}>{v.status}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <footer className="p-6 border-t border-outline-variant/40 flex items-center justify-between">
              <span className="font-body-md text-sm text-on-surface-variant">{form.assignedVendors.length} vendor(s) will receive this RFQ</span>
              <div className="flex gap-3">
                <button onClick={() => setPickerOpen(false)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Cancel</button>
                <button
                  onClick={() => setPickerOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-caps text-label-caps hover:bg-tertiary transition-colors"
                >Confirm ({form.assignedVendors.length})</button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setCancelOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Cancel RFQ" className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-md p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">close</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Discard this RFQ draft?</h3>
                <p className="font-body-md text-sm text-on-surface-variant">All entered details will be lost. This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setCancelOpen(false)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Keep editing</button>
              <button
                onClick={() => { setCancelOpen(false); toast.info('Draft discarded.'); navigate('/dashboard'); }}
                className="px-5 py-2.5 rounded-full bg-error text-on-error font-label-caps text-label-caps hover:opacity-90 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {continueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setContinueOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Send RFQ" className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-md p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">send</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Send this RFQ?</h3>
                <p className="font-body-md text-sm text-on-surface-variant">
                  "{form.title}" will be sent to {form.assignedVendors.length || 'no'} vendor(s) with a submission deadline of {form.deadlineDate || '—'} {form.deadlineTime || ''}.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setContinueOpen(false)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Review again</button>
              <button onClick={commitContinue} className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-caps text-label-caps hover:bg-tertiary transition-colors">Send now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rfqs;
