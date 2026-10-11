import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <header className="bg-white border-b border-gray-200 no-print">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-gray-800 no-underline">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">AH</span>
          </div>
          <div>
            <h1 className="text-lg font-bold m-0">Ayush HMS</h1>
            <p className="text-xs text-gray-500 m-0">Hospital Management System</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {!isHome && (
            <Link to="/"
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors no-underline">
              Home
            </Link>
          )}
          <span className="text-xs font-semibold text-gray-600 px-2 py-1 bg-gray-50 rounded-md">
            {dateStr}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;