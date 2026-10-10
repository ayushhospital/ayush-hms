import React from 'react';
import '../../styles/print.css';
import type { ConsultationResponse } from '../../types';

interface ConsultationSlipProps {
  consultation: ConsultationResponse;
  onClose: () => void;
}

const ConsultationSlip: React.FC<ConsultationSlipProps> = ({ consultation, onClose }) => {
  const d = (s: string) => new Date(s).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const doctorLine = consultation.custom_doctor_name || consultation.doctor_name || '';

  return (
    <div>
      <div className="no-print bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800 m-0">Consultation Slip</h3>
          <div className="flex gap-2">
            <button onClick={() => window.print()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Print
            </button>
            <button onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Close
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500">Designed for A5 paper (148 x 210 mm).</p>
      </div>

      <div className="slip-container bg-white border border-gray-200 rounded-xl p-5">
        <div className="slip-header">
          <h1 style={{fontSize:'13pt', fontWeight:700, margin:'0 0 3mm'}}>Ayush Hospital</h1>
          <p style={{fontSize:'8pt', margin:0}}>Phone: +91-9876543210</p>
        </div>

        <div className="slip-body" style={{fontSize:'9pt'}}>
          <div style={{textAlign:'center', fontWeight:600, fontSize:'10pt', margin:'3mm 0'}}>
            CONSULTATION SLIP
          </div>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <tbody>
              {[
                ['Consultation No', consultation.consultation_number],
                ['Date', d(consultation.consultation_date)],
                ['', ''],
                ['UHID', consultation.patient_uhid],
                ['Patient', consultation.patient_name],
                ['Age / Gender', `${consultation.patient_age} / ${consultation.patient_gender}`],
                ['Phone', consultation.patient_phone],
                ['', ''],
                ['Doctor', doctorLine],
                ['Visit Type', consultation.visit_type],
                ['Fee', `\u20b9${consultation.fee_amount.toFixed(2)}`],
                ['Payment', consultation.payment_mode],
                ['', ''],
                ['Valid Until', d(consultation.valid_until)],
              ].map(([label, val], i) =>
                label ? (
                  <tr key={i}>
                    <td style={{padding:'1mm 2mm 1mm 0', fontWeight:600, width:'40%'}}>{label}</td>
                    <td style={{padding:'1mm 0'}}>{val}</td>
                  </tr>
                ) : (
                  <tr key={i}><td colSpan={2} style={{borderTop:'1px solid #ccc'}}></td></tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="slip-footer" style={{textAlign:'center', fontSize:'7pt', color:'#666', marginTop:'4mm'}}>
          Computer-generated slip &bull; Valid for 7 days
        </div>
      </div>
    </div>
  );
};

export default ConsultationSlip;
