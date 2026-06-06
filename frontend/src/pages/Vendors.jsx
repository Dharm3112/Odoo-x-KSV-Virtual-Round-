import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../hooks/useToasts.jsx';
import { useFormatCurrency, useFormatDate } from '../utils/format';
import { exportVendorsPDF } from '../utils/export';
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

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'approved', label: 'Approved' },
  { id: 'pending', label: 'Pending Audit' },
  { id: 'inactive', label: 'Inactive' },
];

const SORT_OPTIONS = [
  { id: 'name', label: 'Name (A–Z)' },
  { id: 'volume-desc', label: 'PO volume (high → low)' },
  { id: 'volume-asc', label: 'PO volume (low → high)' },
  { id: 'rating-desc', label: 'Rating (high → low)' },
  { id: 'joined-desc', label: 'Newest first' },
  { id: 'joined-asc', label: 'Oldest first' },
];

const STATUS_OPTIONS = [
  { id: 'approved', label: 'Approved' },
  { id: 'pending', label: 'Pending Audit' },
  { id: 'inactive', label: 'Inactive' },
];

const COUNTRIES = Array.from(new Set(VENDORS.map((v) => v.country))).sort();

const CATEGORIES = Array.from(new Set(
  VENDORS.flatMap((v) => v.categories.split(',').map((c) => c.trim()).filter(Boolean))
)).sort();

const emptyForm = { name: '', categories: '', country: 'United Kingdom', city: '', contact: '', email: '', gst: '', paymentTerms: 'Net 30' };

