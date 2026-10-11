import React, { useState } from 'react';
import { reportsApi } from '../services/api';
import type {
  DailySummaryReport,
  DoctorSummaryReport,
  PatientListReport,
} from '../types';

type ReportTab = 'dailysummary' | 'doctor' | 'patientlist';

const ReportsPage: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [activeTab, setActiveTab] = useState<ReportTab>('dailysummary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [daily, setDaily] = useState<DailySummaryReport | null>(null);
  const [doctorSummary, setDoctorSummary] = useState<DoctorSummaryReport | null>(null);
  const [patientList, setPatientList] = useState<PatientListReport | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'dailysummary') setDaily(await reportsApi.dailySummary(startDate, endDate));
      else if (activeTab === 'doctor') setDoctorSummary(await reportsApi.doctorSummary(startDate, endDate));
      else if (activeTab === 'patientlist') setPatientList(await reportsApi.patientList(startDate, endDate));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    `\u20b9${val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const tabs: { key: ReportTab; label: string }[] = [
    { key: 'dailysummary', label: 'Daily Summary' },
    { key: 'doctor', label: 'Doctor-wise Summary' },
    { key: 'patientlist', label: 'Patient List' },
  ];

  const handleTabChange = (tab: ReportTab) => {
    setActiveTab(tab);
    setDaily(null); setDoctorSummary(null); setPatientList(null);
  };

  const d = (s: string) => { const dt = new Date(s); return `${('0'+dt.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()]}-${dt.getFullYear()}`; };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 m-0">Reports</h2>
        <p className="text-xs text-gray-500 mt-0.5">Daily revenue, footfall, doctor and patient summaries</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Start</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-0.5">End</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <button onClick={fetchReport} disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Loading...' : 'View Report'}</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>{tab.label}</button>
        ))}
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">{error}</div>}

      {/* Daily Summary */}
      {activeTab === 'dailysummary' && daily && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-x-auto">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Daily Summary</h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-2 px-3 text-left font-semibold text-gray-600">Date</th>
                <th className="py-2 px-3 text-right font-semibold text-gray-600">New</th>
                <th className="py-2 px-3 text-right font-semibold text-gray-600">F/up</th>
                <th className="py-2 px-3 text-right font-semibold text-gray-600">Visits</th>
                <th className="py-2 px-3 text-right font-semibold text-gray-600">Unique</th>
                <th className="py-2 px-3 text-right font-semibold text-gray-600">Cash</th>
                <th className="py-2 px-3 text-right font-semibold text-gray-600">UPI</th>
                <th className="py-2 px-3 text-right font-semibold text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {daily.rows.map((row) => (
                <tr key={row.date} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{d(row.date)}</td>
                  <td className="py-2 px-3 text-right">{row.new_visits}</td>
                  <td className="py-2 px-3 text-right">{row.followup_visits}</td>
                  <td className="py-2 px-3 text-right font-medium text-gray-800">{row.total_visits}</td>
                  <td className="py-2 px-3 text-right text-gray-500">{row.unique_patients}</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(row.cash_amount)}</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(row.upi_amount)}</td>
                  <td className="py-2 px-3 text-right font-medium">{formatCurrency(row.total_amount)}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-50">
                <td className="py-2 px-3 text-gray-800">Total</td>
                <td className="py-2 px-3 text-right">{daily.rows.reduce((s,r)=>s+r.new_visits,0)}</td>
                <td className="py-2 px-3 text-right">{daily.rows.reduce((s,r)=>s+r.followup_visits,0)}</td>
                <td className="py-2 px-3 text-right">{daily.grand_total_visits}</td>
                <td className="py-2 px-3 text-right">-</td>
                <td className="py-2 px-3 text-right">{formatCurrency(daily.grand_total_cash)}</td>
                <td className="py-2 px-3 text-right">{formatCurrency(daily.grand_total_upi)}</td>
                <td className="py-2 px-3 text-right">{formatCurrency(daily.grand_total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Doctor Summary */}
      {activeTab === 'doctor' && doctorSummary && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-x-auto">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Doctor-wise Summary</h3>
          <table className="w-full text-xs border-collapse">
            <thead><tr className="border-b border-gray-200 bg-gray-50">
              <th className="py-2 px-3 text-left font-semibold text-gray-600">Doctor</th>
              <th className="py-2 px-3 text-left font-semibold text-gray-600">Department</th>
              <th className="py-2 px-3 text-right font-semibold text-gray-600">New</th>
              <th className="py-2 px-3 text-right font-semibold text-gray-600">F/up</th>
              <th className="py-2 px-3 text-right font-semibold text-gray-600">Total</th>
              <th className="py-2 px-3 text-right font-semibold text-gray-600">Revenue</th>
            </tr></thead>
            <tbody>
              {doctorSummary.rows.map((row) => (
                <tr key={row.doctor_id} className="border-b border-gray-100">
                  <td className="py-2 px-3">{row.doctor_name}</td>
                  <td className="py-2 px-3 text-gray-500">{row.department}</td>
                  <td className="py-2 px-3 text-right">{row.new_visits}</td>
                  <td className="py-2 px-3 text-right">{row.follow_up_visits}</td>
                  <td className="py-2 px-3 text-right font-medium">{row.total_consultations}</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(row.total_revenue)}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-50">
                <td colSpan={4} className="py-2 px-3 text-gray-800">Total</td>
                <td className="py-2 px-3 text-right">{doctorSummary.rows.reduce((s,r)=>s+r.total_consultations,0)}</td>
                <td className="py-2 px-3 text-right">{formatCurrency(doctorSummary.grand_total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Patient List */}
      {activeTab === 'patientlist' && patientList && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-x-auto">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Patient Visit List</h3>
          <p className="text-xs text-gray-500 mb-3">{patientList.total_count} visits</p>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-xs border-collapse">
              <thead><tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-2 px-3 text-left font-semibold text-gray-600">Date</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-600">Patient</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-600">UHID</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-600">Phone</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-600">Doctor</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-600">Type</th>
                <th className="py-2 px-3 text-right font-semibold text-gray-600">Fee</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-600">Pay</th>
              </tr></thead>
              <tbody>
                {patientList.rows.map((row) => (
                  <tr key={row.consultation_number} className="border-b border-gray-100">
                    <td className="py-1.5 px-3 whitespace-nowrap">{row.consultation_date.slice(0,10)}</td>
                    <td className="py-1.5 px-3">{row.patient_name}</td>
                    <td className="py-1.5 px-3 font-mono">{row.patient_uhid}</td>
                    <td className="py-1.5 px-3">{row.patient_phone}</td>
                    <td className="py-1.5 px-3">{row.doctor_name||'-'}</td>
                    <td className="py-1.5 px-3">{row.visit_type}</td>
                    <td className="py-1.5 px-3 text-right">{formatCurrency(row.fee_amount)}</td>
                    <td className="py-1.5 px-3">{row.payment_mode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!daily && !doctorSummary && !patientList && !loading && !error && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Select a date range and click &quot;View Report&quot;</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
