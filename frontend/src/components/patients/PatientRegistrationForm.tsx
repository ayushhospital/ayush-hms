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
  phone, onComplete, onCancel,
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
        name: name.trim(), gender,
        age: parseInt(age, 10), phone_number: phone,
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
      <div className="bg-white rounded-lg border border-green-200 p-4 text-center">
        <div className="text-green-600 text-xl mb-1">✓</div>
        <p className="text-green-700 font-medium text-sm">Registered!</p>
        <p className="text-xs text-green-600">UHID: {successUhid}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Register New Patient</h3>
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <input type="text" value={name}
            onChange={(e) => setName(e.target.value)} required
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Patient name *" />
        </div>
        <div className="flex gap-2">
          <select value={gender} onChange={(e) => setGender(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input type="number" value={age}
            onChange={(e) => setAge(e.target.value)} required min={0} max={150}
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Age *" />
        </div>
        <div>
          <input type="tel" value={phone} readOnly
            className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-500" />
        </div>
        {error && <div className="p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">{error}</div>}
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
          <button type="submit" disabled={submitting || !name.trim() || !age}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistrationForm;