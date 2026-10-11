import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'OPD',
      description: 'Outpatient — manage visits, consultations, and printing',
      onClick: () => navigate('/opd'),
    },
    {
      title: 'IPD',
      description: 'Inpatient — admissions, wards, bed management',
      disabled: true,
      comingSoon: true,
    },
    {
      title: 'Reports',
      description: 'Revenue, doctor summaries, patient lists',
      onClick: () => navigate('/reports'),
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-2">
        {modules.map((mod) => (
          <Card
            key={mod.title}
            title={mod.title}
            description={mod.description}
            onClick={mod.onClick}
            disabled={mod.disabled}
            comingSoon={mod.comingSoon}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;