import React from 'react';
import { useNavigate } from 'react-router-dom';

const IPDPlaceholderPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">IPD Module</h2>
      <p className="text-gray-500 mb-2">Inpatient Department management is coming soon.</p>
      <p className="text-sm text-gray-400 mb-6">
        This module will handle admissions, bed allocation, discharge, and inpatient billing.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
      >
        ← Back to Home
      </button>
    </div>
  );
};

export default IPDPlaceholderPage;