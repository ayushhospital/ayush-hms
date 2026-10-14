import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  prefix: string[]; // pathname prefixes that mark this item active
  exclude?: string[]; // pathnames that should not mark this item active
  icon: React.ReactNode;
}

const stroke = { stroke: 'currentColor', strokeWidth: 1.7, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Home',
    prefix: ['/'],
    exclude: ['/opd', '/ipd', '/reports'],
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
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" {...stroke}>
        <path d="M4 20V10M10 20V4M16 20v-8M21 20H3" />
      </svg>
    ),
  },
];

const Sidebar: React.FC = () => {
  const { pathname } = useLocation();

  const isActive = (item: NavItem): boolean => {
    if (item.exclude && item.exclude.includes(pathname)) return false;
    return item.prefix.some((p) => (p === '/' ? pathname === '/' : pathname.startsWith(p)));
  };

  const now = new Date();
  const weekday = now.toLocaleDateString('en-IN', { weekday: 'short' });
  const dateMain = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <aside className="no-print hidden lg:flex flex-col w-60 shrink-0 bg-slate-900 text-slate-300 border-r border-slate-800 sticky top-0 h-screen">
      {/* App header inside the sidebar */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40 shrink-0">
            <span className="text-white text-sm font-bold tracking-tight">AH</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-white text-base font-bold m-0 leading-tight tracking-tight">Ayush HMS</h1>
            <p className="text-slate-400 text-[11px] m-0 mt-0.5">Hospital Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
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

      {/* Footer — today's date, prominently visible */}
      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2 text-center">Today</p>
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5">
          <svg viewBox="0 0 24 24" width="16" height="16" className="text-blue-400 shrink-0" {...stroke}>
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path d="M8 2v4M16 2v4M3 9h18" />
          </svg>
          <div className="min-w-0">
            <p className="text-white text-sm font-bold m-0 leading-tight">{dateMain}</p>
            <p className="text-slate-400 text-[11px] m-0 leading-tight mt-0.5">{weekday} &middot; {timeStr}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;