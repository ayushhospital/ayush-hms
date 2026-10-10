import React, { useState } from 'react';
import { patientsApi } from '../../services/api';
import type { Doctor } from '../../types';

interface PatientRegistrationFormProps {
  phone: string;
  doctors: Doctor[];
  onComplete: () => void;
  onCancel: () => void;
}

const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({
  phone,
  doctors,
  onComplete,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successUhid, setSuccessUhid] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const patient = await patientsApi.create({
        name: name.trim(),
        gender,
        age: parseInt(age, 10),
        phone_number: phone,
      });
      setSuccessUhid(patient.uhid);
      setTimeout(onComplete, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (successUhid) {
    return (
      <div className="bg-white rounded-xl border border-green-200 p-6 text-center">
        <div className="text-green-600 text-2xl mb-2">✓</div>
        <p className="text-green-700 font-medium">Patient registered successfully!</p>
        <p className="text-sm text-green-600">UHID: {successUhid}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Register New Patient</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Full name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              min={0}
              max={150}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Years"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !name.trim() || !age}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Registering...' : 'Register Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistrationForm;