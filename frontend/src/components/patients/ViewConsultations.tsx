import React, { useEffect, useState } from 'react';
import { patientsApi } from '../../services/api';
import type { ConsultationResponse, Patient } from '../../types';

interface Props {
  patient: Patient;
  onNewConsultation: () => void;
  onPrintExisting: (consultationId: number) => void;
}

const ViewConsultations: React.FC<Props> = ({ patient, onNewConsultation, onPrintExisting }) => {
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientsApi.getConsultations(patient.id).then((data) => {
      setConsultations(data);
    }).catch(() => {
      setConsultations([]);
    }).finally(() => setLoading(false));
  }, [patient.id]);

  const isActive = (validUntil: string) => new Date(validUntil) >= new Date();

  if (loading) return <div className="text-xs text-gray-400 p-2">Loading...</div>;

  if (consultations.length === 0) return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mt-1">
      <p className="text-xs text-gray-500 mb-2">No consultations yet</p>
      <button onClick={onNewConsultation}
        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">New Consultation</button>
    </div>
  );

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mt-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600">Recent consultations</span>
        <button onClick={onNewConsultation}
          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">+ New</button>
      </div>
      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {consultations.slice(0, 10).map((c) => {
          const active = isActive(c.valid_until);
          const dateStr = c.consultation_date.slice(0, 10);
          return (
            <div key={c.id} className="flex items-center justify-between bg-white rounded border border-gray-100 px-2.5 py-1.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-gray-700">{c.doctor_name || '-'}</span>
                  {active
                    ? <span className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-[10px] font-medium">Active</span>
                    : <span className="text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded text-[10px] font-medium">Expired</span>
                  }
                </div>
                <div className="text-[11px] text-gray-500">
                  {dateStr} · {c.visit_type} · ₹{c.fee_amount.toFixed(0)} · {c.payment_mode}
                </div>
              </div>
              <button onClick={() => onPrintExisting(c.id)}
                className="ml-2 px-2 py-1 text-[10px] font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 shrink-0">Slip</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ViewConsultations;