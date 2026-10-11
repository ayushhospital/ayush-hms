import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientsApi } from '../services/api';
import type { Patient, ConsultationResponse } from '../types';
import ConsultationSlip from '../components/consultations/ConsultationSlip';

const PatientConsultationsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const searchParams = window.location.search;
  const backQ = searchParams || '';
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [printConsultation, setPrintConsultation] = useState<ConsultationResponse | null>(null);

  useEffect(() => {
    if (!id) return;
    const pid = parseInt(id, 10);
    Promise.all([patientsApi.get(pid), patientsApi.getConsultations(pid)])
      .then(([p, cons]) => { setPatient(p); setConsultations(Array.isArray(cons) ? cons : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const fmt = (s: string) => {
    const d = new Date(s);
    return `${('0'+d.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${d.getFullYear()}`;
  };

  if (loading) return <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>;
  if (!patient) return <div className="text-center py-10 text-gray-400 text-sm">Patient not found</div>;
  if (printConsultation) return <ConsultationSlip consultation={printConsultation} onClose={() => setPrintConsultation(null)} />;

  const active = consultations.filter(c => new Date(c.valid_until) >= new Date());
  const expired = consultations.filter(c => new Date(c.valid_until) < new Date());

  const row = (c: ConsultationResponse) => (
    <tr key={c.id} className="border-b border-gray-100">
      <td className="py-2 px-2 text-gray-800 whitespace-nowrap text-sm font-medium">{c.doctor_name || '-'}</td>
      <td className="py-2 px-2">{(new Date(c.valid_until)>=new Date()?<span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-medium">Active</span>:<span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-medium">Expired</span>)}</td>
      <td className="py-2 px-2 text-gray-500 text-[11px]">{fmt(c.consultation_date)}</td>
      <td className="py-2 px-2 text-gray-500 text-[11px]">{fmt(c.valid_until)}</td>
      <td className="py-2 px-2 text-[11px]">{c.visit_type}</td>
      <td className="py-2 px-2 text-[11px]">{c.payment_mode}</td>
      <td className="py-2 px-2"><button onClick={()=>setPrintConsultation(c)} className="px-2.5 py-1.5 text-[10px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Print</button></td>
    </tr>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={()=>navigate('/opd' + backQ)} className="mb-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">&larr; Back to patients</button>
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-gray-900 m-0">{patient.name}</h2>
          <span className="text-xs text-gray-500">{patient.uhid}</span>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-gray-500 mt-2">
          <span>{patient.gender}</span><span className="text-gray-300">|</span>
          <span>Age {patient.age}</span><span className="text-gray-300">|</span>
          <span>{patient.phone_number}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 m-0">Consultations <span className="text-gray-400 text-[11px]">({consultations.length})</span></h3>
        </div>
        {consultations.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-gray-400">No consultations yet</div>
        ) : (
          <div className="px-4 py-3">
            {active.length>0 && <div className="bg-green-50 rounded-lg p-3"><h4 className="text-xs font-semibold text-green-700 mb-2">Active Consultations</h4><div className="overflow-x-auto"><table className="w-full text-[11px]"><thead><tr className="border-b border-gray-200"><th className="py-1.5 px-2 text-left text-[10px] text-gray-500">Doctor</th><th className="py-1.5 px-2 text-left text-[10px] text-gray-500">Status</th><th className="py-1.5 px-2 text-left text-[10px] text-gray-500">Start</th><th className="py-1.5 px-2 text-left text-[10px] text-gray-500">End</th><th className="py-1.5 px-2 text-left text-[10px] text-gray-500">Visit</th><th className="py-1.5 px-2 text-left text-[10px] text-gray-500">Pay</th><th className="py-1.5 px-2"></th></tr></thead><tbody>{active.map(row)}</tbody></table></div></div>}
            {expired.length>0 && <div className="bg-amber-50 rounded-lg p-3 mt-2"><h4 className="text-xs font-semibold text-amber-800 mb-2">Past Consultations</h4><div className="overflow-x-auto"><table className="w-full text-[11px]"><thead><tr className="border-b border-gray-200"><th className="py-1.5 px-2 text-left text-[10px] text-gray-500">Doctor</th><th className="py-1.5 px-2 text-left text-[10px] text-gray-500">Status</th><th className="py-1.5 px-2 text-left text-[10px] text-gray-500">Start</th><th className="py-1.5 px-2 text-left text-[10px] text-gray-500">End</th><th className="py-1.5 px-2 text-left text-[10px] text-gray-500">Visit</th><th className="py-1.5 px-2 text-left text-[10px] text-gray-500">Pay</th><th className="py-1.5 px-2"></th></tr></thead><tbody>{expired.map(row)}</tbody></table></div></div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientConsultationsPage;