const Vendors = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const fmt = useFormatCurrency();
  const fmtDate = useFormatDate();
  const [vendors, setVendors] = useState(VENDORS);
  const [drawerVendorId, setDrawerVendorId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [selected, setSelected] = useState(new Set());
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openStatusMenuId, setOpenStatusMenuId] = useState(null);
  const menuRef = useRef(null);
  const statusMenuRef = useRef(null);

  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // vendor id | 'bulk' | null

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      openAdd();
      const next = new URLSearchParams(searchParams);
      next.delete('add');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) setOpenStatusMenuId(null);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const counts = useMemo(() => {
    return {
      all: vendors.length,
      approved: vendors.filter((v) => v.statusKind === 'approved').length,
      pending: vendors.filter((v) => v.statusKind === 'pending').length,
      inactive: vendors.filter((v) => v.statusKind === 'inactive').length,
    };
  }, [vendors]);

  const filtered = useMemo(() => {
    let list = vendors;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((v) => {
        const hay = `${v.name} ${v.code} ${v.categories} ${v.country} ${v.city} ${v.contact} ${v.email} ${v.gst} ${v.status} ${v.paymentTerms}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (statusFilter !== 'all') {
      list = list.filter((v) => v.statusKind === statusFilter);
    }
    if (categoryFilter !== 'all') {
      list = list.filter((v) => v.categories.split(',').map((c) => c.trim()).includes(categoryFilter));
    }
    if (countryFilter !== 'all') {
      list = list.filter((v) => v.country === countryFilter);
    }
    const sorted = [...list];
    switch (sort) {
      case 'volume-desc': sorted.sort((a, b) => b.poVolume - a.poVolume); break;
      case 'volume-asc': sorted.sort((a, b) => a.poVolume - b.poVolume); break;
      case 'rating-desc': sorted.sort((a, b) => b.rating - a.rating); break;
      case 'joined-desc': sorted.sort((a, b) => new Date(b.joined) - new Date(a.joined)); break;
      case 'joined-asc': sorted.sort((a, b) => new Date(a.joined) - new Date(b.joined)); break;
      case 'name':
      default: sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [vendors, search, statusFilter, categoryFilter, countryFilter, sort]);

  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (categoryFilter !== 'all' ? 1 : 0) + (countryFilter !== 'all' ? 1 : 0);

  const clearAllFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setCountryFilter('all');
  };

  const openDrawer = (id) => {
    setDrawerVendorId(id);
    setIsDrawerOpen(true);
    setOpenMenuId(null);
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

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalMode('add');
  };

  const openEdit = (vendor) => {
    setForm({
      name: vendor.name,
      categories: vendor.categories,
      country: vendor.country,
      city: vendor.city,
      contact: vendor.contact,
      email: vendor.email,
      gst: vendor.gst,
      paymentTerms: vendor.paymentTerms,
    });
    setEditingId(vendor.id);
    setModalMode('edit');
    setOpenMenuId(null);
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
    setForm(emptyForm);
  };

  const submitForm = () => {
    if (!form.name.trim()) {
      toast.error('Vendor name is required.');
      return;
    }
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (modalMode === 'add') {
      const code = `VND-${Math.floor(1000 + Math.random() * 9000)}-XX`;
      const newVendor = {
        id: `v${Date.now()}`,
        name: form.name.trim(),
        code,
        categories: form.categories.trim() || 'Uncategorized',
        gst: form.gst.trim() || 'Pending verification',
        contact: form.contact.trim() || '—',
        email: form.email.trim() || '—',
        country: form.country,
        city: form.city.trim() || '—',
        status: 'Pending Audit',
        statusKind: 'pending',
        rating: 0,
        onTimeRate: 0,
        poVolume: 0,
        joined: new Date().toISOString().slice(0, 10),
        paymentTerms: form.paymentTerms || 'Net 30',
      };
      setVendors((arr) => [newVendor, ...arr]);
      toast.success(`${newVendor.name} added to vendor directory.`);
    } else if (modalMode === 'edit' && editingId) {
      setVendors((arr) => arr.map((v) => v.id === editingId ? {
        ...v,
        name: form.name.trim(),
        categories: form.categories.trim() || v.categories,
        gst: form.gst.trim() || v.gst,
        contact: form.contact.trim() || v.contact,
        email: form.email.trim() || v.email,
        country: form.country,
        city: form.city.trim() || v.city,
        paymentTerms: form.paymentTerms || v.paymentTerms,
      } : v));
      toast.success(`${form.name.trim()} updated.`);
    }
    closeModal();
  };

  const changeStatus = (vendor, newKind) => {
    setVendors((arr) => arr.map((v) => v.id === vendor.id ? { ...v, statusKind: newKind, status: STATUS_LABEL[newKind] } : v));
    setOpenStatusMenuId(null);
    setOpenMenuId(null);
    toast.success(`${vendor.name} → ${STATUS_LABEL[newKind]}`);
  };

  const bulkChangeStatus = (newKind) => {
    const ids = new Set(selected);
    setVendors((arr) => arr.map((v) => ids.has(v.id) ? { ...v, statusKind: newKind, status: STATUS_LABEL[newKind] } : v));
    setSelected(new Set());
    toast.success(`${ids.size} vendor${ids.size === 1 ? '' : 's'} → ${STATUS_LABEL[newKind]}`);
  };

  const confirmDelete = () => {
    if (deleteConfirm === 'bulk') {
      const ids = new Set(selected);
      setVendors((arr) => arr.filter((v) => !ids.has(v.id)));
      toast.success(`${ids.size} vendor${ids.size === 1 ? '' : 's'} removed.`);
      setSelected(new Set());
    } else if (deleteConfirm) {
      const v = vendors.find((x) => x.id === deleteConfirm);
      setVendors((arr) => arr.filter((x) => x.id !== deleteConfirm));
      if (v) toast.success(`${v.name} removed.`);
      if (drawerVendorId === deleteConfirm) closeDrawer();
    }
    setDeleteConfirm(null);
    setOpenMenuId(null);
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((v) => v.id)));
    }
  };
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onExportPDF = async () => {
    const list = filtered;
    if (list.length === 0) {
      toast.error('No vendors to export.');
      return;
    }
    const totals = list.reduce((s, v) => s + v.poVolume, 0);
    try {
      await exportVendorsPDF({
        rows: list,
        totalCount: vendors.length,
        byStatus: {
          approved: vendors.filter((v) => v.statusKind === 'approved').length,
          pending: vendors.filter((v) => v.statusKind === 'pending').length,
          inactive: vendors.filter((v) => v.statusKind === 'inactive').length,
        },
        totalVolume: fmt(totals),
        search: search.trim(),
        statusFilter: statusFilter !== 'all' ? STATUS_LABEL[statusFilter] : '',
        categoryFilter: categoryFilter !== 'all' ? categoryFilter : '',
        countryFilter: countryFilter !== 'all' ? countryFilter : '',
        filename: `vendor-directory-${new Date().toISOString().slice(0, 10)}.pdf`,
      });
      toast.success(`Exported ${list.length} vendor${list.length === 1 ? '' : 's'} to PDF.`);
    } catch (err) {
      console.error('Vendor PDF export failed', err);
      toast.error(`Could not generate PDF: ${err?.message || 'unknown error'}`);
    }
  };

  const drawerVendor = vendors.find((v) => v.id === drawerVendorId) || vendors[0];
  const deleteTargetVendor = deleteConfirm && deleteConfirm !== 'bulk' ? vendors.find((v) => v.id === deleteConfirm) : null;

  return (
    <>
      <div className="container-page">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
          <div>
            <h2 className="font-display-lg text-display-lg text-primary mb-2">Vendor Directory</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">Manage your network of luxury suppliers, track compliance, and orchestrate global logistics.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex items-center w-72">
              <span className="material-symbols-outlined absolute left-0 text-on-surface-variant text-[18px]">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-minimal w-full pl-8 pb-2 font-body-md text-body-md text-primary placeholder:text-on-surface-variant/50"
                placeholder="Search vendors…"
                type="text"
              />
              {search && (
                <button onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-0 text-on-surface-variant hover:text-primary p-1">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
            <button onClick={onExportPDF} className="bg-transparent text-primary border border-outline-variant px-5 py-3 rounded font-label-caps text-label-caps tracking-wider hover:bg-surface-variant transition-colors duration-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              Export PDF
            </button>
            <button onClick={openAdd} className="bg-primary-container text-on-primary px-6 py-3 rounded font-label-caps text-label-caps tracking-wider hover:bg-tertiary transition-colors duration-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Vendor
            </button>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap" ref={menuRef}>
            {STATUS_FILTERS.map((s) => {
              const isActive = statusFilter === s.id;
              const count = counts[s.id];
              return (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-label-caps text-label-caps transition-colors border ${
                    isActive
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-transparent text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary'
                  }`}
                  aria-pressed={isActive}
                >
                  {s.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono-data ${isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 flex-wrap lg:ml-auto">
            <FilterDropdown
              label="Category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[{ id: 'all', label: 'All categories' }, ...CATEGORIES.map((c) => ({ id: c, label: c }))]}
            />
            <FilterDropdown
              label="Country"
              value={countryFilter}
              onChange={setCountryFilter}
              options={[{ id: 'all', label: 'All countries' }, ...COUNTRIES.map((c) => ({ id: c, label: c }))]}
            />
            <FilterDropdown
              label="Sort"
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
            />
          </div>
        </div>

        {/* Active filter / result summary */}
        <div className="mb-4 flex items-center gap-3 text-sm text-on-surface-variant font-mono-data flex-wrap">
          <span className="material-symbols-outlined text-[16px]">filter_list</span>
          <span>
            Showing <span className="text-primary font-medium">{filtered.length}</span> of {vendors.length} vendor{vendors.length === 1 ? '' : 's'}
            {activeFilterCount > 0 && (
              <>
                {' '}({activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} active)
                <button onClick={clearAllFilters} className="ml-3 text-primary hover:underline">Clear all</button>
              </>
            )}
          </span>
          {selected.size > 0 && (
            <span className="ml-auto inline-flex items-center gap-3 px-3 py-1 bg-primary-container text-on-primary-container rounded-full">
              <span className="material-symbols-outlined text-[16px]">check_box</span>
              {selected.size} selected
              <button onClick={() => setSelected(new Set())} className="ml-2 hover:text-error" aria-label="Clear selection">×</button>
            </span>
          )}
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="mb-4 flex items-center gap-3 p-3 bg-primary-container/20 border border-primary/20 rounded-lg flex-wrap">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Bulk actions:</span>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => bulkChangeStatus(s.id)}
                className="px-3 py-1.5 rounded-full text-xs bg-surface-container-lowest text-on-surface hover:bg-primary hover:text-on-primary transition-colors border border-outline-variant/30"
              >
                Set {s.label}
              </button>
            ))}
            <button
              onClick={() => setDeleteConfirm('bulk')}
              className="px-3 py-1.5 rounded-full text-xs bg-surface-container-lowest text-error hover:bg-error hover:text-on-error transition-colors border border-error/30 ml-auto"
            >
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">delete</span>
                Remove {selected.size}
              </span>
            </button>
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-xl shadow-editorial p-8 md:p-12 overflow-x-auto relative">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-on-surface-variant text-[40px]">search_off</span>
              <p className="font-body-md text-body-md text-on-surface-variant mt-4">No vendors match your search and filters.</p>
              <button onClick={() => { setSearch(''); clearAllFilters(); }} className="mt-3 text-primary hover:underline text-sm">Clear search & filters</button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="w-10 pb-6 border-b border-outline-variant/30">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={selected.size > 0 && selected.size === filtered.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30 w-1/4">Vendor</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30">Categories</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30">Location</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30">Contact</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30">GST / VAT</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30 text-right">PO Volume</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30 text-center">Status</th>
                  <th className="w-10 pb-6 border-b border-outline-variant/30"></th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-primary">
                {filtered.map((v, idx) => (
                  <tr
                    key={v.id}
                    className={`group hover:bg-surface-bright transition-colors duration-200 border-b border-outline-variant/20 last:border-0 animate-fade-in-up ${selected.has(v.id) ? 'bg-primary-container/10' : ''}`}
                    style={{ animationDelay: `${Math.min((idx + 1) * 40, 400)}ms` }}
                  >
                    <td className="py-5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${v.name}`}
                        checked={selected.has(v.id)}
                        onChange={() => toggleSelect(v.id)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="py-5 pr-4 cursor-pointer" onClick={() => openDrawer(v.id)}>
                      <div className="font-data-lg text-data-lg font-medium mb-1 group-hover:text-tertiary-container transition-colors">{v.name}</div>
                      <div className="font-mono-data text-mono-data text-on-surface-variant">{v.code}</div>
                    </td>
                    <td className="py-5 pr-4 text-on-surface-variant cursor-pointer" onClick={() => openDrawer(v.id)}>
                      <div className="flex flex-wrap gap-1.5">
                        {v.categories.split(',').map((c) => c.trim()).filter(Boolean).slice(0, 3).map((c) => (
                          <span key={c} className="px-2 py-0.5 text-[11px] border border-outline-variant/30 rounded font-mono-data text-on-surface-variant">{c}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-5 pr-4 text-on-surface-variant cursor-pointer" onClick={() => openDrawer(v.id)}>
                      <div>{v.city}</div>
                      <div className="font-mono-data text-mono-data text-on-surface-variant/70 mt-1">{v.country}</div>
                    </td>
                    <td className="py-5 pr-4 cursor-pointer" onClick={() => openDrawer(v.id)}>
                      <div>{v.contact}</div>
                      <div className="text-on-surface-variant text-sm mt-1">{v.email}</div>
                    </td>
                    <td className="py-5 pr-4 font-mono-data text-mono-data text-on-surface-variant cursor-pointer" onClick={() => openDrawer(v.id)}>{v.gst}</td>
                    <td className="py-5 pr-4 text-right font-mono-data text-mono-data text-primary cursor-pointer" onClick={() => openDrawer(v.id)}>
                      {fmt(v.poVolume)}
                    </td>
                    <td className="py-5 text-center cursor-pointer" onClick={() => openDrawer(v.id)}>
                      <span className={`inline-block px-3 py-1 font-label-caps text-label-caps rounded-full ${STATUS_CLASS[v.statusKind]}`}>{STATUS_LABEL[v.statusKind]}</span>
                    </td>
                    <td className="py-5 relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenuId((cur) => (cur === v.id ? null : v.id))}
                        className="p-1 text-outline-variant hover:text-primary rounded transition-colors"
                        aria-label={`More actions for ${v.name}`}
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === v.id}
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                      {openMenuId === v.id && (
                        <div role="menu" className="absolute right-0 top-12 w-52 bg-surface-container-lowest rounded-lg shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] border border-outline-variant/20 z-30 py-1">
                          <button onClick={() => { openDrawer(v.id); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright transition-colors text-left">
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">open_in_new</span>
                            <span className="font-body-md text-sm text-on-surface">View details</span>
                          </button>
                          <button onClick={() => openEdit(v)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright transition-colors text-left">
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">edit</span>
                            <span className="font-body-md text-sm text-on-surface">Edit vendor</span>
                          </button>
                          <div className="relative" ref={openStatusMenuId === v.id ? statusMenuRef : null}>
                            <button
                              onClick={() => setOpenStatusMenuId((cur) => (cur === v.id ? null : v.id))}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright transition-colors text-left"
                            >
                              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">flag</span>
                              <span className="font-body-md text-sm text-on-surface flex-1">Change status</span>
                              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">chevron_right</span>
                            </button>
                            {openStatusMenuId === v.id && (
                              <div className="absolute right-full top-0 mr-1 w-44 bg-surface-container-lowest rounded-lg shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] border border-outline-variant/20 z-40 py-1">
                                {STATUS_OPTIONS.map((s) => (
                                  <button
                                    key={s.id}
                                    onClick={() => changeStatus(v, s.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright transition-colors text-left ${v.statusKind === s.id ? 'bg-primary-container/30' : ''}`}
                                  >
                                    <span className={`w-2 h-2 rounded-full ${s.id === 'approved' ? 'bg-[#2e592e]' : s.id === 'pending' ? 'bg-[#b35900]' : 'bg-surface-tint'}`}></span>
                                    <span className="font-body-md text-sm text-on-surface">{s.label}</span>
                                    {v.statusKind === s.id && <span className="material-symbols-outlined text-[16px] text-primary ml-auto">check</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="border-t border-outline-variant/15 my-1"></div>
                          <button onClick={() => { setDeleteConfirm(v.id); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-error-container/40 transition-colors text-left">
                            <span className="material-symbols-outlined text-[18px] text-error">delete</span>
                            <span className="font-body-md text-sm text-error">Delete vendor</span>
                          </button>
                        </div>
                      )}
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

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-primary/10 backdrop-blur-[2px] z-50 transition-opacity duration-300" onClick={closeDrawer}></div>
      )}
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
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 mb-10">
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

            <div className="grid grid-cols-3 gap-4 mb-10">
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

            <div className="mb-10">
              <h4 className="font-headline-sm text-headline-sm text-primary mb-6">Supplied Categories</h4>
              <div className="flex flex-wrap gap-3">
                {drawerVendor.categories.split(',').map((c) => c.trim()).filter(Boolean).map((c) => (
                  <span key={c} className="px-4 py-2 border border-outline-variant/40 rounded font-body-md text-sm text-primary">{c}</span>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h4 className="font-headline-sm text-headline-sm text-primary mb-4">Status timeline</h4>
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[7px] before:w-[1px] before:bg-outline-variant/30">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  </div>
                  <p className="font-body-md text-body-md text-primary">Joined VendorBridge</p>
                  <p className="font-body-md text-sm text-on-surface-variant mt-1">{fmtDate(drawerVendor.joined)}</p>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-surface-container-lowest border border-outline-variant"></div>
                  <p className="font-body-md text-body-md text-primary">Current status: <span className="font-medium">{STATUS_LABEL[drawerVendor.statusKind]}</span></p>
                  <p className="font-body-md text-sm text-on-surface-variant mt-1">As of {fmtDate(new Date().toISOString().slice(0, 10))}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 mt-auto border-t border-outline-variant/10 flex justify-end gap-3">
            <button
              onClick={() => { closeDrawer(); openEdit(drawerVendor); }}
              className="px-6 py-3 font-label-caps text-label-caps text-primary hover:bg-surface-bright rounded transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Profile
            </button>
            <button
              onClick={() => { closeDrawer(); navigate('/purchase-orders'); toast.success('Creating new PO for ' + drawerVendor.name); }}
              className="px-6 py-3 font-label-caps text-label-caps bg-primary-container text-on-primary rounded hover:bg-tertiary transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              Create PO
            </button>
          </div>
        </aside>
      )}

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={modalMode === 'add' ? 'Add new vendor' : 'Edit vendor'} className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">{modalMode === 'add' ? 'add_business' : 'edit'}</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">{modalMode === 'add' ? 'Add new vendor' : 'Edit vendor'}</h3>
                <p className="font-body-md text-sm text-on-surface-variant">{modalMode === 'add' ? 'Onboard a new supplier. Compliance review will be triggered automatically.' : 'Update vendor details. Changes are saved immediately.'}</p>
              </div>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">Vendor name *</span>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all" placeholder="e.g. Maison Lumière SARL"/>
              </label>

              <label className="block">
                <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">Categories</span>
                <input value={form.categories} onChange={(e) => setForm((f) => ({ ...f, categories: e.target.value }))} className="w-full border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all" placeholder="Leather, Hardware, Packaging (comma-separated)"/>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {CATEGORIES.slice(0, 8).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, categories: f.categories ? `${f.categories}, ${c}` : c }))}
                      className="text-[11px] px-2 py-0.5 border border-outline-variant/30 rounded-full text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-colors font-mono-data"
                    >
                      + {c}
                    </button>
                  ))}
                </div>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">Country</span>
                  <select value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="w-full border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all">
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="block">
                  <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">City</span>
                  <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="w-full border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all" placeholder="e.g. London"/>
                </label>
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">GST / VAT</span>
                  <input value={form.gst} onChange={(e) => setForm((f) => ({ ...f, gst: e.target.value }))} className="w-full border border-outline-variant rounded px-4 py-3 bg-transparent font-mono-data text-mono-data text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all" placeholder="e.g. GB 123 4567 89"/>
                </label>
                <label className="block">
                  <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">Payment terms</span>
                  <select value={form.paymentTerms} onChange={(e) => setForm((f) => ({ ...f, paymentTerms: e.target.value }))} className="w-full border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all">
                    <option>Net 15</option>
                    <option>Net 30</option>
                    <option>Net 45</option>
                    <option>Net 60</option>
                    <option>Net 90</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Cancel</button>
              <button onClick={submitForm} className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-caps text-label-caps hover:bg-tertiary transition-colors">
                {modalMode === 'add' ? 'Add vendor' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setDeleteConfirm(null)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirm delete" className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-md p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">delete</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">
                  {deleteConfirm === 'bulk' ? `Remove ${selected.size} vendor${selected.size === 1 ? '' : 's'}?` : `Remove ${deleteTargetVendor?.name || 'this vendor'}?`}
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant">
                  {deleteConfirm === 'bulk'
                    ? 'They will be removed from the directory. Related POs and history are preserved.'
                    : 'They will be removed from the directory. Related POs and history are preserved.'}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-5 py-2.5 rounded-full bg-error text-on-error font-label-caps text-label-caps hover:opacity-90 transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const FilterDropdown = ({ label, value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
  const current = options.find((o) => o.id === value);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border font-label-caps text-label-caps transition-colors ${
          value !== options[0].id
            ? 'bg-primary-container text-on-primary-container border-primary'
            : 'bg-transparent text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="font-mono-data text-[11px] uppercase tracking-widest opacity-70">{label}:</span>
        <span className="truncate max-w-[140px]">{current?.label || label}</span>
        <span className={`material-symbols-outlined text-[16px] transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      {open && (
        <div role="listbox" className="absolute right-0 top-12 w-56 max-h-72 overflow-y-auto bg-surface-container-lowest rounded-lg shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] border border-outline-variant/20 z-30 py-1">
          {options.map((o) => (
            <button
              key={o.id}
              onClick={() => { onChange(o.id); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright transition-colors text-left text-sm font-body-md ${value === o.id ? 'text-primary' : 'text-on-surface'}`}
            >
              {value === o.id && <span className="material-symbols-outlined text-[16px]">check</span>}
              {value !== o.id && <span className="w-4"></span>}
              <span className="truncate">{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vendors;
