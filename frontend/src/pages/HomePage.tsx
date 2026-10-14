import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';

const stroke = { stroke: 'currentColor', strokeWidth: 1.7, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'OPD',
      description: 'Outpatient — manage visits, consultations, and printing',
      badge: 'OUTPATIENT',
      tint: 'bg-blue-50 text-blue-600',
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
      title: 'Reports',
      description: 'Revenue, doctor summaries, patient lists',
      badge: 'ANALYTICS',
      tint: 'bg-violet-50 text-violet-600',
      onClick: () => navigate('/reports'),
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" {...stroke}>
          <path d="M4 20V10M10 20V4M16 20v-8M21 20H3" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Ayush HMS — Hospital Management System" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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