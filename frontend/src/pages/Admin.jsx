import React, { useState, useMemo } from 'react';
import { useToast } from '../hooks/useToasts.jsx';
import { vendors as vendorCatalog } from '../data/vendors.js';
import { ROLE_LIST } from '../context/AuthContext.jsx';

const SEED_USERS = [
  { id: 'u_001', name: 'Sarah Jenkins', email: 'sarah.jenkins@vendorbridge.com', role: 'manager', status: 'active', joined: '2024-01-15', lastSeen: '2 minutes ago' },
  { id: 'u_002', name: 'J. Smith', email: 'j.smith@vendorbridge.com', role: 'officer', status: 'active', joined: '2024-02-03', lastSeen: '14 minutes ago' },
  { id: 'u_003', name: 'Elena Russo', email: 'elena.russo@vendorbridge.com', role: 'manager', status: 'active', joined: '2024-02-21', lastSeen: '1 hour ago' },
  { id: 'u_004', name: 'M. Lopez', email: 'm.lopez@vendorbridge.com', role: 'officer', status: 'active', joined: '2024-03-08', lastSeen: '3 hours ago' },
  { id: 'u_005', name: 'Apex Industries Rep', email: 'sales@apex-ind.de', role: 'vendor', status: 'active', joined: '2024-04-12', lastSeen: 'yesterday' },
  { id: 'u_006', name: 'Lumina Textiles Rep', email: 'orders@luminatex.com', role: 'vendor', status: 'active', joined: '2024-04-18', lastSeen: '2 days ago' },
  { id: 'u_007', name: 'K. Tanaka', email: 'k.tanaka@vendorbridge.com', role: 'officer', status: 'inactive', joined: '2024-05-02', lastSeen: '14 days ago' },
  { id: 'u_008', name: 'Admin Console', email: 'admin@vendorbridge.com', role: 'admin', status: 'active', joined: '2023-12-01', lastSeen: 'online' },
];

