import React, { useState } from 'react';

interface PhoneSearchProps {
  onSearch: (phone: string) => Promise<void>;
  loading: boolean;
}

const PhoneSearch: React.FC<PhoneSearchProps> = ({ onSearch, loading }) => {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) return;
    onSearch(cleaned);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center gap-0 px-4 py-2.5">
        <div className="flex-1 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 11.5l-10-8-1v10-3-2" />
            <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" />
            <path d="M15 12l3-9-1-1" />
          </svg>
          <input
            id="phone-search"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9+\-\s]/g, ''))}
            placeholder="Enter phone number"
            className="flex-1 border-0 bg-transparent text-sm outline-none placeholder-gray-400"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={phone.replace(/\D/g, '').length < 10 || loading}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
};

export default PhoneSearch;