import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ipdApi } from '../services/api';
import type { IPDAdmissionResponse, IPDAttendantResponse } from '../types';

const AdmissionWorkspacePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admission, setAdmission] = useState<IPDAdmissionResponse | null>(null);
  const [attendant, setAttendant] = useState<IPDAttendantResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const aid = parseInt(id, 10);
    Promise.all([ipdApi.get(aid), ipdApi.getAttendant(aid).catch(() => null)])
      .then(([adm, att]) => { setAdmission(adm); setAttendant(att); })
      .catch(() => setError('Failed to load admission'))
      .finally(() => setLoading(false));
  }, [id]);

  const fmt = (s: string) => {
    if (!s) return '-';
    const d = new Date(s);
    return `${('0'+d.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${d.getFullYear()}`;
  };

  if (loading) return <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-600 text-sm">{error}</div>;
  if (!admission) return <div className="text-center py-10 text-gray-400 text-sm">Admission not found</div>;

  return (<div className="max-w-4xl mx-auto">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-xs text-gray-500">IPD / Admissions / {admission.admission_number}</p>
        <h2 className="text-base font-semibold text-gray-900 m-0 mt-1">{admission.admission_number}</h2>
      </div>
      <button onClick={() => navigate('/ipd')} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">&larr; Back to Admissions</button>
    </div>

    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm mb-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900 m-0">{admission.patient_name}</h4>
          <p className="text-[11px] text-gray-500 mt-0.5">{admission.patient_uhid} | {admission.patient_gender}, Age {admission.patient_age} | {admission.patient_phone}</p>
          <p className="text-[11px] text-gray-500">Admitted: {fmt(admission.admission_datetime)} | {admission.admission_type} | Dr. {admission.doctor_name}</p>
        </div>
        <div>{admission.status === 'Open'
          ? <span className="text-green-700 bg-green-50 px-3 py-0.5 rounded-full text-xs font-medium">Open</span>
          : <span className="text-gray-500 bg-gray-100 px-3 py-0.5 rounded-full text-xs font-medium">Discharged</span>
        }</div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Admission Details</h4>
        <div className="text-xs text-gray-600 space-y-1.5">
          <div><span className="font-medium text-gray-500 inline-block w-28">Admission ID:</span>{admission.admission_number}</div>
          <div><span className="font-medium text-gray-500 inline-block w-28">Date/Time:</span>{fmt(admission.admission_datetime)}</div>
          <div><span className="font-medium text-gray-500 inline-block w-28">Type:</span>{admission.admission_type}</div>
          <div><span className="font-medium text-gray-500 inline-block w-28">Doctor:</span>{admission.doctor_name}</div>
          <div><span className="font-medium text-gray-500 inline-block w-28">Department:</span>{admission.department || '-'}</div>
          <div><span className="font-medium text-gray-500 inline-block w-28">Ward/Bed:</span>{admission.ward_bed || '-'}</div>
          <div><span className="font-medium text-gray-500 inline-block w-28">Status:</span>{admission.status}</div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Attendant</h4>
        {attendant ? (<div className="text-xs text-gray-600 space-y-1.5">
          <div><span className="font-medium text-gray-500 inline-block w-28">Name:</span>{attendant.name}</div>
          <div><span className="font-medium text-gray-500 inline-block w-28">Relation:</span>{attendant.relation}</div>
          <div><span className="font-medium text-gray-500 inline-block w-28">Phone:</span>{attendant.phone_number}</div>
          {attendant.alternate_phone_number && <div><span className="font-medium text-gray-500 inline-block w-28">Alt:</span>{attendant.alternate_phone_number}</div>}
        </div>) : <p className="text-xs text-gray-400">No attendant recorded</p>}
      </div>
    </div>

    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <h4 className="text-xs font-semibold text-gray-700 mb-1">Reason for Admission</h4>
      <p className="text-xs text-gray-600 whitespace-pre-wrap">{admission.reason_for_admission}</p>
      {admission.initial_diagnosis && (<><h4 className="text-xs font-semibold text-gray-700 mt-2 mb-1">Initial Diagnosis</h4>
      <p className="text-xs text-gray-600 whitespace-pre-wrap">{admission.initial_diagnosis}</p></>)}
    </div>
  </div>);
};
export default AdmissionWorkspacePage;
