import React, { useState } from 'react';
import { reportsApi } from '../services/api';
import type {
  RevenueReport,
  FootfallReport,
  DoctorSummaryReport,
  PatientListReport,
} from '../types';

type ReportTab = 'revenue' | 'footfall' | 'doctor' | 'patientlist';

const ReportsPage: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [activeTab, setActiveTab] = useState<ReportTab>('revenue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [footfall, setFootfall] = useState<FootfallReport | null>(null);
  const [doctorSummary, setDoctorSummary] = useState<DoctorSummaryReport | null>(null);
  const [patientList, setPatientList] = useState<PatientListReport | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'revenue') {
        const data = await reportsApi.revenue(startDate, endDate);
        setRevenue(data);
      } else if (activeTab === 'footfall') {
        const data = await reportsApi.footfall(startDate, endDate);
        setFootfall(data);
      } else if (activeTab === 'doctor') {
        const data = await reportsApi.doctorSummary(startDate, endDate);
        setDoctorSummary(data);
      } else if (activeTab === 'patientlist') {
        const data = await reportsApi.patientList(startDate, endDate);
        setPatientList(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    `\u20b9${val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const tabs: { key: ReportTab; label: string }[] = [
    { key: 'revenue', label: 'Daily Revenue' },
    { key: 'footfall', label: 'Patient Footfall' },
    { key: 'doctor', label: 'Doctor-wise Summary' },
    { key: 'patientlist', label: 'Patient List' },
  ];

  const handleTabChange = (tab: ReportTab) => {
    setActiveTab(tab);
    setRevenue(null);
    setFootfall(null);
    setDoctorSummary(null);
    setPatientList(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 m-0">Reports</h2>
        <p className="text-sm text-gray-500 mt-1">View revenue, footfall, and doctor summaries</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <button onClick={fetchReport} disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? 'Loading...' : 'View Report'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-6">{error}</div>
      )}

      {activeTab === 'revenue' && revenue && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Revenue Report</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-600">Visit Type</th>
                <th className="text-right py-2 font-medium text-gray-600">Cash</th>
                <th className="text-right py-2 font-medium text-gray-600">UPI</th>
                <th className="text-right py-2 font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {revenue.rows.map((row) => (
                <tr key={row.visit_type} className="border-b border-gray-100">
                  <td className="py-2">{row.visit_type}</td>
                  <td className="text-right py-2">{formatCurrency(row.cash_amount)}</td>
                  <td className="text-right py-2">{formatCurrency(row.upi_amount)}</td>
                  <td className="text-right py-2 font-medium">{formatCurrency(row.total)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2 text-gray-800">Total</td>
                <td className="text-right py-2">{formatCurrency(revenue.grand_total_cash)}</td>
                <td className="text-right py-2">{formatCurrency(revenue.grand_total_upi)}</td>
                <td className="text-right py-2">{formatCurrency(revenue.grand_total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'footfall' && footfall && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Patient Footfall</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{footfall.total_visits}</p>
              <p className="text-xs text-blue-600">Total Visits</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{footfall.unique_patients}</p>
              <p className="text-xs text-green-600">Unique Patients</p>
            </div>
          </div>
          {footfall.day_wise && footfall.day_wise.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Day-wise Breakdown</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">Date</th>
                    <th className="text-right py-2 font-medium text-gray-600">Visits</th>
                    <th className="text-right py-2 font-medium text-gray-600">Unique Patients</th>
                  </tr>
                </thead>
                <tbody>
                  {footfall.day_wise.map((day) => (
                    <tr key={day.date} className="border-b border-gray-100">
                      <td className="py-2">{day.date}</td>
                      <td className="text-right py-2">{day.visits}</td>
                      <td className="text-right py-2">{day.unique_patients}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'doctor' && doctorSummary && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Doctor-wise Summary</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-600">Doctor</th>
                <th className="text-left py-2 font-medium text-gray-600">Department</th>
                <th className="text-right py-2 font-medium text-gray-600">New</th>
                <th className="text-right py-2 font-medium text-gray-600">Follow-up</th>
                <th className="text-right py-2 font-medium text-gray-600">Total</th>
                <th className="text-right py-2 font-medium text-gray-600">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {doctorSummary.rows.map((row) => (
                <tr key={row.doctor_id} className="border-b border-gray-100">
                  <td className="py-2">{row.doctor_name}</td>
                  <td className="py-2">{row.department}</td>
                  <td className="text-right py-2">{row.new_visits}</td>
                  <td className="text-right py-2">{row.follow_up_visits}</td>
                  <td className="text-right py-2 font-medium">{row.total_consultations}</td>
                  <td className="text-right py-2">{formatCurrency(row.total_revenue)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td colSpan={4} className="py-2 text-gray-800">Grand Total</td>
                <td className="text-right py-2">
                  {doctorSummary.rows.reduce((sum, r) => sum + r.total_consultations, 0)}
                </td>
                <td className="text-right py-2">{formatCurrency(doctorSummary.grand_total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'patientlist' && patientList && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-2">Patient Visit List</h3>
          <p className="text-xs text-gray-500 mb-4">{patientList.total_count} visits found</p>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-600">Date</th>
                  <th className="text-left py-2 font-medium text-gray-600">Patient</th>
                  <th className="text-left py-2 font-medium text-gray-600">UHID</th>
                  <th className="text-left py-2 font-medium text-gray-600">Phone</th>
                  <th className="text-left py-2 font-medium text-gray-600">Doctor</th>
                  <th className="text-left py-2 font-medium text-gray-600">Type</th>
                  <th className="text-right py-2 font-medium text-gray-600">Fee</th>
                  <th className="text-left py-2 font-medium text-gray-600">Payment</th>
                </tr>
              </thead>
              <tbody>
                {patientList.rows.map((row) => (
                  <tr key={row.consultation_number} className="border-b border-gray-100">
                    <td className="py-1.5 whitespace-nowrap">{row.consultation_date.slice(0, 10)}</td>
                    <td className="py-1.5">{row.patient_name}</td>
                    <td className="py-1.5">{row.patient_uhid}</td>
                    <td className="py-1.5">{row.patient_phone}</td>
                    <td className="py-1.5">{row.doctor_name || '-'}</td>
                    <td className="py-1.5">{row.visit_type}</td>
                    <td className="py-1.5 text-right">₹{row.fee_amount.toFixed(0)}</td>
                    <td className="py-1.5">{row.payment_mode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!revenue && !footfall && !doctorSummary && !patientList && !loading && !error && (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Select a date range and click &quot;View Report&quot;</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
