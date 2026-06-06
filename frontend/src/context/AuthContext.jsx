import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'vb_session';

export const ROLES = {
  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access including user management and configuration.',
    accent: 'bg-error-container text-on-error-container',
    home: '/dashboard',
    permissions: ['*'],
  },
  manager: {
    id: 'manager',
    name: 'Procurement Manager',
    description: 'Approves POs, manages vendor relationships, oversees budgets.',
    accent: 'bg-tertiary-container text-on-tertiary-container',
    home: '/approvals',
    permissions: ['dashboard:read', 'vendors:*', 'rfqs:*', 'quotations:*', 'approvals:*', 'purchase-orders:read', 'reports:read', 'activity:read'],
  },
  officer: {
    id: 'officer',
    name: 'Procurement Officer',
    description: 'Creates RFQs, manages quotations, raises purchase orders.',
    accent: 'bg-secondary-container text-on-secondary-container',
    home: '/rfqs',
    permissions: ['dashboard:read', 'vendors:read', 'rfqs:*', 'quotations:read', 'approvals:read', 'purchase-orders:*', 'activity:read'],
  },
  vendor: {
    id: 'vendor',
    name: 'Vendor',
    description: 'Responds to RFQs, tracks RFQ status, views awarded POs.',
    accent: 'bg-primary-container text-on-primary-container',
    home: '/vendor-quotation',
    permissions: ['vendor-quotation:*', 'quotations:read', 'purchase-orders:read', 'activity:read'],
  },
};

export const ROLE_LIST = Object.values(ROLES);

const emailIsValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const inferRoleFromEmail = (email) => {
  const lower = (email || '').toLowerCase();
  if (lower.startsWith('admin')) return 'admin';
  if (lower.startsWith('manager') || lower.startsWith('head')) return 'manager';
  if (lower.startsWith('vendor')) return 'vendor';
  return 'officer';
};

const buildUser = ({ email, firstName, lastName, role, phone, country }) => {
  const safeRole = ROLES[role] ? role : 'officer';
  const fullName = firstName && lastName
    ? `${firstName} ${lastName}`.trim()
    : (email.split('@')[0] || 'User').replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: `u_${Date.now()}`,
    email,
    name: fullName,
    firstName: firstName || fullName.split(' ')[0] || '',
    lastName: lastName || fullName.split(' ').slice(1).join(' ') || '',
    initials: fullName.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join(''),
    role: safeRole,
    phone: phone || '',
    country: country || '',
    createdAt: new Date().toISOString(),
  };
};

const recomputeInitials = (name) => name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join('');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.email && ROLES[parsed.role]) {
          setUser(parsed);
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user, hydrated]);

  const login = async ({ email, password, remember = true }) => {
    await new Promise((r) => setTimeout(r, 700));
    if (!email || !password) {
      return { ok: false, field: !email ? 'email' : 'password', message: 'Please enter both email and password.' };
    }
    if (!emailIsValid(email)) {
      return { ok: false, field: 'email', message: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return { ok: false, field: 'password', message: 'Password must be at least 6 characters.' };
    }
    const role = inferRoleFromEmail(email);
    const newUser = buildUser({ email, role });
    setUser(newUser);
    if (remember) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    }
    return { ok: true, user: newUser };
  };

  const signup = async ({ firstName, lastName, email, password, role }) => {
    await new Promise((r) => setTimeout(r, 800));
    if (!firstName || !lastName) {
      return { ok: false, field: !firstName ? 'firstName' : 'lastName', message: 'Please enter your full name.' };
    }
    if (!emailIsValid(email)) {
      return { ok: false, field: 'email', message: 'Please enter a valid corporate email.' };
    }
    if (!password || password.length < 8) {
      return { ok: false, field: 'password', message: 'Password must be at least 8 characters.' };
    }
    if (!ROLES[role]) {
      return { ok: false, field: 'role', message: 'Please choose a role.' };
    }
    const newUser = buildUser({ email, firstName, lastName, role });
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return { ok: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const forgotPassword = async ({ email }) => {
    await new Promise((r) => setTimeout(r, 700));
    if (!emailIsValid(email)) {
      return { ok: false, message: 'Please enter a valid email address.' };
    }
    return { ok: true, message: `A reset link has been sent to ${email}. Check your inbox.` };
  };

  const updateProfile = async (patch) => {
    await new Promise((r) => setTimeout(r, 400));
    if (!user) return { ok: false, message: 'Not signed in.' };
    if (patch.email && !emailIsValid(patch.email)) {
      return { ok: false, field: 'email', message: 'Please enter a valid email address.' };
    }
    const firstName = patch.firstName ?? user.firstName;
    const lastName = patch.lastName ?? user.lastName;
    const name = patch.name || `${firstName} ${lastName}`.trim();
    const next = {
      ...user,
      ...patch,
      name,
      firstName,
      lastName,
      initials: recomputeInitials(name),
    };
    setUser(next);
    return { ok: true, user: next };
  };

  const can = (permission) => {
    if (!user) return false;
    const perms = ROLES[user.role]?.permissions || [];
    if (perms.includes('*')) return true;
    if (perms.includes(permission)) return true;
    const [resource] = permission.split(':');
    if (perms.includes(`${resource}:*`)) return true;
    return false;
  };

  const value = { user, hydrated, login, signup, logout, forgotPassword, updateProfile, can, roles: ROLE_LIST, role: user ? ROLES[user.role] : null };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
