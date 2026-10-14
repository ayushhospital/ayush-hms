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
    to: '/pharmacy',
    label: 'Pharmacy',
    prefix: ['/pharmacy'],
    module: 'pharmacy',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" {...stroke}>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 8h6M12 5v6" />
        <path d="M9 16l2 2 4-4" />
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
    <aside className="no-print hidden lg:flex flex-col w-60 shrink-0 bg-blue-950 text-blue-100/80 border-r border-blue-900/60 sticky top-0 h-screen">
      {/* App header inside the sidebar — click to go home */}
      <div className="px-5 pt-6 pb-5 border-b border-blue-900/60">
        <NavLink to="/" className="flex items-center gap-3 cursor-pointer w-full text-left no-underline text-blue-100/80 hover:text-white transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/60 ring-2 ring-blue-400/30 shrink-0">
            <span className="text-white text-sm font-bold tracking-tight">AH</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-white text-base font-bold m-0 leading-tight tracking-tight">Ayush HMS</h1>
            <p className="text-blue-200/60 text-[11px] m-0 mt-0.5">Hospital Management</p>
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
                ${active ? 'bg-blue-600 text-white shadow' : 'text-blue-100/80 hover:bg-blue-900/70 hover:text-white'}`}
            >
              <span className={active ? 'text-white' : 'text-blue-300'}>{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      
    </aside>
  );
};

export default Sidebar;