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
    return `${('0'+d.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${d.getFullYear()}`;
  };

  if (loading) return <div className="text-xs text-gray-400 p-3">Loading...</div>;

  const active = consultations.filter(c => new Date(c.valid_until) >= new Date());
  const expired = consultations.filter(c => new Date(c.valid_until) < new Date());

  const row = (c: ConsultationResponse) => (
    <tr key={c.id} className="border-b border-gray-100">
      <td className="py-2 px-2 text-gray-800 whitespace-nowrap text-sm font-medium">{c.doctor_name || '-'}</td>
      <td className="py-2 px-2 whitespace-nowrap">
        {new Date(c.valid_until) >= new Date()
          ? <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ring-inset ring-green-200">Active</span>
          : <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ring-inset ring-gray-200">Expired</span>
        }
      </td>
      <td className="py-2 px-2 text-gray-500 whitespace-nowrap text-[11px]">{fmt(c.consultation_date)}</td>
      <td className="py-2 px-2 text-gray-500 whitespace-nowrap text-[11px]">{fmt(c.valid_until)}</td>
      <td className="py-2 px-2 text-[11px]">{c.visit_type}</td>
      <td className="py-2 px-2 text-[11px] text-gray-500">{c.payment_mode}</td>
      <td className="py-2 px-2">
        <button onClick={() => onPrintExisting(c.id)}
          className="px-2.5 py-1.5 text-[10px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Print</button>
      </td>
    </tr>
  );

  return (
    <div className="mt-0 pt-0">
      {/* Inline header with + New button */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-b border-gray-200">
        <div>
          <span className="text-xs font-semibold text-gray-800">{patient.name}</span>
          <span className="text-xs text-gray-400 ml-2">{patient.uhid}</span>
        </div>
        <button onClick={onNewConsultation}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">+ New Consultation</button>
      </div>

      {consultations.length === 0 ? (
        <div className="px-5 py-4 text-center text-xs text-gray-400">No consultations yet</div>
      ) : (
        <div className="px-4 py-3">
          {active.length > 0 && (
            <>
              <h4 className="text-xs font-semibold text-green-700 mb-1.5">Active Consultations</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead><tr className="border-b border-gray-200">
                    <th className="py-1.5 px-2 text-left text-gray-500 text-[10px]">Doctor</th>
                    <th className="py-1.5 px-2 text-left text-gray-500 text-[10px]">Status</th>
                    <th className="py-1.5 px-2 text-left text-gray-500 text-[10px]">Start</th>
                    <th className="py-1.5 px-2 text-left text-gray-500 text-[10px]">End</th>
                    <th className="py-1.5 px-2 text-left text-gray-500 text-[10px]">Visit</th>
                    <th className="py-1.5 px-2 text-left text-gray-500 text-[10px]">Pay</th>
                    <th className="py-1.5 px-2"></th>
                  </tr></thead>
                  <tbody>{active.map(row)}</tbody>
                </table>
              </div>
            </>
          )}
          {expired.length > 0 && (
            <>
              <h4 className="text-xs font-semibold text-gray-500 mb-1.5 mt-2">Past Consultations</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead><tr className="border-b border-gray-200">
                    <th className="py-1.5 px-2 text-left text-gray-500 text-[10px]">Doctor</th>
                    <th className="py-1.5 px-2 text-left text-gray-500 text-[10px]">Status</th>
                    <th className="py-1.5 px-2 text-left text-gray-500 text-[10px]">Start</th>
                    <th className="py-1.5 px-2 text-left text-gray-500 text-[10px]">End</th>
                    <th className="py-1.5 px-2 text-left text-gray-500 text-[10px]">Visit</th>
                    <th className="py-1.5 px-2 text-left text-gray-500 text-[10px]">Pay</th>
                    <th className="py-1.5 px-2"></th>
                  </tr></thead>
                  <tbody>{expired.map(row)}</tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewConsultations;
