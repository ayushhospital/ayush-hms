import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  to: string;
  label: string;
  prefix: string[]; // pathname prefixes that mark this item active
  exclude?: string[]; // pathnames that should not mark this item active
  module?: string; // required module for normal users
  superOnly?: boolean;
  icon: React.ReactNode;
}

const stroke = { stroke: 'currentColor', strokeWidth: 1.7, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Home',
    prefix: ['/'],
    exclude: ['/opd', '/ipd', '/reports', '/users'],
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" {...stroke}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    to: '/opd',
    label: 'OPD',
    prefix: ['/opd'],
    module: 'opd',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" {...stroke}>
        <circle cx="11" cy="7" r="4" />
        <path d="M3.5 21v-1a7.5 7.5 0 0 1 15 0v1" />
        <path d="M20 9v4M18 11h4" />
      </svg>
    ),
  },
  {
    to: '/ipd',
    label: 'IPD',
    prefix: ['/ipd'],
    module: 'ipd',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" {...stroke}>
        <path d="M4 5h16v14H4z" />
        <path d="M4 9.5h16" />
        <path d="M8 14.5h5" />
      </svg>
    ),
  },
  {
    to: '/reports',
    label: 'Reports',
    prefix: ['/reports'],
    module: 'reports',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" {...stroke}>
        <path d="M4 20V10M10 20V4M16 20v-8M21 20H3" />
      </svg>
    ),
  },
  {
    to: '/users',
    label: 'Users',
    prefix: ['/users'],
    superOnly: true,
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" {...stroke}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20v-1a6.5 6.5 0 0 1 13 0v1" />
        <path d="M15 5.2a3.5 3.5 0 0 1 0 5.6M18.5 20a6.5 6.5 0 0 0-3.5-5.8" />
      </svg>
    ),
  },
];

const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const { user, hasModule, isSuper, logout } = useAuth();

  const isActive = (item: NavItem): boolean => {
    if (item.exclude && item.exclude.includes(pathname)) return false;
    return item.prefix.some((p) => (p === '/' ? pathname === '/' : pathname.startsWith(p)));
  };

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.superOnly) return isSuper;
    if (item.module) return hasModule(item.module);
    return true;
  });

  return (
    <aside className="no-print hidden lg:flex flex-col w-60 shrink-0 bg-slate-900 text-slate-300 border-r border-slate-800 sticky top-0 h-screen">
      {/* App header inside the sidebar — click to go home */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-800">
        <NavLink to="/" className="flex items-center gap-3 cursor-pointer w-full text-left no-underline text-slate-300 hover:text-white transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40 shrink-0">
            <span className="text-white text-sm font-bold tracking-tight">AH</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-white text-base font-bold m-0 leading-tight tracking-tight">Ayush HMS</h1>
            <p className="text-slate-400 text-[11px] m-0 mt-0.5">Hospital Management</p>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const active = isActive(item);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors no-underline
                ${active ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer — user + date/time/day + actions */}
      <div className="px-5 py-3.5 border-t border-slate-800 space-y-3">
        {/* Date / time / day — prominently visible */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="14" height="14" className="text-blue-400 shrink-0" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M8 2v4M16 2v4M3 9h18" />
            </svg>
            <span className="text-white text-sm font-bold m-0 leading-tight">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <p className="text-slate-400 text-[10px] m-0 mt-1 leading-tight">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long' })} · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>
        </div>

        {/* Signed-in user */}
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-blue-300 uppercase">{user?.username?.slice(0, 2)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold m-0 leading-tight truncate">{user?.username}</p>
            <p className="text-slate-500 text-[10px] m-0 uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-1.5">
          <button onClick={() => { (window as any).__openChangePw && (window as any).__openChangePw(); }}
            className="w-full flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400 bg-slate-800/30 hover:bg-slate-800 hover:text-white border border-slate-700/30 rounded-lg px-3 py-2 transition-colors">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
            Change Password
          </button>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400 bg-slate-800/60 hover:bg-slate-800 hover:text-white border border-slate-700/50 rounded-lg px-3 py-2 transition-colors">
            <svg viewBox="0 0 24 24" width="13" height="13" {...stroke}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;