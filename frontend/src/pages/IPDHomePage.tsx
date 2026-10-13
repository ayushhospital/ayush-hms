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
  const [mode, setMode] = useState<'active' | 'history'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [admittedFrom, setAdmittedFrom] = useState('');
  const [admittedTo, setAdmittedTo] = useState('');
  const [dischargedFrom, setDischargedFrom] = useState('');
  const [dischargedTo, setDischargedTo] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const loadAdmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { limit: 200 };
      const q = searchQuery.trim();
      if (mode === 'history') {
        params.status = 'discharged';
        if (q) params.search = q;
        if (admittedFrom) params.start_date = admittedFrom;
        if (admittedTo) params.end_date = admittedTo;
        if (dischargedFrom) params.discharged_start = dischargedFrom;
        if (dischargedTo) params.discharged_end = dischargedTo;
      } else {
        params.status = 'open';
        if (q) params.search = q;
      }
      const result = await ipdApi.list(params);
      setAdmissions(result.admissions);
      setSummary({ total: result.total, open_count: result.open_count, today_admissions: result.today_admissions, discharged_today: result.discharged_today });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load admissions');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAdmissions(); doctorsApi.list().then(d => setDoctors(d)).catch(() => {}); }, []);

  const switchMode = (m: 'active' | 'history') => {
    setMode(m);
    setTimeout(() => {
      // re-run load with new mode (loadAdmissions reads current state via closure)
      loadAdmissions();
    }, 50);
  };

  const clearOldFilters = () => {
    setSearchQuery(''); setAdmittedFrom(''); setAdmittedTo(''); setDischargedFrom(''); setDischargedTo('');
    setTimeout(loadAdmissions, 50);
  };

  const fmt = (s?: string | null) => {
    if (!s) return '-';
    const d = new Date(s);
    return `${('0'+d.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${d.getFullYear()}`;
  };

  const doctorName = (id: number) => {
    const d = doctors.find(doc => doc.id === id);
    return d ? d.name : '-';
  };

  const inp = 'px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500';
  const lbl = 'block text-[11px] text-gray-500 mb-0.5';

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
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <p className="text-2xl font-bold m-0 text-emerald-600">{summary.open_count}</p>
          <p className="text-xs text-gray-500 mt-1">Open Admissions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <p className="text-2xl font-bold m-0 text-blue-600">{summary.today_admissions}</p>
          <p className="text-xs text-gray-500 mt-1">Today's Admissions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <p className="text-2xl font-bold m-0 text-gray-600">{summary.discharged_today}</p>
          <p className="text-xs text-gray-500 mt-1">Discharged Today</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
          <p className="text-2xl font-bold m-0 text-gray-800">{summary.total}</p>
          <p className="text-xs text-gray-500 mt-1">{mode==='active' ? 'Active Records (Open)' : 'Old Records Found'}</p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-4">
        <div className="flex items-center gap-3">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className={`flex-1 ${inp}`}
            placeholder={mode==='active' ? 'Search by admission ID, phone or name' : 'Search old discharges by admission ID, phone or name'}
            onKeyDown={e => { if (e.key === 'Enter') loadAdmissions(); }} />
          <button onClick={loadAdmissions}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Search</button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <div className="flex gap-2">
            <button onClick={() => switchMode('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${mode==='active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Active (Open)</button>
            <button onClick={() => switchMode('history')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${mode==='history' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>History / Old</button>
          </div>
          {mode === 'active' && (
            <span className="text-[11px] text-gray-400">Shows only Open admissions</span>
          )}
        </div>

        {mode === 'history' && (
          <div className="grid grid-cols-4 gap-3 mt-3 border-t border-gray-100 pt-3">
            <div>
              <label className={lbl}>Admitted From</label>
              <input type="date" value={admittedFrom} onChange={e => setAdmittedFrom(e.target.value)} className={`w-full ${inp}`} />
            </div>
            <div>
              <label className={lbl}>Admitted To</label>
              <input type="date" value={admittedTo} onChange={e => setAdmittedTo(e.target.value)} className={`w-full ${inp}`} />
            </div>
            <div>
              <label className={lbl}>Discharged From</label>
              <input type="date" value={dischargedFrom} onChange={e => setDischargedFrom(e.target.value)} className={`w-full ${inp}`} />
            </div>
            <div>
              <label className={lbl}>Discharged To</label>
              <input type="date" value={dischargedTo} onChange={e => setDischargedTo(e.target.value)} className={`w-full ${inp}`} />
            </div>
          </div>
        )}
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-3">{error}</div>}

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-400">Loading...</div>
      ) : admissions.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-700 text-sm font-medium mb-2">No admissions found</p>
          <p className="text-xs text-gray-500 mb-3">{mode==='history' ? 'Try changing the search criteria or date range.' : 'No open admissions. Create a new admission to get started.'}</p>
          {mode !== 'history' && <button onClick={() => navigate('/ipd/new')} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">+ New Admission</button>}
        </div>
      ) : (
        <>
          <p className="text-[11px] text-gray-500 mb-2">
            {summary.total} record{summary.total===1?'':'s'} — {mode==='active' ? 'Open admissions' : 'discharged (old) admissions matching your search'}
          </p>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead><tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Admission ID</th>
                <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Patient</th>
                <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Phone</th>
                <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Admitted</th>
                <th className="py-2.5 px-3 text-left font-semibold text-gray-600">Discharged</th>
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
                    <td className={`py-2.5 px-3 whitespace-nowrap ${a.status==='Discharged' ? 'text-gray-500' : 'text-gray-300'}`}>{a.status==='Discharged' ? fmt(a.discharge_datetime) : '-'}</td>
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
        </>
      )}
    </div>
  );
};

export default IPDHomePage;
