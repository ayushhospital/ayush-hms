import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'OPD',
      description: 'Outpatient Department — manage patient visits, consultations, and printing',
      onClick: () => navigate('/opd'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      title: 'IPD',
      description: 'Inpatient Department — admissions, wards, and bed management',
      disabled: true,
      comingSoon: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: 'Reports',
      description: 'Revenue, footfall, and doctor-wise summaries',
      onClick: () => navigate('/reports'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-800 m-0">Welcome to Ayush HMS</h2>
        <p className="text-sm text-gray-500 mt-1">Select a module to get started</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {modules.map((mod) => (
          <Card
            key={mod.title}
            title={mod.title}
            description={mod.description}
            onClick={mod.onClick}
            disabled={mod.disabled}
            comingSoon={mod.comingSoon}
            icon={mod.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;