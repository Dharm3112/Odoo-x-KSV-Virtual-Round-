import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfileModal = ({ open, onClose }) => {
  const { user, role, updateProfile } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', country: '' });
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
      });
      setStatus({ state: 'idle', message: '' });
      setErrors({});
    }
  }, [open, user]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !user) return null;

  const onChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.phone && !/^[+\d][\d\s\-()]{5,}$/.test(form.phone)) e.phone = 'Enter a valid phone';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus({ state: 'loading', message: '' });
    const res = await updateProfile(form);
    if (res.ok) {
      setStatus({ state: 'success', message: 'Profile updated.' });
      setTimeout(() => onClose(), 700);
    } else {
      setStatus({ state: 'error', message: res.message || 'Update failed.' });
    }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="flex flex-col gap-2 group">
      <label className="font-label-caps text-label-caps text-on-surface-variant uppercase group-focus-within:text-primary transition-colors" htmlFor={`profile-${key}`}>{label}</label>
      <input
        id={`profile-${key}`}
        type={type}
        value={form[key]}
        onChange={onChange(key)}
        placeholder={placeholder}
        className={`input-minimal w-full font-body-md text-body-md text-on-surface placeholder:text-surface-tint ${errors[key] ? 'border-error' : ''}`}
      />
      {errors[key] && <span className="font-mono-data text-mono-data text-error">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-sm animate-fade-in-up" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start p-6 border-b border-outline-variant/20">
          <div>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Account</span>
            <h3 className="font-display-md text-display-md text-on-surface mt-1">Your profile</h3>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-bright" aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 flex items-center gap-4 border-b border-outline-variant/20 bg-surface-bright/40">
          <div className="w-16 h-16 rounded-full bg-primary text-on-primary font-display-md text-display-md flex items-center justify-center shrink-0">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-data-lg text-data-lg text-on-surface truncate">{user.name}</p>
            <p className="font-mono-data text-mono-data text-on-surface-variant truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`font-mono-data text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded ${role?.accent || 'bg-surface-container-high text-on-surface-variant'}`}>{role?.id}</span>
              <span className="font-mono-data text-mono-data text-on-surface-variant">Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-5" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {field('firstName', 'First name')}
            {field('lastName', 'Last name')}
          </div>
          {field('email', 'Email', 'email')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {field('phone', 'Phone', 'tel', '+1 (555) 000-0000')}
            {field('country', 'Country', 'text', 'United States')}
          </div>

          {status.state === 'error' && (
            <p className="font-mono-data text-mono-data text-error flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">error</span>{status.message}
            </p>
          )}
          {status.state === 'success' && (
            <p className="font-mono-data text-mono-data text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>{status.message}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary hover:bg-surface-bright rounded transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={status.state === 'loading'} className="px-6 py-2.5 bg-primary text-on-primary font-label-caps text-label-caps rounded hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-60">
              {status.state === 'loading' ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
