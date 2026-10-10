import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="bg-white border-b border-gray-200 no-print">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-gray-800 no-underline">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="text-lg font-bold m-0">Ayush HMS</h1>
            <p className="text-xs text-gray-500 m-0">Hospital Management System</p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {!isHome && (
            <Link
              to="/"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors no-underline"
            >
              ← Home
            </Link>
          )}
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;