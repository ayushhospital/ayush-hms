import React from 'react';
import '../../styles/print.css';
import type { ConsultationResponse } from '../../types';

interface ConsultationSlipProps {
  consultation: ConsultationResponse;
  onClose: () => void;
}

const ConsultationSlip: React.FC<ConsultationSlipProps> = ({ consultation, onClose }) => {
  const d = (s: string) => {
    const dt = new Date(s);
    const day = ('0' + dt.getDate()).slice(-2);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${day}-${months[dt.getMonth()]}-${dt.getFullYear()} ${('0'+dt.getHours()).slice(-2)}:${('0'+dt.getMinutes()).slice(-2)}`;
  };
  const ds = (s: string) => {
    const dt = new Date(s);
    return `${('0'+dt.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()]}-${dt.getFullYear()}`;
  };
  const dl = consultation.custom_doctor_name || consultation.doctor_name || '';

  const inWords = (n: number) => {
    if (n===0) return 'Zero';
    const o=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const t=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    const c = (x: number): string => {
      if (x<20) return o[x];
      if (x<100) return t[Math.floor(x/10)]+' '+o[x%10];
      if (x<1000) return o[Math.floor(x/100)]+' Hundred '+c(x%100);
      if (x<100000) return c(Math.floor(x/1000))+' Thousand '+c(x%1000);
      if (x<10000000) return c(Math.floor(x/100000))+' Lakh '+c(x%100000);
      return c(Math.floor(x/10000000))+' Crore '+c(x%10000000);
    };
    return c(Math.round(n)).trim();
  };

  return (
    <div>
      <div className="no-print bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-gray-800 m-0">Consultation Slip</h3>
          <div className="flex gap-2">
            <button onClick={() => window.print()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Print</button>
            <button onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Close</button>
          </div>
        </div>
        <p className="text-xs text-gray-500">A5 slip (148x210 mm).</p>
      </div>

      <div className="slip-container" style={{maxWidth:'500px', margin:'0 auto'}}>
        <div style={{textAlign:'center', borderBottom:'2px solid #2563eb', paddingBottom:'2.5mm', marginBottom:'2.5mm'}}>
          <h1 style={{fontSize:'14pt', fontWeight:700, margin:'0 0 0.5mm', color:'#1e3a5f'}}>Ayush Hospital</h1>
          <p style={{fontSize:'8pt', margin:'0 0 0.5mm', color:'#555'}}>KPHB, Hyderabad</p>
          <p style={{fontSize:'7.5pt', margin:0, color:'#555'}}>Phone: +91-9876543210 | Email: contact@ayushhospital.com</p>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', fontSize:'9pt', marginBottom:'2mm'}}>
          <b>Consultation No: {consultation.consultation_number}</b>
          <span>{d(consultation.consultation_date)}</span>
        </div>

        <hr style={{border:'none', borderTop:'1px dashed #bbb', margin:'1mm 0'}} />

        <div style={{fontSize:'9pt', lineHeight:1.6}}>
          <div><b style={{display:'inline-block', width:'28mm'}}>UHID:</b>{consultation.patient_uhid}</div>
          <div><b style={{display:'inline-block', width:'28mm'}}>Patient:</b>{consultation.patient_name}</div>
          <div><b style={{display:'inline-block', width:'28mm'}}>Phone:</b>{consultation.patient_phone}</div>
          <div><b style={{display:'inline-block', width:'28mm'}}>Age / Gender:</b>{consultation.patient_age} / {consultation.patient_gender}</div>
        </div>

        <hr style={{border:'none', borderTop:'1px dashed #bbb', margin:'1mm 0'}} />

        <div style={{fontSize:'9pt', lineHeight:1.6}}>
          <div><b style={{display:'inline-block', width:'32mm'}}>Doctor:</b>{dl}</div>
          <div><b style={{display:'inline-block', width:'32mm'}}>Consultation Fee:</b>INR {consultation.fee_amount.toFixed(0)} ({inWords(consultation.fee_amount)} rupees only)</div>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <span><b>Payment:</b> {consultation.payment_mode}</span>
            <span><b>Visit:</b> {consultation.visit_type}</span>
          </div>
        </div>

        <hr style={{border:'none', borderTop:'1px dashed #bbb', margin:'1mm 0'}} />

        <div style={{fontSize:'9pt', marginBottom:'2.5mm'}}>
          <b>Validity:</b> {ds(consultation.consultation_date)} to {ds(consultation.valid_until)}
        </div>

        <div style={{textAlign:'right', marginTop:'6mm', fontSize:'9pt'}}>
          <div style={{marginBottom:'5mm'}}>Authorized signature</div>
          <div style={{borderTop:'1px solid #000', width:'40mm', display:'inline-block', paddingTop:'1mm'}}></div>
        </div>

        <div style={{textAlign:'center', fontSize:'7pt', color:'#888', borderTop:'1px solid #ddd', paddingTop:'1.5mm', marginTop:'2mm'}}>
          Computer-generated slip | Valid for 7 days from the date of issue
        </div>
      </div>
    </div>
  );
};

export default ConsultationSlip;
