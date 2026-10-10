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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="phone-search" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            id="phone-search"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9+\-\s]/g, ''))}
            placeholder="Enter phone number (e.g., 9876543210)"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            autoFocus
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={phone.replace(/\D/g, '').length < 10 || loading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PhoneSearch;