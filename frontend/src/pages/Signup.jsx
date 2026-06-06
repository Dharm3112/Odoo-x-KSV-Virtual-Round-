import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LIST } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, user } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'officer', country: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({ field: null, message: '' });

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const onChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (error.field === key) setError({ field: null, message: '' });
  };

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return { score: 0, label: 'Empty' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return { score, label: ['Empty', 'Weak', 'Fair', 'Good', 'Strong'][score] };
  })();

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError({ field: null, message: '' });
    const res = await signup(form);
    setSubmitting(false);
    if (!res.ok) {
      setError({ field: res.field, message: res.message });
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col md:flex-row font-body-md antialiased selection:bg-surface-dim selection:text-primary">
      <div className="hidden md:block md:w-5/12 lg:w-1/2 relative min-h-screen overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200&h=1600')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5 mix-blend-multiply" />
        <div className="relative z-10 flex flex-col justify-between p-12 h-full text-white">
          <Link to="/login" className="flex flex-col gap-1">
            <span className="font-display-md text-display-md font-bold tracking-tight leading-none">VendorBridge</span>
            <span className="font-label-caps text-label-caps uppercase opacity-80 mt-1">Master</span>
          </Link>
          <div className="flex flex-col gap-4 max-w-md">
            <h2 className="font-display-lg text-display-lg leading-[1.1] tracking-tight">Establish your master profile.</h2>
            <p className="font-body-md text-body-md opacity-80 leading-relaxed">Gain role-based access to the curated procurement ecosystem. Pick a role that matches your day-to-day.</p>
          </div>
          <p className="font-mono-data text-mono-data opacity-70">© 2026 VendorBridge. All rights reserved.</p>
        </div>
      </div>

      <div className="w-full md:w-7/12 lg:w-1/2 min-h-screen flex items-center justify-center p-6 md:p-container-padding bg-[#FAFAFA] relative overflow-y-auto">
        <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-surface-container-low blur-3xl opacity-50 pointer-events-none" />

        <div className="w-full max-w-[540px] bg-[#FFFFFF] rounded-xl soft-shadow p-8 md:p-12 lg:p-[56px] relative z-10 flex flex-col gap-[40px] my-12">
          <div className="flex flex-col gap-4 animate-fade-in-up delay-100">
            <h1 className="font-display-md text-display-md text-on-surface tracking-tight">Create your account</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Initialize a master profile to unlock the curated VendorBridge ecosystem.</p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-element-gap" noValidate>
            <div className="flex flex-col md:flex-row gap-element-gap animate-fade-in-up delay-200">
              <div className="flex flex-col gap-2 w-full group">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="firstName">First name</label>
                <input id="firstName" type="text" required value={form.firstName} onChange={onChange('firstName')} className={`input-minimal font-body-md text-body-md text-on-surface placeholder:text-surface-tint ${error.field === 'firstName' ? 'border-error' : ''}`} placeholder="Jane" />
              </div>
              <div className="flex flex-col gap-2 w-full group">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="lastName">Last name</label>
                <input id="lastName" type="text" required value={form.lastName} onChange={onChange('lastName')} className={`input-minimal font-body-md text-body-md text-on-surface placeholder:text-surface-tint ${error.field === 'lastName' ? 'border-error' : ''}`} placeholder="Doe" />
              </div>
            </div>
            {error.field === 'firstName' || error.field === 'lastName' ? (
              <p className="font-mono-data text-mono-data text-error -mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{error.message}</p>
            ) : null}

            <div className="flex flex-col gap-2 w-full group animate-fade-in-up delay-300">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="email">Corporate email</label>
              <input id="email" type="email" required value={form.email} onChange={onChange('email')} className={`input-minimal font-body-md text-body-md text-on-surface placeholder:text-surface-tint ${error.field === 'email' ? 'border-error' : ''}`} placeholder="jane.doe@company.com" />
            </div>
            {error.field === 'email' && (
              <p className="font-mono-data text-mono-data text-error -mt-6 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{error.message}</p>
            )}

            <div className="flex flex-col gap-2 w-full group animate-fade-in-up delay-400">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} required value={form.password} onChange={onChange('password')} className={`input-minimal w-full pr-10 font-body-md text-body-md text-on-surface placeholder:text-surface-tint ${error.field === 'password' ? 'border-error' : ''}`} placeholder="At least 8 characters" />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {form.password && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-surface-variant rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${passwordStrength.score <= 1 ? 'bg-error w-1/4' : passwordStrength.score === 2 ? 'bg-tertiary w-2/4' : passwordStrength.score === 3 ? 'bg-secondary w-3/4' : 'bg-primary w-full'}`} />
                  </div>
                  <span className="font-mono-data text-mono-data text-on-surface-variant">{passwordStrength.label}</span>
                </div>
              )}
              {error.field === 'password' && (
                <p className="font-mono-data text-mono-data text-error flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{error.message}</p>
              )}
            </div>

            <fieldset className="flex flex-col gap-3 animate-fade-in-up delay-500">
              <legend className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">Choose your role</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLE_LIST.map((r) => (
                  <label key={r.id} className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${form.role === r.id ? 'border-primary bg-primary-container/5' : 'border-outline-variant/40 hover:border-outline-variant'}`}>
                    <input type="radio" name="role" value={r.id} checked={form.role === r.id} onChange={onChange('role')} className="mt-1 accent-primary" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-data-lg text-data-lg text-on-surface">{r.name}</span>
                      <span className="font-body-md text-sm text-on-surface-variant leading-snug">{r.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-2 w-full group animate-fade-in-up delay-600">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor="country">Country</label>
              <input id="country" type="text" list="countries" value={form.country} onChange={onChange('country')} className="input-minimal font-body-md text-body-md text-on-surface placeholder:text-surface-tint" placeholder="Select Country" />
              <datalist id="countries">
                <option value="United States" />
                <option value="United Kingdom" />
                <option value="Canada" />
                <option value="Australia" />
                <option value="Singapore" />
                <option value="India" />
                <option value="Germany" />
              </datalist>
            </div>

            <div className="mt-2 flex flex-col gap-6 animate-fade-in-up delay-700">
              <button type="submit" disabled={submitting} className="w-full bg-primary-container text-on-secondary font-label-caps text-label-caps py-4 rounded hover:bg-tertiary-container transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-60">
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Initializing...
                  </>
                ) : (
                  <>
                    Initialize profile
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
              <p className="text-center font-mono-data text-mono-data text-on-surface-variant">
                Already have an account? <Link to="/login" className="text-primary hover:text-on-surface transition-colors border-b border-transparent hover:border-primary pb-0.5">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
