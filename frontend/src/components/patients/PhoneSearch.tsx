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
    <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 shadow-sm">
      <input
        id="phone-search"
        type="tel"
        inputMode="numeric"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/[^0-9+\-\s]/g, ''))}
        placeholder="Phone number"
        className="flex-1 border-0 bg-transparent text-sm outline-none placeholder-gray-400"
        autoFocus
      />
      <button
        type="submit"
        disabled={phone.replace(/\D/g, '').length < 10 || loading}
        className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};

export default PhoneSearch;