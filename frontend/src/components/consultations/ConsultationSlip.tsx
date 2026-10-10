import React, { useRef } from 'react';
import '../../styles/print.css';
import type { ConsultationResponse } from '../../types';

interface ConsultationSlipProps {
  consultation: ConsultationResponse;
  onClose: () => void;
}

const ConsultationSlip: React.FC<ConsultationSlipProps> = ({ consultation, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="no-print bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800 m-0">Consultation Slip</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🖨️ Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Print Hint */}
        <p className="text-xs text-gray-500">
          This slip is designed for A5 paper (148 × 210 mm). Click Print to preview or print.
        </p>
      </div>

      {/* Printable Slip */}
      <div ref={printRef} className="slip-container bg-white border border-gray-200 p-6 rounded-xl">
        <div className="slip-header">
          <h1>Ayush Hospital</h1>
          <p>123, Healthcare Avenue, Medical District</p>
          <p>Phone: +91-9876543210 | Email: contact@ayushhospital.com</p>
        </div>

        <div className="slip-body">
          <h2 className="text-base font-bold text-center mb-4">CONSULTATION SLIP</h2>

          <div className="text-sm space-y-2">
            <div className="flex">
              <span className="font-medium min-w-[140px]">Consultation No:</span>
              <span>{consultation.consultation_number}</span>
            </div>
            <div className="flex">
              <span className="font-medium min-w-[140px]">Date:</span>
              <span>{formatDate(consultation.consultation_date)}</span>
            </div>
            <div className="border-t border-gray-200 my-2" />

            <div className="flex">
              <span className="font-medium min-w-[140px]">UHID:</span>
              <span>{consultation.patient_uhid}</span>
            </div>
            <div className="flex">
              <span className="font-medium min-w-[140px]">Patient Name:</span>
              <span>{consultation.patient_name}</span>
            </div>
            <div className="flex">
              <span className="font-medium min-w-[140px]">Age / Gender:</span>
              <span>{consultation.patient_age} / {consultation.patient_gender}</span>
            </div>
            <div className="flex">
              <span className="font-medium min-w-[140px]">Phone:</span>
              <span>{consultation.patient_phone}</span>
            </div>
            <div className="border-t border-gray-200 my-2" />

            <div className="flex">
              <span className="font-medium min-w-[140px]">Doctor:</span>
              <span>{consultation.doctor_name}</span>
            </div>
            <div className="flex">
              <span className="font-medium min-w-[140px]">Department:</span>
              <span>{consultation.doctor_department}</span>
            </div>
            <div className="flex">
              <span className="font-medium min-w-[140px]">Visit Type:</span>
              <span>{consultation.visit_type}</span>
            </div>
            <div className="flex">
              <span className="font-medium min-w-[140px]">Fee:</span>
              <span>₹{consultation.fee_amount.toFixed(2)}</span>
            </div>
            <div className="flex">
              <span className="font-medium min-w-[140px]">Payment Mode:</span>
              <span>{consultation.payment_mode}</span>
            </div>
            <div className="border-t border-gray-200 my-2" />

            <div className="flex">
              <span className="font-medium min-w-[140px]">Valid Until:</span>
              <span>{formatDate(consultation.valid_until)}</span>
            </div>
          </div>
        </div>

        <div className="slip-footer text-center">
          <p className="text-xs text-gray-500">This is a computer-generated slip. No signature required.</p>
          <p className="text-xs text-gray-500">Consultation is valid for 7 days from the date of issue.</p>
        </div>
      </div>
    </div>
  );
};

export default ConsultationSlip;