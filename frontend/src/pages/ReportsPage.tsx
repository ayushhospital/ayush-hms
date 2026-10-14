import React, { useState } from 'react';
import { reportsApi } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import type {
  DailySummaryReport,
  DoctorSummaryReport,
  PatientListReport,
  IPDAdmissionsReport,
  IPDBillingReport,
} from '../types';

type ReportKey = 'dailysummary' | 'doctor' | 'patientlist' | 'ipdadmissions' | 'ipdbilling';

interface ReportMeta {
  key: ReportKey;
  group: 'OPD' | 'IPD';
  label: string;
  desc: string;
}

const REPORTS: ReportMeta[] = [
  { key: 'dailysummary', group: 'OPD', label: 'Daily Summary', desc: 'Day-wise revenue & footfall' },
  { key: 'doctor', group: 'OPD', label: 'Doctor-wise Summary', desc: 'Consultations & collections per doctor' },
  { key: 'patientlist', group: 'OPD', label: 'Patient Visit List', desc: 'Individual OPD visits in range' },
  { key: 'ipdadmissions', group: 'IPD', label: 'Admissions Summary', desc: 'New admissions by day & type' },
  { key: 'ipdbilling', group: 'IPD', label: 'Billing Summary', desc: 'Charges, payments & outstanding per admission' },
];

const ReportButton: React.FC<{ meta: ReportMeta; active: boolean; onClick: () => void; count: number }> = ({ meta, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`hms-card flex-1 min-w-[190px] text-left px-4 py-3 transition-all cursor-pointer ${active ? 'border-blue-500 ring-2 ring-blue-200' : 'hover:border-blue-200'}`}
  >
    <div className="flex items-center justify-between mb-1">
      <span className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-blue-600' : 'text-slate-400'}`}>{meta.label}</span>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
    </div>
    <p className="text-[11px] text-slate-500 m-0 leading-snug">{meta.desc}</p>
  </button>
);

