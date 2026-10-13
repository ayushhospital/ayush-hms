import React from 'react';
import '../../styles/print.css';

interface Props {
  discharge: any;
  admission: any;
  attendant: any;
  onClose: () => void;
}

const fmt = (s?: string) => {
  if (!s) return '-';
  const dt = new Date(s);
  return `${('0'+dt.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()]}-${dt.getFullYear()}`;
};

const section = (title: string, value?: string) =>
  value ? <div style={{marginBottom:'2mm'}}><h3 style={{fontSize:'10pt', fontWeight:600, margin:'0 0 0.5mm'}}>{title}</h3><p style={{fontSize:'9pt', margin:0, whiteSpace:'pre-wrap'}}>{value}</p></div> : null;

const DischargePrintTemplate: React.FC<Props> = ({ discharge, admission, attendant, onClose }) => {
  const label = discharge.status === 'Finalized' ? 'DISCHARGE SUMMARY' : 'DISCHARGE SUMMARY (DRAFT)';

  return (
    <div>
      <div className="no-print bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-gray-800 m-0">Discharge Summary</h3>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Print</button>
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Close</button>
          </div>
        </div>
        <p className="text-xs text-gray-500">A4 document.</p>
      </div>

      <div className="print-template" style={{maxWidth:'720px', margin:'0 auto', padding:'8mm', fontFamily:'serif'}}>
        <div style={{textAlign:'center', borderBottom:'2px solid #1d4ed8', paddingBottom:'3mm', marginBottom:'3mm'}}>
          <h1 style={{fontSize:'16pt', fontWeight:700, margin:'0 0 1mm', color:'#1e3a5f'}}>Ayush Hospital</h1>
          <p style={{fontSize:'9pt', margin:'0 0 0.5mm', color:'#555'}}>KPHB, Hyderabad</p>
          <p style={{fontSize:'8pt', margin:0, color:'#555'}}>Phone: +91-9876543210 | Email: contact@ayushhospital.com</p>
        </div>

        <h2 style={{textAlign:'center', fontSize:'13pt', fontWeight:700, margin:'2mm 0', color:'#1e3a5f'}}>{label}</h2>
        {discharge.status !== 'Finalized' && <p style={{textAlign:'center', fontSize:'10pt', fontWeight:700, color:'#d00'}}>DRAFT — NOT FINALIZED</p>}

        <div style={{display:'flex', justifyContent:'space-between', fontSize:'9pt', marginBottom:'2mm'}}>
          <span><b>Admission No:</b> {admission.admission_number}</span>
          <span><b>Date:</b> {fmt(new Date().toISOString())}</span>
        </div>

        <hr style={{border:'none', borderTop:'1.5px solid #000', margin:'2mm 0'}} />

        <div style={{fontSize:'9pt', lineHeight:1.6}}>
          <div><b>Patient Name:</b> {admission.patient_name}</div>
          <div><b>UHID:</b> {admission.patient_uhid}</div>
          <div><b>Age:</b> {admission.patient_age} Years</div>
          <div><b>Gender:</b> {admission.patient_gender}</div>
          <div><b>Admission Date:</b> {fmt(admission.admission_datetime)}</div>
          {discharge.discharge_datetime && <div><b>Discharge Date:</b> {fmt(discharge.discharge_datetime)}</div>}
          <div><b>Admitting Doctor:</b> {admission.doctor_name}</div>
        </div>

        <hr style={{border:'none', borderTop:'1.5px solid #000', margin:'2mm 0'}} />

        {section('Reason for Admission', admission.reason_for_admission)}
        {section('Final Diagnosis', discharge.final_diagnosis)}
        {section('Clinical History', discharge.clinical_history)}
        {section('Examination Findings', discharge.examination_findings)}
        {section('Investigations & Results', discharge.investigations)}
        {section('Treatment Given', discharge.treatment_given)}
        {section('Procedures Performed', discharge.procedures_performed)}
        {section('Condition at Discharge', discharge.condition_at_discharge)}
        {section('Discharge Medications', discharge.discharge_medications)}
        {section('Follow-up Instructions', discharge.follow_up_instructions)}
        {section('Diet/Activity Advice', discharge.diet_activity_advice)}
        {section('Warning Signs', discharge.warning_signs)}
        {section('Additional Notes', discharge.additional_notes)}

        <hr style={{border:'none', borderTop:'1pt solid #000', margin:'4mm 0'}} />

        {attendant && (
          <div style={{fontSize:'9pt', lineHeight:1.6}}>
            <h3 style={{fontSize:'10pt', fontWeight:600, margin:'0 0 0.5mm'}}>Attendant</h3>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <span><b>Name:</b> {attendant.name}</span>
              <span><b>Phone:</b> {attendant.phone_number}</span>
            </div>
            <div><b>Relation:</b> {attendant.relation}</div>
          </div>
        )}

        <div style={{textAlign:'right', marginTop:'8mm', fontSize:'10pt'}}>
          <div style={{marginBottom:'5mm'}}>Discharging Doctor</div>
          <div style={{borderTop:'1px solid #000', width:'45mm', display:'inline-block', paddingTop:'1mm'}}></div>
        </div>

        <div style={{textAlign:'center', fontSize:'8pt', color:'#888', borderTop:'1px solid #ddd', paddingTop:'2mm', marginTop:'3mm'}}>
          Computer-generated discharge summary &bull; Ayush Hospital, KPHB, Hyderabad
        </div>
      </div>
    </div>
  );
};

export default DischargePrintTemplate;