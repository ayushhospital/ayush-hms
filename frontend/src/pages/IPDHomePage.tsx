import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ipdApi, doctorsApi } from '../services/api';
import type { IPDAdmissionSummary, Doctor } from '../types';

const IPDHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [admissions, setAdmissions] = useState<IPDAdmissionSummary[]>([]);
  const [summary, setSummary] = useState({ total: 0, open_count: 0, today_admissions: 0, discharged_today: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const loadAdmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const result = await ipdApi.list(params);
      setAdmissions(result.admissions);
      setSummary({ total: result.total, open_count: result.open_count, today_admissions: result.today_admissions, discharged_today: result.discharged_today });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load admissions');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAdmissions(); doctorsApi.list().then(d => setDoctors(d)).catch(() => {}); }, []);

  const fmt = (s: string) => {
    const d = new Date(s);
    return `${('0'+d.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${d.getFullYear()}`;
  };

  const doctorName = (id: number) => {
    const d = doctors.find(doc => doc.id === id);
    return d ? d.name : '-';
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 m-0">Inpatient Department</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage admissions, inpatient care, billing and discharge.</p>
        </div>
        <button onClick={() => navigate('/ipd/new')}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">+ New Admission</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Open Admissions', value: summary.open_count, color: 'text-emerald-600' },
          { label: "Today's Admissions", value: summary.today_admissions, color: 'text-blue-600' },
          { label: 'Discharged Today', value: summary.discharged_today, color: 'text-gray-600' },
          { label: 'Total', value: summary.total, color: 'text-gray-800' },
        ].map(card => (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
            <p className="text-2xl font-bold m-0 {card.color}">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Search and filter */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-4">
        <div className="flex items-center gap-3">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by patient name, phone, UHID or Admission ID"
            onKeyDown={e => { if (e.key === 'Enter') loadAdmissions(); }} />
          <button onClick={loadAdmissions}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Search</button>
        </div>
        <div className="flex gap-2 mt-2">
          {[{key:'', label:'All'},{key:'open', label:'Open'},{key:'discharged', label:'Discharged'}].map(f => (
            <button key={f.key} onClick={() => { setStatusFilter(f.key); setTimeout(loadAdmissions, 50); }}
              className={`px-3 py-1 text-xs font-medium rounded-lg ${statusFilter===f.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f.label}</button>
          ))}
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-3">{error}</div>}

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-400">Loading...</div>
      ) : admissions.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-700 text-sm font-medium mb-2">No admissions found</p>
          <p className="text-xs text-gray-500 mb-3">Create a new admission to get started.</p>
          <button onClick={() => navigate('/ipd/new')} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">+ New Admission</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead><tr className="border-b border-gray-200 bg-gray-50">
              <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Admission ID</th>
              <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Patient</th>
              <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Phone</th>
              <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Date</th>
              <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Doctor</th>
              <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Ward/Bed</th>
              <th className="py-2.5 px-3 text-center font-semibold text-gray-600">Status</th>
              <th className="py-2.5 px-3"></th>
            </tr></thead>
            <tbody>
              {admissions.map(a => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/ipd/admissions/${a.id}`)}>
                  <td className="py-2.5 px-3 font-mono text-gray-600">{a.admission_number}</td>
                  <td className="py-2.5 px-3">{a.patient_name || '-'}<br/><span className="text-[10px] text-gray-400">{a.patient_uhid || ''}</span></td>
                  <td className="py-2.5 px-3 text-gray-500">{a.patient_phone || '-'}</td>
                  <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">{fmt(a.admission_datetime)}</td>
                  <td className="py-2.5 px-3 text-gray-500">{a.doctor_name || '-'}</td>
                  <td className="py-2.5 px-3 text-gray-500">{a.ward_bed || '-'}</td>
                  <td className="py-2.5 px-3 text-center">
                    {a.status === 'Open'
                      ? <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-medium">Open</span>
                      : <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-medium">Discharged</span>
                    }
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/ipd/admissions/${a.id}`); }}
                      className="px-2.5 py-1.5 text-[11px] font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IPDHomePage;
