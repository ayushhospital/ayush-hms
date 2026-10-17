import React, { useState } from 'react';
import { consultationsApi } from '../../services/api';
import type { Patient, Doctor, ConsultationResponse } from '../../types';

interface ConsultationFormProps {
  patient: Patient;
  doctors: Doctor[];
  onComplete: () => void;
  onConsultationCreated: (consultation: ConsultationResponse) => void;
  onCancel: () => void;
}

const OTHER_DOCTOR_ID = -1;

const ConsultationForm: React.FC<ConsultationFormProps> = ({
  patient, doctors, onComplete, onConsultationCreated, onCancel,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [doctorId, setDoctorId] = useState(doctors.length > 0 ? doctors[0].id : 0);
  const [customDoctorName, setCustomDoctorName] = useState('');
  const [visitType, setVisitType] = useState<'New' | 'Follow-up'>('New');
  const [feeAmount, setFeeAmount] = useState(
    doctors.length > 0 ? doctors[0].consultation_fee.toString() : '0'
  );
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI'>('Cash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isOtherDoctor = doctorId === OTHER_DOCTOR_ID;

  const handleDoctorChange = (value: string) => {
    const id = parseInt(value, 10);
    setDoctorId(id);
    if (id === OTHER_DOCTOR_ID) {
      setFeeAmount('');
      return;
    }
    const doc = doctors.find((d) => d.id === id);
    if (doc) setFeeAmount(doc.consultation_fee.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isOtherDoctor && !customDoctorName.trim()) {
      setError('Please enter the doctor name');
      return;
    }
    setSubmitting(true);
    try {
      const consultation = await consultationsApi.create({
        patient_id: patient.id,
        doctor_id: isOtherDoctor ? null : doctorId,
        custom_doctor_name: isOtherDoctor ? customDoctorName.trim() : undefined,
        consultation_date: today,
        visit_type: visitType,
        fee_amount: parseFloat(feeAmount),
        payment_mode: paymentMode,
      });
      onConsultationCreated(consultation);
      onComplete();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create consultation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">New Consultation</h3>
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-medium">{patient.name}</span> &mdash; {patient.uhid} &mdash; {patient.gender}, Age {patient.age}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
          <select value={doctorId}
            onChange={(e) => handleDoctorChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.department}) &mdash; ₹{doc.consultation_fee}
              </option>
            ))}
            <option value={OTHER_DOCTOR_ID}>Another Doctor</option>
          </select>
        </div>

        {isOtherDoctor && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name *</label>
            <input type="text" value={customDoctorName}
              onChange={(e) => setCustomDoctorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter doctor name" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visit Type *</label>
            <select value={visitType}
              onChange={(e) => setVisitType(e.target.value as 'New' | 'Follow-up')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="New">New</option>
              <option value="Follow-up">Follow-up</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={today} readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee (₹) *</label>
            <input type="number" value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              required min={0} step={0.01}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment *</label>
            <select value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as 'Cash' | 'UPI')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button type="submit" disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Saving...' : 'Create Consultation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConsultationForm;