const ReportsPage: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [activeReport, setActiveReport] = useState<ReportKey>('dailysummary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [daily, setDaily] = useState<DailySummaryReport | null>(null);
  const [doctorSummary, setDoctorSummary] = useState<DoctorSummaryReport | null>(null);
  const [patientList, setPatientList] = useState<PatientListReport | null>(null);
  const [ipdAdmissions, setIpdAdmissions] = useState<IPDAdmissionsReport | null>(null);
  const [ipdBilling, setIpdBilling] = useState<IPDBillingReport | null>(null);

  const fetchReport = async (key: ReportKey = activeReport) => {
    setLoading(true);
    setError('');
    try {
      if (key === 'dailysummary') setDaily(await reportsApi.dailySummary(startDate, endDate));
      else if (key === 'doctor') setDoctorSummary(await reportsApi.doctorSummary(startDate, endDate));
      else if (key === 'patientlist') setPatientList(await reportsApi.patientList(startDate, endDate));
      else if (key === 'ipdadmissions') setIpdAdmissions(await reportsApi.ipdAdmissionsSummary(startDate, endDate));
      else if (key === 'ipdbilling') setIpdBilling(await reportsApi.ipdBilling(startDate, endDate));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const selectReport = (key: ReportKey) => {
    setActiveReport(key);
    fetchReport(key);
  };

  const formatCurrency = (val: number) =>
    `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const d = (s: string) => {
    const dt = new Date(s);
    return `${('0'+dt.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()]}-${dt.getFullYear()}`;
  };

  const opdReports = REPORTS.filter((r) => r.group === 'OPD');
  const ipdReports = REPORTS.filter((r) => r.group === 'IPD');

  const GroupPicker: React.FC<{ group: 'OPD' | 'IPD'; items: ReportMeta[] }> = ({ group, items }) => (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{group} Reports</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
      <div className="flex flex-wrap gap-3">
        {items.map((m) => (
          <ReportButton
            key={m.key}
            meta={m}
            active={activeReport === m.key}
            onClick={() => selectReport(m.key)}
            count={m.key === 'dailysummary' ? (daily?.rows.length ?? 0) : m.key === 'doctor' ? (doctorSummary?.rows.length ?? 0) : m.key === 'patientlist' ? (patientList?.total_count ?? 0) : m.key === 'ipdadmissions' ? (ipdAdmissions?.rows.length ?? 0) : (ipdBilling?.rows.length ?? 0)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Reports" subtitle="OPD revenue, footfall and doctor summaries — plus IPD admissions and billing" />

      {/* Date range filter */}
      <div className="hms-card p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-0.5">Start</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-0.5">End</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => fetchReport()} disabled={loading}
            className="hms-btn-primary disabled:opacity-50">
            {loading ? 'Loading...' : 'View Report'}
          </button>
        </div>
      </div>

      {/* Report pickers grouped by section */}
      <GroupPicker group="OPD" items={opdReports} />
      <GroupPicker group="IPD" items={ipdReports} />

      {error && <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{error}</div>}

      {/* ===== OPD: Daily Summary ===== */}
      {activeReport === 'dailysummary' && daily && (
        <div className="hms-card p-5 overflow-x-auto">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="px-4 py-2 bg-blue-50 rounded-lg"><p className="text-lg font-bold text-blue-700 m-0">{daily.grand_total_visits}</p><p className="text-[10px] text-blue-600 m-0">Total Visits</p></div>
            <div className="px-4 py-2 bg-emerald-50 rounded-lg"><p className="text-lg font-bold text-emerald-700 m-0">{daily.grand_total_cash.toLocaleString('en-IN')}</p><p className="text-[10px] text-emerald-600 m-0">Cash (₹)</p></div>
            <div className="px-4 py-2 bg-violet-50 rounded-lg"><p className="text-lg font-bold text-violet-700 m-0">{daily.grand_total_upi.toLocaleString('en-IN')}</p><p className="text-[10px] text-violet-600 m-0">UPI (₹)</p></div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg"><p className="text-lg font-bold text-slate-800 m-0">{daily.grand_total.toLocaleString('en-IN')}</p><p className="text-[10px] text-slate-600 m-0">Grand Total (₹)</p></div>
          </div>
          <table className="hms-table">
            <thead><tr>
              <th>Date</th><th>New</th><th>Follow-up</th><th>Visits</th><th>Patients</th>
              <th className="text-right">Cash</th><th className="text-right">UPI</th><th className="text-right">Total</th>
            </tr></thead>
            <tbody>
              {daily.rows.map((row) => (
                <tr key={row.date}>
                  <td className="font-medium">{d(row.date)}</td>
                  <td>{row.new_visits}</td>
                  <td>{row.followup_visits}</td>
                  <td>{row.total_visits}</td>
                  <td>{row.unique_patients}</td>
                  <td className="text-right">₹{row.cash_amount.toLocaleString('en-IN')}</td>
                  <td className="text-right">₹{row.upi_amount.toLocaleString('en-IN')}</td>
                  <td className="text-right font-semibold">₹{row.total_amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-slate-50 font-semibold">
              <td colSpan={3}>Total</td><td>{daily.grand_total_visits}</td><td></td>
              <td className="text-right">₹{daily.grand_total_cash.toLocaleString('en-IN')}</td>
              <td className="text-right">₹{daily.grand_total_upi.toLocaleString('en-IN')}</td>
              <td className="text-right">₹{daily.grand_total.toLocaleString('en-IN')}</td>
            </tr></tfoot>
          </table>
        </div>
      )}

      {/* ===== OPD: Doctor-wise ===== */}
      {activeReport === 'doctor' && doctorSummary && (
        <div className="hms-card p-5 overflow-x-auto">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Doctor-wise Summary</h3>
          <table className="hms-table">
            <thead><tr>
              <th>Doctor</th><th>Department</th><th className="text-right">New</th><th className="text-right">Follow-up</th>
              <th className="text-right">Consultations</th><th className="text-right">Revenue</th>
            </tr></thead>
            <tbody>
              {doctorSummary.rows.map((row) => (
                <tr key={row.doctor_id}>
                  <td className="font-medium">{row.doctor_name}</td>
                  <td>{row.department}</td>
                  <td className="text-right">{row.new_visits}</td>
                  <td className="text-right">{row.follow_up_visits}</td>
                  <td className="text-right">{row.total_consultations}</td>
                  <td className="text-right">{formatCurrency(row.total_revenue)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-slate-50 font-semibold">
              <td colSpan={4}>Total</td>
              <td className="text-right">{doctorSummary.rows.reduce((s,r)=>s+r.total_consultations,0)}</td>
              <td className="text-right">{formatCurrency(doctorSummary.grand_total)}</td>
            </tr></tfoot>
          </table>
        </div>
      )}

      {/* ===== OPD: Patient List ===== */}
      {activeReport === 'patientlist' && patientList && (
        <div className="hms-card p-5 overflow-x-auto">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Patient Visit List</h3>
          <p className="text-xs text-gray-500 mb-3">{patientList.total_count} visits</p>
          <div className="max-h-96 overflow-y-auto">
            <table className="hms-table">
              <thead><tr>
                <th>Date</th><th>Patient</th><th>UHID</th><th>Phone</th><th>Doctor</th><th>Type</th>
                <th className="text-right">Fee</th><th>Pay</th>
              </tr></thead>
              <tbody>
                {patientList.rows.map((row) => (
                  <tr key={row.consultation_number}>
                    <td className="whitespace-nowrap">{row.consultation_date.slice(0,10)}</td>
                    <td className="font-medium">{row.patient_name}</td>
                    <td className="font-mono">{row.patient_uhid}</td>
                    <td>{row.patient_phone}</td>
                    <td>{row.doctor_name||'-'}</td>
                    <td>{row.visit_type}</td>
                    <td className="text-right">{formatCurrency(row.fee_amount)}</td>
                    <td>{row.payment_mode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== IPD: Admissions Summary ===== */}
      {activeReport === 'ipdadmissions' && ipdAdmissions && (
        <div className="hms-card p-5 overflow-x-auto">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="px-4 py-2 bg-blue-50 rounded-lg"><p className="text-lg font-bold text-blue-700 m-0">{ipdAdmissions.grand_total}</p><p className="text-[10px] text-blue-600 m-0">Total Admissions</p></div>
            <div className="px-4 py-2 bg-emerald-50 rounded-lg"><p className="text-lg font-bold text-emerald-700 m-0">{ipdAdmissions.grand_open}</p><p className="text-[10px] text-emerald-600 m-0">Open</p></div>
            <div className="px-4 py-2 bg-slate-100 rounded-lg"><p className="text-lg font-bold text-slate-800 m-0">{ipdAdmissions.grand_discharged}</p><p className="text-[10px] text-slate-600 m-0">Discharged</p></div>
          </div>
          <table className="hms-table">
            <thead><tr>
              <th>Date</th><th className="text-right">Admitted</th><th className="text-right">Open</th><th className="text-right">Discharged</th>
              <th className="text-right">Planned</th><th className="text-right">Emergency</th><th className="text-right">Referral</th>
            </tr></thead>
            <tbody>
              {ipdAdmissions.rows.map((row) => (
                <tr key={row.date}>
                  <td className="font-medium">{d(row.date)}</td>
                  <td className="text-right">{row.total_admissions}</td>
                  <td className="text-right">{row.open_count}</td>
                  <td className="text-right">{row.discharged_count}</td>
                  <td className="text-right">{row.planned}</td>
                  <td className="text-right">{row.emergency}</td>
                  <td className="text-right">{row.referral}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-slate-50 font-semibold">
              <td>Total</td>
              <td className="text-right">{ipdAdmissions.grand_total}</td>
              <td className="text-right">{ipdAdmissions.grand_open}</td>
              <td className="text-right">{ipdAdmissions.grand_discharged}</td>
              <td colSpan={3}></td>
            </tr></tfoot>
          </table>
        </div>
      )}

      {/* ===== IPD: Billing Summary ===== */}
      {activeReport === 'ipdbilling' && ipdBilling && (
        <div className="hms-card p-5 overflow-x-auto">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="px-4 py-2 bg-blue-50 rounded-lg"><p className="text-lg font-bold text-blue-700 m-0">{formatCurrency(ipdBilling.grand_charges)}</p><p className="text-[10px] text-blue-600 m-0">Total Charges</p></div>
            <div className="px-4 py-2 bg-emerald-50 rounded-lg"><p className="text-lg font-bold text-emerald-700 m-0">{formatCurrency(ipdBilling.grand_paid)}</p><p className="text-[10px] text-emerald-600 m-0">Total Paid</p></div>
            <div className="px-4 py-2 bg-amber-50 rounded-lg"><p className="text-lg font-bold text-amber-700 m-0">{formatCurrency(ipdBilling.grand_outstanding)}</p><p className="text-[10px] text-amber-600 m-0">Outstanding</p></div>
          </div>
          <table className="hms-table">
            <thead><tr>
              <th>Admission</th><th>Date</th><th>Patient</th><th>UHID</th><th>Ward / Bed</th>
              <th className="text-right">Charges</th><th className="text-right">Paid</th><th className="text-right">Outstanding</th>
            </tr></thead>
            <tbody>
              {ipdBilling.rows.map((row) => (
                <tr key={row.admission_number}>
                  <td className="font-mono font-medium">{row.admission_number}</td>
                  <td className="whitespace-nowrap">{d(row.admission_date)}</td>
                  <td className="font-medium">{row.patient_name}</td>
                  <td className="font-mono">{row.patient_uhid}</td>
                  <td>{row.ward_bed || '-'}</td>
                  <td className="text-right">{formatCurrency(row.total_charges)}</td>
                  <td className="text-right">{formatCurrency(row.total_paid)}</td>
                  <td className={`text-right font-semibold ${row.outstanding > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{formatCurrency(row.outstanding)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-slate-50 font-semibold">
              <td colSpan={5}>Total ({ipdBilling.rows.length} admissions)</td>
              <td className="text-right">{formatCurrency(ipdBilling.grand_charges)}</td>
              <td className="text-right">{formatCurrency(ipdBilling.grand_paid)}</td>
              <td className="text-right">{formatCurrency(ipdBilling.grand_outstanding)}</td>
            </tr></tfoot>
          </table>
        </div>
      )}

      {!daily && !doctorSummary && !patientList && !ipdAdmissions && !ipdBilling && !loading && !error && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Select a date range and click &quot;View Report&quot;</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
