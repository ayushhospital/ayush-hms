import React, { useEffect, useState } from 'react';
import { patientsApi } from '../../services/api';
import type { ConsultationResponse, Patient } from '../../types';

interface Props {
  patient: Patient;
  refreshKey: number;
  onNewConsultation: () => void;
  onPrintExisting: (consultationId: number) => void;
}

const ViewConsultations: React.FC<Props> = ({ patient, refreshKey, onNewConsultation, onPrintExisting }) => {
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    patientsApi.getConsultations(patient.id).then((data) => {
      setConsultations(Array.isArray(data) ? data : []);
    }).catch(() => {
      setConsultations([]);
    }).finally(() => setLoading(false));
  }, [patient.id, refreshKey]);

  const fmt = (s: string) => {
    const d = new Date(s);
    const day = ('0' + d.getDate()).slice(-2);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
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
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-[11px] border-collapse">
            <tbody>
              {consultations.map((c) => {
                const active = new Date(c.valid_until) >= new Date();
                return (
                  <tr key={c.id} className="border-b border-gray-100">
                    <td className="py-1.5 px-1 text-gray-800 whitespace-nowrap">{c.doctor_name || '-'}</td>
                    <td className="py-1.5 px-1">
                      {active
                        ? <span className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-[10px] font-medium">Active</span>
                        : <span className="text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded text-[10px] font-medium">Expired</span>
                      }
                    </td>
                    <td className="py-1.5 px-1 text-gray-500 whitespace-nowrap">{fmt(c.consultation_date)}</td>
                    <td className="py-1.5 px-1 text-gray-500 whitespace-nowrap">{fmt(c.valid_until)}</td>
                    <td className="py-1.5 px-1">
                      <button onClick={() => onPrintExisting(c.id)}
                        className="px-2 py-1 text-[10px] font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Print</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewConsultations;