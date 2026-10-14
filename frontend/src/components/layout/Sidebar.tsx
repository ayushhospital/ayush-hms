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
    exclude: ['/ipd/new'],
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" {...stroke}>
        <path d="M4 5h16v14H4z" />
        <path d="M4 9.5h16" />
        <path d="M8 14.5h5" />
      </svg>
    ),
  },
  {
    to: '/ipd/new',
    label: 'New Admission',
    prefix: ['/ipd/new'],
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" {...stroke}>
        <path d="M12 5v14M5 12h14" />
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

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });

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

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <div className="text-[11px] text-slate-400 px-1 py-1.5 bg-slate-800/60 rounded-md text-center">
          {dateStr}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;