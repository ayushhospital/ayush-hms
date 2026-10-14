import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';

const stroke = { stroke: 'currentColor', strokeWidth: 1.7, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { hasModule, isSuper } = useAuth();

  const allModules = [
    {
      title: 'OPD',
      description: 'Outpatient — manage visits, consultations, and printing',
      badge: 'OUTPATIENT',
      tint: 'bg-blue-50 text-blue-600',
      show: hasModule('opd'),
      onClick: () => navigate('/opd'),
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
          <circle cx="11" cy="7" r="4" />
          <path d="M3.5 21v-1a7.5 7.5 0 0 1 15 0v1" />
          <path d="M20 9v4M18 11h4" />
        </svg>
      ),
    },
    {
      title: 'IPD',
      description: 'Inpatient — admissions, wards, bed management',
      badge: 'INPATIENT',
      tint: 'bg-emerald-50 text-emerald-600',
      show: hasModule('ipd'),
      onClick: () => navigate('/ipd'),
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
          <path d="M4 5h16v14H4z" />
          <path d="M4 9.5h16" />
          <path d="M8 14.5h5" />
        </svg>
      ),
    },
    {
      title: 'Pharmacy',
      description: 'Vendors, drug inventory & point-of-sale',
      badge: 'PHARMACY',
      tint: 'bg-teal-50 text-teal-600',
      show: hasModule('pharmacy'),
      onClick: () => navigate('/pharmacy'),
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M9 8h6M12 5v6" />
          <path d="M9 16l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: 'Reports',
      description: 'Revenue, doctor summaries, patient lists',
      badge: 'ANALYTICS',
      tint: 'bg-violet-50 text-violet-600',
      show: hasModule('reports'),
      onClick: () => navigate('/reports'),
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
          <path d="M4 20V10M10 20V4M16 20v-8M21 20H3" />
        </svg>
      ),
    },
    {
      title: 'Users',
      description: 'Create & manage users, roles and access',
      badge: 'ADMIN',
      tint: 'bg-amber-50 text-amber-600',
      show: isSuper,
      onClick: () => navigate('/users'),
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 20v-1a6.5 6.5 0 0 1 13 0v1" />
          <path d="M15 5.2a3.5 3.5 0 0 1 0 5.6M18.5 20a6.5 6.5 0 0 0-3.5-5.8" />
        </svg>
      ),
    },
  ];

  const modules = allModules.filter((m) => m.show);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Ayush HMS — Hospital Management System" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <button key={mod.title} onClick={mod.onClick}
            className="hms-card p-6 text-left hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-5">
              <div className={`w-11 h-11 rounded-lg ${mod.tint} flex items-center justify-center`}>{mod.icon}</div>
              <span className="text-[10px] font-semibold tracking-widest text-slate-400">{mod.badge}</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 m-0">{mod.title}</h3>
            <p className="text-sm text-slate-500 m-0 mt-1 leading-relaxed">{mod.description}</p>
            <span className="mt-4 inline-block text-xs font-medium text-blue-600">Open module &rarr;</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;