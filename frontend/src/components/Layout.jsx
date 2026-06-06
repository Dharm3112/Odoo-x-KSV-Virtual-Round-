import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Vendors', path: '/vendors', icon: 'store' },
    { name: 'RFQs', path: '/rfqs', icon: 'request_quote' },
    { name: 'Quotations', path: '/quotations', icon: 'description' },
    { name: 'Approvals', path: '/approvals', icon: 'fact_check' },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: 'shopping_cart' },
    { name: 'Reports', path: '/reports', icon: 'analytics' },
    { name: 'Activity', path: '/activity-logs', icon: 'history' },
  ];

  const onLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-260px)] h-16 bg-surface dark:bg-surface-dim text-on-surface dark:text-on-surface font-label-md text-label-md border-b border-outline-variant dark:border-outline flex items-center justify-between px-container-padding z-50">
        <div className="flex items-center">
          <div className="relative flex items-center group">
            <span className="material-symbols-outlined text-on-surface-variant absolute left-0 group-hover:text-primary transition-colors">search</span>
            <input className="pl-8 bg-transparent border-none focus:ring-0 text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/50 w-64 transition-all focus:w-96" placeholder="Search Master Records..." type="text" />
            <div className="absolute bottom-0 left-8 right-0 h-[1px] bg-outline-variant scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-opacity hover:opacity-80 flex items-center justify-center relative">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full" />
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-opacity hover:opacity-80 flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>chat_bubble</span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-surface-bright transition-colors"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="w-8 h-8 rounded-full bg-primary text-on-primary font-data-lg text-data-lg flex items-center justify-center">{user?.initials || 'U'}</span>
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="font-data-lg text-data-lg text-on-surface">{user?.name || 'User'}</span>
                <span className={`font-mono-data text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded ${role?.accent || 'bg-surface-container-high text-on-surface-variant'}`}>{role?.id || 'guest'}</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 w-72 bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] border border-outline-variant/20 p-3 z-50">
                <div className="flex items-center gap-3 p-3 border-b border-outline-variant/20">
                  <span className="w-10 h-10 rounded-full bg-primary text-on-primary font-data-lg text-data-lg flex items-center justify-center">{user?.initials || 'U'}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-data-lg text-data-lg text-on-surface truncate">{user?.name}</span>
                    <span className="font-mono-data text-mono-data text-on-surface-variant truncate">{user?.email}</span>
                    <span className={`font-mono-data text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded mt-1 self-start ${role?.accent || ''}`}>{role?.name}</span>
                  </div>
                </div>
                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-surface-bright transition-colors text-left">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person</span>
                    <span className="font-body-md text-body-md text-on-surface">Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-surface-bright transition-colors text-left">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">settings</span>
                    <span className="font-body-md text-body-md text-on-surface">Preferences</span>
                  </button>
                </div>
                <div className="pt-1 border-t border-outline-variant/20">
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-error-container/40 transition-colors text-left">
                    <span className="material-symbols-outlined text-[20px] text-error">logout</span>
                    <span className="font-label-caps text-label-caps text-error">Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className="fixed left-0 top-0 h-screen w-[260px] bg-primary-container dark:bg-surface-container-low text-primary dark:text-primary-fixed font-body-md text-body-md border-r border-outline-variant dark:border-outline shadow-[4px_0_4px_rgba(0,0,0,0.03)] flex flex-col py-8 overflow-y-auto z-50">
        <div className="px-6 mb-8 flex flex-col gap-1">
          <h1 className="font-display-md text-display-md text-on-secondary font-bold tracking-tight leading-none">VendorBridge</h1>
          <p className="font-label-caps text-label-caps text-on-secondary/70 mt-1">Enterprise Resource Planning</p>
        </div>

        <Link to="/rfqs" className="mx-6 mb-10 bg-on-secondary text-primary font-body-md text-body-md py-3 px-6 rounded hover:bg-surface-variant transition-colors duration-200 flex items-center justify-center gap-2 group">
          <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">add</span>
          New Request
        </Link>

        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 py-2 transition-colors duration-200 ${isActive ? 'text-on-secondary dark:text-primary-fixed-dim border-l-2 border-on-secondary dark:border-primary-fixed-dim pl-4 hover:bg-surface-container-high/10 scale-[0.98] transition-transform' : 'text-on-secondary/60 dark:text-on-secondary-fixed-variant pl-[18px] hover:bg-surface-container-high/10 dark:hover:bg-surface-container-highest'}`}
              >
                <span className="material-symbols-outlined font-light">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 pt-8 border-t border-on-secondary/10 mx-6">
          <button className="flex items-center gap-4 text-on-secondary/60 dark:text-on-secondary-fixed-variant pl-[18px] py-2 hover:bg-surface-container-high/10 transition-colors duration-200 -ml-[18px]" type="button">
            <span className="material-symbols-outlined font-light">settings</span>
            Settings
          </button>
          <button onClick={onLogout} className="flex items-center gap-4 text-on-secondary/60 dark:text-on-secondary-fixed-variant pl-[18px] py-2 hover:bg-surface-container-high/10 transition-colors duration-200 -ml-[18px]" type="button">
            <span className="material-symbols-outlined font-light">logout</span>
            Sign out
          </button>
        </div>
      </aside>

      <main className="ml-[260px] pt-16 min-h-screen flex flex-col">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
