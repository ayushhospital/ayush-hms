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
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm w-full sm:w-max">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 py-2.5">
        <span className="text-gray-400 text-base">&#128222;</span>
        <input
          id="phone-search"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9+\-\s]/g, ''))}
          placeholder="Enter phone number"
          className="w-full sm:w-56 border-0 bg-transparent text-sm outline-none placeholder-gray-400"
          autoFocus
        />
        <button
          type="submit"
          disabled={phone.replace(/\D/g, '').length < 10 || loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
};

export default PhoneSearch;