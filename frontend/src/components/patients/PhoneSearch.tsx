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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center gap-2">
        <input
          id="phone-search"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9+\-\s]/g, ''))}
          placeholder="Phone (e.g., 9876543210)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          autoFocus
        />
        <button
          type="submit"
          disabled={phone.replace(/\D/g, '').length < 10 || loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
};

export default PhoneSearch;