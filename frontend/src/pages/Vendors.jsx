import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../hooks/useToasts.jsx';
import { useFormatCurrency, useFormatDate } from '../utils/format';
import { exportPDF } from '../utils/export';
import VENDORS from '../data/vendors';

const STATUS_CLASS = {
  approved: 'bg-[#e8f3e8] text-[#2e592e]',
  pending: 'bg-[#fdf2e9] text-[#b35900]',
  inactive: 'bg-surface-variant text-on-surface-variant',
};

const STATUS_LABEL = {
  approved: 'Approved',
  pending: 'Pending Audit',
  inactive: 'Inactive',
};

const Vendors = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const fmt = useFormatCurrency();
  const fmtDate = useFormatDate();
  const [vendors, setVendors] = useState(VENDORS);
  const [drawerVendorId, setDrawerVendorId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', categories: '', country: 'United Kingdom', contact: '', email: '' });
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setAddOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('add');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) => {
      const hay = `${v.name} ${v.code} ${v.categories} ${v.country} ${v.city} ${v.contact} ${v.email} ${v.gst} ${v.status}`.toLowerCase();
      return hay.includes(q);
    });
  }, [vendors, search]);

  const openDrawer = (id) => {
    setDrawerVendorId(id);
    setIsDrawerOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerVendorId(null);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDrawerOpen]);

  const submitAdd = () => {
    if (!form.name.trim()) {
      toast.error('Vendor name is required.');
      return;
    }
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    const code = `VND-${Math.floor(1000 + Math.random() * 9000)}-XX`;
    const newVendor = {
      id: `v${Date.now()}`,
      name: form.name.trim(),
      code,
      categories: form.categories.trim() || 'Uncategorized',
      gst: 'Pending verification',
      contact: form.contact.trim() || '—',
      email: form.email.trim() || '—',
      country: form.country,
      city: '—',
      status: 'Pending Audit',
      statusKind: 'pending',
      rating: 0,
      onTimeRate: 0,
      poVolume: 0,
      joined: new Date().toISOString().slice(0, 10),
      paymentTerms: 'Net 30',
    };
    setVendors((arr) => [newVendor, ...arr]);
    setAddOpen(false);
    setForm({ name: '', categories: '', country: 'United Kingdom', contact: '', email: '' });
    toast.success(`${newVendor.name} added to vendor directory.`);
  };

  const onExportPDF = () => {
    const list = filtered;
    if (list.length === 0) {
      toast.error('No vendors to export.');
      return;
    }
    exportPDF({
      filename: `vendor-directory-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'Vendor Directory',
      subtitle: search.trim() ? `Search: "${search.trim()}"` : 'All vendors',
      meta: {
        'Total records': list.length,
        'Approved': list.filter((v) => v.statusKind === 'approved').length,
        'Pending audit': list.filter((v) => v.statusKind === 'pending').length,
        'Inactive': list.filter((v) => v.statusKind === 'inactive').length,
      },
      columns: [
        { key: 'name', label: 'Vendor' },
        { key: 'code', label: 'Code' },
        { key: 'country', label: 'Country' },
        { key: 'categories', label: 'Categories' },
        { key: 'contact', label: 'Contact' },
        { key: 'email', label: 'Email' },
        { key: 'gst', label: 'GST / VAT' },
        {
          key: 'paymentTerms', label: 'Terms', format: (r) => r.paymentTerms,
        },
        {
          key: 'poVolume', label: 'PO Volume (YTD)', align: 'right',
          format: (r) => fmt(r.poVolume),
        },
        { key: 'status', label: 'Status' },
      ],
      rows: list,
    });
    toast.success(`Exported ${list.length} vendor${list.length === 1 ? '' : 's'} to PDF.`);
  };

  const drawerVendor = vendors.find((v) => v.id === drawerVendorId) || vendors[0];

  return (
    <>
      <div className="container-page">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="font-display-lg text-display-lg text-primary mb-2">Vendor Directory</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">Manage your network of luxury suppliers, track compliance, and orchestrate global logistics.</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex items-center w-64">
              <span className="material-symbols-outlined absolute left-0 text-on-surface-variant text-[18px]">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-minimal w-full pl-8 pb-2 font-body-md text-body-md text-primary placeholder:text-on-surface-variant/50"
                placeholder="Search by name, code, country, GST…"
                type="text"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-0 text-on-surface-variant hover:text-primary p-1"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
            <button onClick={onExportPDF} className="bg-transparent text-primary border border-outline-variant px-5 py-3 rounded font-label-caps text-label-caps tracking-wider hover:bg-surface-variant transition-colors duration-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              Export PDF
            </button>
            <button onClick={() => setAddOpen(true)} className="bg-primary-container text-on-primary px-6 py-3 rounded font-label-caps text-label-caps tracking-wider hover:bg-tertiary transition-colors duration-300">
              Add Vendor
            </button>
          </div>
        </div>

        {search && (
          <div className="mb-4 flex items-center gap-3 text-sm text-on-surface-variant font-mono-data">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            <span>
              Showing {filtered.length} of {vendors.length} vendor{vendors.length === 1 ? '' : 's'} matching "<span className="text-primary">{search}</span>"
            </span>
            <button onClick={() => setSearch('')} className="ml-auto text-primary hover:underline">Clear filter</button>
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-xl shadow-editorial p-8 md:p-12 overflow-x-auto relative">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-on-surface-variant text-[40px]">search_off</span>
              <p className="font-body-md text-body-md text-on-surface-variant mt-4">No vendors match your search.</p>
              <button onClick={() => setSearch('')} className="mt-3 text-primary hover:underline text-sm">Clear search</button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30 w-1/4">Vendor Name</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30">Categories</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30">Location</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30">Contact</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30 text-right">PO Volume</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30 text-right pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-primary">
                {filtered.map((v, idx) => (
                  <tr key={v.id} className="group cursor-pointer hover:bg-surface-bright transition-colors duration-200 border-b border-outline-variant/20 last:border-0 animate-fade-in-up" style={{ animationDelay: `${Math.min((idx + 1) * 60, 600)}ms` }} onClick={() => openDrawer(v.id)}>
                    <td className="py-6 pr-6">
                      <div className="font-data-lg text-data-lg font-medium mb-1 group-hover:text-tertiary-container transition-colors">{v.name}</div>
                      <div className="font-mono-data text-mono-data text-on-surface-variant">{v.code}</div>
                    </td>
                    <td className="py-6 pr-6 text-on-surface-variant">{v.categories}</td>
                    <td className="py-6 pr-6 text-on-surface-variant">
                      <div>{v.city}</div>
                      <div className="font-mono-data text-mono-data text-on-surface-variant/70 mt-1">{v.country}</div>
                    </td>
                    <td className="py-6 pr-6">
                      <div>{v.contact}</div>
                      <div className="text-on-surface-variant text-sm mt-1">{v.email}</div>
                    </td>
                    <td className="py-6 pr-6 text-right font-mono-data text-mono-data text-primary">
                      {fmt(v.poVolume)}
                    </td>
                    <td className="py-6 text-right pr-4">
                      <span className={`inline-block px-3 py-1 font-label-caps text-label-caps rounded-full ${STATUS_CLASS[v.statusKind]}`}>{STATUS_LABEL[v.statusKind]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-8 flex justify-end items-center gap-4 text-on-surface-variant font-body-md text-sm">
          <span>Rows per page: 10</span>
          <span className="mx-4">1-{filtered.length} of {vendors.length}</span>
          <div className="flex gap-2">
            <button className="p-1 hover:text-primary transition-colors disabled:opacity-30" disabled><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
            <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-primary/10 backdrop-blur-[2px] z-50 transition-opacity duration-300"
          onClick={closeDrawer}
        ></div>
      )}

      {/* Slide-over Detail Drawer */}
      {drawerVendor && (
        <aside
          className={`fixed top-0 right-0 h-screen w-full sm:w-[480px] md:w-[40%] md:max-w-[640px] bg-surface-container-lowest shadow-drawer z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] overflow-y-auto flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
          role="dialog"
          aria-modal="true"
          aria-label="Vendor details"
        >
          <div className="sticky top-0 bg-surface-container-lowest/80 backdrop-blur-md px-10 py-8 flex justify-between items-start border-b border-outline-variant/20 z-10">
            <div>
              <span className={`inline-block px-3 py-1 font-label-caps text-label-caps rounded-full mb-4 ${STATUS_CLASS[drawerVendor.statusKind]}`}>{STATUS_LABEL[drawerVendor.statusKind]}</span>
              <h3 className="font-display-md text-display-md text-primary leading-tight">{drawerVendor.name}</h3>
              <p className="font-mono-data text-mono-data text-on-surface-variant mt-2">{drawerVendor.code} • {drawerVendor.city}, {drawerVendor.country}</p>
            </div>
            <button className="p-2 -mr-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-bright" onClick={closeDrawer} aria-label="Close vendor details">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-10 flex-1">
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 mb-16">
              <div>
                <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-2">Primary Contact</h4>
                <p className="font-data-lg text-data-lg text-primary">{drawerVendor.contact}</p>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{drawerVendor.email}</p>
              </div>
              <div>
                <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-2">HQ Address</h4>
                <p className="font-body-md text-body-md text-primary leading-relaxed">
                  {drawerVendor.city}<br/>
                  {drawerVendor.country}
                </p>
              </div>
              <div>
                <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-2">GST / VAT</h4>
                <p className="font-mono-data text-mono-data text-primary">{drawerVendor.gst}</p>
              </div>
              <div>
                <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-2">Payment Terms</h4>
                <p className="font-body-md text-body-md text-primary">{drawerVendor.paymentTerms}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-16">
              <div className="bg-surface-bright rounded-lg p-5">
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Rating</p>
                <p className="font-display-md text-display-md text-primary leading-none">{drawerVendor.rating.toFixed(1)}</p>
              </div>
              <div className="bg-surface-bright rounded-lg p-5">
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">On-time</p>
                <p className="font-display-md text-display-md text-primary leading-none">{drawerVendor.onTimeRate}%</p>
              </div>
              <div className="bg-surface-bright rounded-lg p-5">
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">YTD Volume</p>
                <p className="font-data-lg text-data-lg text-primary leading-tight pt-1">{fmt(drawerVendor.poVolume)}</p>
              </div>
            </div>

            <div className="mb-16">
              <h4 className="font-headline-sm text-headline-sm text-primary mb-6">Supplied Categories</h4>
              <div className="flex flex-wrap gap-3">
                {drawerVendor.categories.split(',').map((c) => c.trim()).filter(Boolean).map((c) => (
                  <span key={c} className="px-4 py-2 border border-outline-variant/40 rounded font-body-md text-sm text-primary">{c}</span>
                ))}
              </div>
            </div>

            <div className="bg-surface-bright rounded-lg p-8 relative overflow-hidden">
              <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-6">Recent Activity</h4>
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[7px] before:w-[1px] before:bg-outline-variant/30">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  </div>
                  <p className="font-body-md text-body-md text-primary">Joined VendorBridge</p>
                  <p className="font-body-md text-sm text-on-surface-variant mt-1">{fmtDate(drawerVendor.joined)}</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-surface-container-lowest border border-outline-variant"></div>
                  <p className="font-body-md text-body-md text-primary">Last compliance check</p>
                  <p className="font-body-md text-sm text-on-surface-variant mt-1">On file</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 mt-auto border-t border-outline-variant/10 flex justify-end gap-4">
            <button
              onClick={() => { closeDrawer(); toast.info('Edit profile for ' + drawerVendor.name); }}
              className="px-6 py-3 font-label-caps text-label-caps text-primary hover:bg-surface-bright rounded transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={() => { closeDrawer(); navigate('/purchase-orders'); toast.success('Creating new PO for ' + drawerVendor.name); }}
              className="px-6 py-3 font-label-caps text-label-caps bg-primary-container text-on-primary rounded hover:bg-tertiary transition-colors"
            >
              Create PO
            </button>
          </div>
        </aside>
      )}

      {/* Add Vendor Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setAddOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Add new vendor" className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">add_business</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Add new vendor</h3>
                <p className="font-body-md text-sm text-on-surface-variant">Onboard a new supplier. Compliance review will be triggered automatically.</p>
              </div>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">Vendor name *</span>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all" placeholder="e.g. Maison Lumière SARL"/>
              </label>
              <label className="block">
                <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">Categories</span>
                <input value={form.categories} onChange={(e) => setForm((f) => ({ ...f, categories: e.target.value }))} className="w-full border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all" placeholder="Leather, Hardware, Packaging"/>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">Primary contact</span>
                  <input value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} className="w-full border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all" placeholder="Full name"/>
                </label>
                <label className="block">
                  <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">Email</span>
                  <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} type="email" className="w-full border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all" placeholder="contact@vendor.com"/>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setAddOpen(false)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Cancel</button>
              <button onClick={submitAdd} className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-caps text-label-caps hover:bg-tertiary transition-colors">Add vendor</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Vendors;
