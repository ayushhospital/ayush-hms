import React, { useState } from 'react';
import { patientsApi } from '../../services/api';
import type { Patient } from '../../types';

interface Props {
  patient: Patient;
  onSaved: () => void;
  onCancel: () => void;
}

const PatientEditForm: React.FC<Props> = ({ patient, onSaved, onCancel }) => {
  const [name, setName] = useState(patient.name);
  const [gender, setGender] = useState(patient.gender);
  const [age, setAge] = useState(String(patient.age));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await patientsApi.update(patient.id, {
        name: name.trim(), gender,
        age: parseInt(age, 10),
      });
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" value={name}
          onChange={(e) => setName(e.target.value)} required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Name" />
        <div className="flex gap-2.5">
          <select value={gender} onChange={(e) => setGender(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input type="number" value={age}
            onChange={(e) => setAge(e.target.value)} required min={0} max={150}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Age" />
        </div>
        {error && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
          <button type="submit" disabled={submitting || !name.trim()}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">Save</button>
        </div>
      </form>
    </div>
  );
};

export default PatientEditForm;