const Admin = () => {
  const toast = useToast();
  const [tab, setTab] = useState('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState(SEED_USERS);
  const [vendors, setVendors] = useState(vendorCatalog);
  const [vendorStatus, setVendorStatus] = useState('all');
  const [userModal, setUserModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!q) return true;
      return [u.name, u.email, u.role].some((s) => (s || '').toLowerCase().includes(q));
    });
  }, [users, search, roleFilter]);

  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vendors.filter((v) => {
      if (vendorStatus !== 'all' && v.statusKind !== vendorStatus) return false;
      if (!q) return true;
      return [v.name, v.code, v.country, v.city, v.categories].some((s) => (s || '').toLowerCase().includes(q));
    });
  }, [vendors, search, vendorStatus]);

  const stats = useMemo(() => ({
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === 'active').length,
    vendors: vendors.length,
    approvedVendors: vendors.filter((v) => v.statusKind === 'approved').length,
    pendingVendors: vendors.filter((v) => v.statusKind === 'pending').length,
    inactiveVendors: vendors.filter((v) => v.statusKind === 'inactive').length,
  }), [users, vendors]);

  const onUserSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const role = data.get('role');
    const newUser = {
      id: `u_${Date.now()}`,
      name: data.get('name'),
      email: data.get('email'),
      role,
      status: 'active',
      joined: new Date().toISOString().slice(0, 10),
      lastSeen: 'just now',
    };
    setUsers((arr) => [newUser, ...arr]);
    setUserModal(null);
    toast.success(`User ${newUser.name} created with role ${ROLE_LIST.find((r) => r.id === role)?.name}.`);
  };

  const onUserStatusToggle = (id) => {
    setUsers((arr) => arr.map((u) => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    const u = users.find((x) => x.id === id);
    toast.info(`${u.name} ${u.status === 'active' ? 'deactivated' : 'reactivated'}.`);
  };

  const onUserDelete = (id) => {
    const u = users.find((x) => x.id === id);
    setUsers((arr) => arr.filter((x) => x.id !== id));
    setConfirmDelete(null);
    toast.success(`User ${u.name} removed.`);
  };

  const onVendorStatusChange = (id, next) => {
    const v = vendors.find((x) => x.id === id);
    setVendors((arr) => arr.map((x) => x.id === id ? { ...x, statusKind: next, status: next.charAt(0).toUpperCase() + next.slice(1) } : x));
    toast.success(`${v.name} status: ${next}.`);
  };

  return (
    <div className="container-page">
      <div className="mb-8">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em]">System Administration</span>
        <h2 className="font-display-lg text-display-lg text-on-surface mt-2 tracking-tight">Admin Console</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-3 max-w-2xl">Manage users, vendor records, and access controls across the VendorBridge platform.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: 'group', tint: 'bg-primary-container/40' },
          { label: 'Active Users', value: stats.activeUsers, icon: 'person_check', tint: 'bg-secondary-container/40' },
          { label: 'Total Vendors', value: stats.vendors, icon: 'storefront', tint: 'bg-primary-container/40' },
          { label: 'Approved', value: stats.approvedVendors, icon: 'verified', tint: 'bg-secondary-container/40' },
          { label: 'Pending Audit', value: stats.pendingVendors, icon: 'pending', tint: 'bg-tertiary-container/40' },
          { label: 'Inactive', value: stats.inactiveVendors, icon: 'block', tint: 'bg-error-container/40' },
        ].map((s) => (
          <div key={s.label} className={`${s.tint} border border-outline-variant/20 rounded-xl p-5`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">{s.label}</span>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">{s.icon}</span>
            </div>
            <div className="font-data-lg text-data-lg text-on-surface font-medium">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="border-b border-outline-variant mb-6">
        <nav className="flex gap-1" role="tablist">
          {[
            { key: 'users', label: 'User Management', icon: 'manage_accounts' },
            { key: 'vendors', label: 'Vendor Records', icon: 'storefront' },
            { key: 'roles', label: 'Roles & Permissions', icon: 'admin_panel_settings' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3 font-label-caps text-label-caps uppercase tracking-widest transition-colors flex items-center gap-2 -mb-px border-b-2 ${
                tab === t.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'users' && (
        <section>
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-lg bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
                  placeholder="Search users by name, email, or role…"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 border border-outline-variant rounded-lg bg-transparent font-label-caps text-label-caps uppercase tracking-widest text-on-surface"
              >
                <option value="all">All roles</option>
                {ROLE_LIST.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <button
              onClick={() => setUserModal('new')}
              className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-caps text-label-caps uppercase tracking-widest hover:bg-tertiary transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Invite user
            </button>
          </div>

          <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-bright">
                <tr>
                  <th className="px-5 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">User</th>
                  <th className="px-5 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">Role</th>
                  <th className="px-5 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-5 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">Joined</th>
                  <th className="px-5 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">Last seen</th>
                  <th className="px-5 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="6" className="px-5 py-10 text-center text-on-surface-variant">No users match your filters.</td></tr>
                ) : filteredUsers.map((u) => {
                  const roleMeta = ROLE_LIST.find((r) => r.id === u.role);
                  return (
                    <tr key={u.id} className="border-t border-outline-variant/30 hover:bg-surface-bright transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-label-caps text-xs ${roleMeta?.accent || 'bg-primary text-on-primary'}`}>
                            {u.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                          </span>
                          <div>
                            <div className="font-body-md text-sm text-on-surface">{u.name}</div>
                            <div className="font-mono-data text-mono-data text-on-surface-variant">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-label-caps text-[10px] uppercase tracking-widest ${roleMeta?.accent || 'bg-surface-container-high text-on-surface-variant'}`}>
                          {roleMeta?.name}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-caps text-[10px] uppercase tracking-widest ${
                          u.status === 'active' ? 'bg-secondary-container text-secondary' : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-secondary' : 'bg-on-surface-variant'}`}></span>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono-data text-mono-data text-on-surface-variant">{u.joined}</td>
                      <td className="px-5 py-3 font-mono-data text-mono-data text-on-surface-variant">{u.lastSeen}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onUserStatusToggle(u.id)}
                            className="px-3 py-1.5 rounded font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant hover:bg-surface-bright hover:text-primary"
                            title={u.status === 'active' ? 'Deactivate' : 'Reactivate'}
                          >
                            {u.status === 'active' ? 'Deactivate' : 'Reactivate'}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(u.id)}
                            className="px-3 py-1.5 rounded font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant hover:bg-error-container hover:text-error"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'vendors' && (
        <section>
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-lg bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
                  placeholder="Search vendors…"
                />
              </div>
              <select
                value={vendorStatus}
                onChange={(e) => setVendorStatus(e.target.value)}
                className="px-4 py-2.5 border border-outline-variant rounded-lg bg-transparent font-label-caps text-label-caps uppercase tracking-widest text-on-surface"
              >
                <option value="all">All statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <span className="font-mono-data text-mono-data text-on-surface-variant">{filteredVendors.length} vendor(s)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((v) => (
              <div key={v.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">{v.name}</h3>
                    <p className="font-mono-data text-mono-data text-on-surface-variant">{v.code} · {v.city}, {v.country}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full font-label-caps text-[10px] uppercase tracking-widest ${
                    v.statusKind === 'approved' ? 'bg-secondary-container text-secondary'
                    : v.statusKind === 'pending' ? 'bg-tertiary-container text-on-tertiary-container'
                    : 'bg-surface-container-high text-on-surface-variant'
                  }`}>{v.status}</span>
                </div>
                <p className="font-body-md text-sm text-on-surface-variant mb-3">{v.categories}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-data text-mono-data text-on-surface-variant">Rating {v.rating.toFixed(1)} · On-time {v.onTimeRate}%</span>
                  <select
                    value={v.statusKind}
                    onChange={(e) => onVendorStatusChange(v.id, e.target.value)}
                    className="text-xs px-2 py-1 border border-outline-variant rounded font-label-caps uppercase tracking-widest bg-transparent text-on-surface"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'roles' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLE_LIST.map((r) => (
            <div key={r.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">{r.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-label-caps text-[10px] uppercase tracking-widest ${r.accent}`}>{r.id}</span>
              </div>
              <p className="font-body-md text-sm text-on-surface-variant mb-4">{r.description}</p>
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">Permissions</p>
              <div className="flex flex-wrap gap-1.5">
                {r.permissions.map((p) => (
                  <span key={p} className="font-mono-data text-mono-data text-[11px] px-2 py-1 bg-surface-bright rounded text-on-surface">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {userModal === 'new' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setUserModal(null)}>
          <form onSubmit={onUserSubmit} onClick={(e) => e.stopPropagation()} className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-md p-8">
            <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Invite user</h3>
            <p className="font-body-md text-sm text-on-surface-variant mb-6">They'll receive an email to set their password and access the platform.</p>
            <div className="flex flex-col gap-4 mb-6">
              <label className="flex flex-col gap-1">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">Full name</span>
                <input name="name" required className="border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container outline-none" placeholder="Jane Cooper" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">Email</span>
                <input name="email" type="email" required className="border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container outline-none" placeholder="jane@vendorbridge.com" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">Role</span>
                <select name="role" required defaultValue="officer" className="border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container outline-none">
                  {ROLE_LIST.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setUserModal(null)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Cancel</button>
              <button type="submit" className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-caps text-label-caps hover:bg-tertiary transition-colors">Send invite</button>
            </div>
          </form>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setConfirmDelete(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-md p-8">
            <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Remove user?</h3>
            <p className="font-body-md text-sm text-on-surface-variant mb-6">This action cannot be undone. All sessions for this user will be revoked.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Cancel</button>
              <button onClick={() => onUserDelete(confirmDelete)} className="px-5 py-2.5 rounded-full bg-error text-on-error font-label-caps text-label-caps hover:opacity-90 transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
