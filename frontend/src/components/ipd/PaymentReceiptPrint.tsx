import React from 'react';
import '../../styles/print.css';

interface Props {
  payment: any;
  onClose: () => void;
}

const PaymentReceiptPrint: React.FC<Props> = ({ payment, onClose }) => {
  const d = (s?: string) => {
    if (!s) return '-';
    const dt = new Date(s);
    return `${('0'+dt.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()]}-${dt.getFullYear()}`;
  };
  const t = (s?: string) => {
    if (!s) return '';
    const dt = new Date(s);
    const hh = dt.getHours();
    const mm = ('0' + dt.getMinutes()).slice(-2);
    return `${hh % 12 || 12}:${mm} ${hh >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div>
      <div className="no-print bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-gray-800 m-0">Payment Receipt</h3>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Print</button>
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Close</button>
          </div>
        </div>
        <p className="text-xs text-gray-500">A5 receipt (148x210 mm).</p>
      </div>

      <div className="slip-container print-template" style={{maxWidth:'520px', margin:'0 auto'}}>
        <div style={{textAlign:'center', borderBottom:'2px solid #1d4ed8', paddingBottom:'2.5mm', marginBottom:'2.5mm'}}>
          <h1 style={{fontSize:'14pt', fontWeight:700, margin:'0 0 0.5mm', color:'#1e3a5f'}}>Ayush Hospital</h1>
          <p style={{fontSize:'8pt', margin:'0 0 0.5mm', color:'#555'}}>KPHB, Hyderabad</p>
          <p style={{fontSize:'7.5pt', margin:0, color:'#555'}}>Phone: +91-9876543210 | Email: contact@ayushhospital.com</p>
        </div>

        <h2 style={{textAlign:'center', fontSize:'11pt', fontWeight:600, margin:'2mm 0'}}>PAYMENT RECEIPT</h2>

        <div style={{display:'flex', justifyContent:'space-between', fontSize:'9pt', marginBottom:'2mm'}}>
          <b>Receipt No: {payment.receipt_number}</b>
          <span>{d(payment.payment_datetime)} {t(payment.payment_datetime)}</span>
        </div>

        <hr style={{border:'none', borderTop:'1.5px solid #2563eb', margin:'2mm 0'}} />

        <div style={{fontSize:'9pt', lineHeight:1.6}}>
          <div><b style={{display:'inline-block', width:'32mm'}}>Patient:</b>{payment.patient_name || '-'}</div>
          <div><b style={{display:'inline-block', width:'32mm'}}>UHID:</b>{payment.patient_uhid || '-'}</div>
          <div><b style={{display:'inline-block', width:'32mm'}}>Admission:</b>{payment.admission_number || '-'}</div>
        </div>

        <hr style={{border:'none', borderTop:'1.5px solid #2563eb', margin:'2mm 0'}} />

        <div style={{fontSize:'10pt', lineHeight:1.6}}>
          <div><b style={{display:'inline-block', width:'32mm'}}>Amount:</b><span style={{fontSize:'12pt', fontWeight:700, color:'#1e3a5f'}}>INR {payment.amount?.toFixed(0)}</span></div>
          <div><b style={{display:'inline-block', width:'32mm'}}>Payment Mode:</b>{payment.payment_mode}</div>
          {payment.transaction_reference && <div><b style={{display:'inline-block', width:'32mm'}}>Reference:</b>{payment.transaction_reference}</div>}
          <div><b style={{display:'inline-block', width:'32mm'}}>Status:</b><span style={{color:'#16a34a'}}>Paid</span></div>
        </div>

        <div style={{textAlign:'right', marginTop:'8mm', fontSize:'9pt'}}>
          <div style={{marginBottom:'5mm'}}>Authorized signature</div>
          <div style={{borderTop:'1px solid #000', width:'40mm', display:'inline-block', paddingTop:'1mm'}}></div>
        </div>

        <div style={{textAlign:'center', fontSize:'7pt', color:'#888', borderTop:'1px solid #ddd', paddingTop:'1.5mm', marginTop:'2mm'}}>
          Computer-generated receipt &bull; Thank you
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptPrint;