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
      setConsultations(Array.isArray(data) ? data : []);
    }).catch(() => {
      setConsultations([]);
    }).finally(() => setLoading(false));
  }, [patient.id]);

  const fmt = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) return <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2 text-xs text-gray-400">Loading...</div>;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600">Consultations</span>
        <button onClick={onNewConsultation}
          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">+ New</button>
      </div>
      {consultations.length === 0 ? (
        <p className="text-xs text-gray-400">No consultations yet</p>
      ) : (
        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          {consultations.map((c) => {
            const active = new Date(c.valid_until) >= new Date();
            return (
              <div key={c.id} className="flex items-center justify-between bg-white rounded border border-gray-200 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{c.doctor_name || '-'}</span>
                    {active
                      ? <span className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none">Active</span>
                      : <span className="text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none">Expired</span>
                    }
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {fmt(c.consultation_date)} to {fmt(c.valid_until)}
                  </div>
                </div>
                <button onClick={() => onPrintExisting(c.id)}
                  className="ml-2 px-2.5 py-1.5 text-[10px] font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 shrink-0">Slip</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ViewConsultations;