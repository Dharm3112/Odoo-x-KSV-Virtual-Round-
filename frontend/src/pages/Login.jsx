import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LIST } from '../context/AuthContext';

const ForgotPasswordModal = ({ onClose }) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'loading', message: '' });
    const res = await forgotPassword({ email });
    if (res.ok) setStatus({ state: 'success', message: res.message });
    else setStatus({ state: 'error', message: res.message });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-sm animate-fade-in-up" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] w-full max-w-md p-8 md:p-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-display-md text-display-md text-on-surface mb-1">Reset password</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">We'll email you a secure link to set a new password.</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-bright" aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {status.state === 'success' ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 rounded bg-secondary-container/40 text-on-surface">
              <span className="material-symbols-outlined text-secondary">mark_email_read</span>
              <p className="font-body-md text-body-md">{status.message}</p>
            </div>
            <button onClick={onClose} className="bg-primary text-on-primary font-label-caps text-label-caps py-3 rounded hover:bg-black transition-colors">
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 group">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="reset-email">Email address</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-minimal font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50"
                placeholder="name@enterprise.com"
                required
                autoFocus
              />
            </div>
            {status.state === 'error' && (
              <p className="font-mono-data text-mono-data text-error">{status.message}</p>
            )}
            <button type="submit" disabled={status.state === 'loading'} className="bg-primary text-on-primary font-label-caps text-label-caps py-3 rounded hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {status.state === 'loading' ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Sending...
                </>
              ) : (
                <>
                  Send reset link
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({ field: null, message: '' });

  React.useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const onChange = (key) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: v }));
    if (error.field === key) setError({ field: null, message: '' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError({ field: null, message: '' });
    const res = await login(form);
    setSubmitting(false);
    if (!res.ok) {
      setError({ field: res.field, message: res.message });
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  const fillDemo = (email) => setForm((f) => ({ ...f, email, password: 'demo1234' }));

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Left visual panel */}
      <aside className="hidden lg:flex w-1/2 relative overflow-hidden bg-primary-container">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05), transparent 50%)" }} />
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <Link to="/login" className="flex flex-col gap-1">
            <span className="font-display-md text-display-md text-on-secondary font-bold tracking-tight leading-none">VendorBridge</span>
            <span className="font-label-caps text-label-caps text-on-secondary/70 mt-1">Enterprise Resource Planning</span>
          </Link>
          <div className="flex flex-col gap-8 max-w-md">
            <span className="font-label-caps text-label-caps text-on-secondary/60 uppercase tracking-[0.2em]">Procurement, refined.</span>
            <h2 className="font-display-lg text-display-lg text-on-secondary leading-[1.1] tracking-tight">Orchestrate vendors, RFQs, and approvals in one editorial workspace.</h2>
            <p className="font-body-md text-body-md text-on-secondary/70 leading-relaxed">Role-based access for administrators, managers, officers, and auditors — built for global procurement teams.</p>
          </div>
          <div className="flex flex-col gap-3 text-on-secondary/60 font-mono-data text-mono-data">
            <span>© 2026 VendorBridge Master</span>
            <span>SOC 2 Type II · ISO 27001</span>
          </div>
        </div>
      </aside>

      {/* Right form panel */}
      <main className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[480px] flex flex-col">
          <div className="lg:hidden mb-10 text-center">
            <h1 className="font-display-md text-display-md text-on-surface">VendorBridge</h1>
            <p className="font-mono-data text-mono-data text-on-surface-variant uppercase tracking-widest mt-1">Enterprise Resource Planning</p>
          </div>

          <header className="mb-10 animate-fade-in-up delay-100">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em]">Secure Sign In</span>
            <h2 className="font-display-md text-display-md text-on-surface mt-3 mb-2">Welcome back</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Authenticate to access your procurement workspace.</p>
          </header>

          <form onSubmit={onSubmit} className="flex flex-col gap-7" noValidate>
            <div className="flex flex-col gap-2 group animate-fade-in-up delay-200">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="email">Work email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">mail</span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={onChange('email')}
                  className={`input-minimal w-full pl-8 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 ${error.field === 'email' ? 'border-error' : ''}`}
                  placeholder="name@enterprise.com"
                  required
                />
              </div>
              {error.field === 'email' && (
                <span className="font-mono-data text-mono-data text-error flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {error.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 group animate-fade-in-up delay-300">
              <div className="flex items-center justify-between">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="password">Password</label>
                <button type="button" onClick={() => setShowForgot(true)} className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors normal-case tracking-normal">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">lock</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={onChange('password')}
                  className={`input-minimal w-full pl-8 pr-10 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 ${error.field === 'password' ? 'border-error' : ''}`}
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {error.field === 'password' && (
                <span className="font-mono-data text-mono-data text-error flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {error.message}
                </span>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none animate-fade-in-up delay-400">
              <span className="relative inline-block w-10 h-5">
                <input type="checkbox" checked={form.remember} onChange={onChange('remember')} className="peer sr-only" />
                <span className="absolute inset-0 bg-surface-variant rounded-full transition-colors peer-checked:bg-primary" />
                <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant">Keep me signed in on this device</span>
            </label>

            <button type="submit" disabled={submitting} className="w-full bg-primary text-on-primary rounded py-4 font-label-caps text-label-caps tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2 group disabled:opacity-60 animate-fade-in-up delay-500">
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Authenticating...
                </>
              ) : (
                <>
                  Authenticate
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </>
              )}
            </button>

            <p className="text-center font-body-md text-body-md text-on-surface-variant animate-fade-in-up delay-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:text-black transition-colors border-b border-primary pb-0.5">Create one</Link>
            </p>
          </form>

          <section className="mt-12 pt-8 border-t border-outline-variant/30">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-4">Demo credentials</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_LIST.map((r) => (
                <button key={r.id} type="button" onClick={() => fillDemo(`${r.id}@vendorbridge.com`)} className="text-left p-3 rounded border border-outline-variant/30 hover:border-primary hover:bg-surface-bright transition-colors group">
                  <span className={`inline-block px-2 py-0.5 rounded-full font-mono-data text-[10px] uppercase tracking-wider ${r.accent}`}>{r.id}</span>
                  <p className="font-body-md text-sm text-on-surface mt-2 group-hover:text-primary transition-colors">{r.name}</p>
                  <p className="font-mono-data text-[11px] text-on-surface-variant mt-0.5">{r.id}@vendorbridge.com</p>
                </button>
              ))}
            </div>
            <p className="font-mono-data text-mono-data text-on-surface-variant mt-3">Password: <span className="text-on-surface">demo1234</span></p>
          </section>
        </div>
      </main>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
};

export default Login;
