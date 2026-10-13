import React from 'react';
import '../../styles/print.css';
import type { IPDAdmissionResponse } from '../../types';

interface Props {
  admission: IPDAdmissionResponse;
  charges: any[];
  payments: any[];
  billing: any;
  mode: 'final' | 'detailed';
  onClose: () => void;
}

const BillPrintTemplate: React.FC<Props> = ({ admission, charges, payments, billing, mode, onClose }) => {
  const d = (s?: string | null) => {
    if (!s) return '-';
    const dt = new Date(s);
    return `${('0'+dt.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()]}-${dt.getFullYear()}`;
  };
  const dt = (s?: string | null) => {
    if (!s) return '-';
    const t = new Date(s);
    const hh = t.getHours();
    const mm = ('0'+t.getMinutes()).slice(-2);
    return `${d(s)} ${hh%12||12}:${mm} ${hh>=12?'PM':'AM'}`;
  };
  const num = (n: any) => (typeof n==='number' && n%1!==0 ? n.toFixed(2) : n);
  const title = mode === 'final' ? 'FINAL BILL' : 'DETAILED BILL';

  // Final bill: aggregate same category+description into one row (qty sum, amount sum, rate = avg)
  const summarised = (() => {
    const map = new Map<string, any>();
    for (const ch of charges) {
      const key = (ch.category||'Other') + '|' + ch.description;
      const ex = map.get(key);
      if (ex) { ex.quantity += ch.quantity; ex.amount += ch.total_amount; }
      else map.set(key, {description: ch.description, category: ch.category||'Other', quantity: ch.quantity, amount: ch.total_amount});
    }
    return Array.from(map.entries()).map(([key, v]) => ({...v, rate: v.amount / v.quantity, key}));
  })();

  return (<div>
    <div className="no-print bg-white rounded-xl border border-gray-200 p-6 mb-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-gray-800 m-0">{title}</h3>
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

      <h2 style={{textAlign:'center', fontSize:'12pt', fontWeight:600, margin:'2mm 0'}}>{title}</h2>

      <div style={{display:'flex', justifyContent:'space-between', fontSize:'10pt', marginBottom:'2mm'}}>
        <div><b>Bill No:</b> {admission.admission_number}-{mode==='final'?'F':'D'}</div>
        <div><b>Date:</b> {d(new Date().toISOString())}</div>
      </div>

      <hr style={{border:'none', borderTop:'1.5px solid #000', margin:'2mm 0'}} />

      <div style={{fontSize:'10pt', lineHeight:1.7}}>
        <div><b>Patient:</b> {admission.patient_name}</div>
        <div><b>UHID:</b> {admission.patient_uhid}</div>
        <div><b>Admission:</b> {admission.admission_number}</div>
        <div><b>Admitted:</b> {d(admission.admission_datetime)}</div>
        {mode==='final' && <div><b>Discharge Date:</b> {d(admission.discharge_datetime)}</div>}
        <div><b>Doctor:</b> {admission.doctor_name}</div>
      </div>

      <hr style={{border:'none', borderTop:'1.5px solid #000', margin:'2mm 0'}} />

      {charges.length > 0 && <div style={{fontSize:'9pt'}}>
        <h3 style={{fontSize:'10pt', fontWeight:600, margin:'2mm 0'}}>{mode==='final' ? 'Charges Summary' : 'Charges (itemized)'}</h3>

        {mode==='detailed' && <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1.5px solid #000'}}>
            <th style={{padding:'1mm 2mm', textAlign:'left', fontWeight:600, fontSize:'9pt'}}>Date &amp; Time</th>
            <th style={{padding:'1mm 2mm', textAlign:'left', fontWeight:600, fontSize:'9pt'}}>Description</th>
            <th style={{padding:'1mm 2mm', textAlign:'left', fontWeight:600, fontSize:'9pt'}}>Category</th>
            <th style={{padding:'1mm 2mm', textAlign:'center', fontWeight:600, fontSize:'9pt'}}>Qty</th>
            <th style={{padding:'1mm 2mm', textAlign:'right', fontWeight:600, fontSize:'9pt'}}>Rate</th>
            <th style={{padding:'1mm 2mm', textAlign:'right', fontWeight:600, fontSize:'9pt'}}>Amount</th>
          </tr></thead>
          <tbody>{charges.map((ch:any) => (
            <tr key={ch.id} style={{borderBottom:'1px solid #ddd'}}>
              <td style={{padding:'1mm 2mm'}}>{dt(ch.charge_datetime)}</td>
              <td style={{padding:'1mm 2mm', fontWeight:500}}>{ch.description}</td>
              <td style={{padding:'1mm 2mm'}}>{ch.category||'-'}</td>
              <td style={{padding:'1mm 2mm', textAlign:'center'}}>{num(ch.quantity)}</td>
              <td style={{padding:'1mm 2mm', textAlign:'right'}}>{num(ch.unit_price)}</td>
              <td style={{padding:'1mm 2mm', textAlign:'right', fontWeight:600}}>{num(ch.total_amount)}</td>
            </tr>
          ))}</tbody>
        </table>}

        {mode==='final' && <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1.5px solid #000'}}>
            <th style={{padding:'1mm 2mm', textAlign:'left', fontWeight:600, fontSize:'9pt'}}>Description</th>
            <th style={{padding:'1mm 2mm', textAlign:'left', fontWeight:600, fontSize:'9pt'}}>Category</th>
            <th style={{padding:'1mm 2mm', textAlign:'center', fontWeight:600, fontSize:'9pt'}}>Qty</th>
            <th style={{padding:'1mm 2mm', textAlign:'right', fontWeight:600, fontSize:'9pt'}}>Rate</th>
            <th style={{padding:'1mm 2mm', textAlign:'right', fontWeight:600, fontSize:'9pt'}}>Amount</th>
          </tr></thead>
          <tbody>{summarised.map((s:any) => (
            <tr key={s.key} style={{borderBottom:'1px solid #ddd'}}>
              <td style={{padding:'1mm 2mm', fontWeight:500}}>{s.description}</td>
              <td style={{padding:'1mm 2mm'}}>{s.category}</td>
              <td style={{padding:'1mm 2mm', textAlign:'center'}}>{num(s.quantity)}</td>
              <td style={{padding:'1mm 2mm', textAlign:'right'}}>{num(s.rate)}</td>
              <td style={{padding:'1mm 2mm', textAlign:'right', fontWeight:600}}>{num(s.amount)}</td>
            </tr>
          ))}</tbody>
        </table>}

        <table style={{width:'100%', borderCollapse:'collapse', marginTop:'1mm'}}>
          <tbody><tr style={{fontWeight:700, borderTop:'1.5px solid #000'}}>
            <td colSpan={mode==='detailed'?5:4} style={{padding:'1mm 2mm', textAlign:'right'}}>Total Charges</td>
            <td style={{padding:'1mm 2mm', textAlign:'right'}}>{billing?.total_charges?.toFixed(0)}</td>
          </tr></tbody>
        </table>
      </div>}

      {mode==='final' && payments.length>0 && <div style={{fontSize:'9pt', marginTop:'3mm'}}>
        <h3 style={{fontSize:'10pt', fontWeight:600, margin:'2mm 0'}}>Payments</h3>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid #000'}}>
            <th style={{padding:'1mm 2mm', textAlign:'left', fontWeight:600, fontSize:'9pt'}}>Receipt</th>
            <th style={{padding:'1mm 2mm', textAlign:'left', fontWeight:600, fontSize:'9pt'}}>Date</th>
            <th style={{padding:'1mm 2mm', textAlign:'left', fontWeight:600, fontSize:'9pt'}}>Mode</th>
            <th style={{padding:'1mm 2mm', textAlign:'right', fontWeight:600, fontSize:'9pt'}}>Amount</th>
          </tr></thead>
          <tbody>{payments.map((pm:any) => (
            <tr key={pm.id} style={{borderBottom:'1px solid #ddd'}}>
              <td style={{padding:'1mm 2mm'}}>{pm.receipt_number}</td>
              <td style={{padding:'1mm 2mm'}}>{d(pm.payment_datetime)}</td>
              <td style={{padding:'1mm 2mm'}}>{pm.payment_mode}</td>
              <td style={{padding:'1mm 2mm', textAlign:'right'}}>{pm.amount}</td>
            </tr>
          ))}
          <tr style={{fontWeight:700}}>
            <td colSpan={3} style={{padding:'1mm 2mm', textAlign:'right'}}>Total Paid</td>
            <td style={{padding:'1mm 2mm', textAlign:'right'}}>{billing?.total_payments?.toFixed(0)}</td>
          </tr></tbody>
        </table>
      </div>}

      <hr style={{border:'none', borderTop:'1.5px solid #000', margin:'3mm 0'}} />
      {billing && <div style={{fontSize:'10pt', lineHeight:1.6}}>
        <div style={{display:'flex', justifyContent:'space-between'}}><span>Total Charges</span><span>INR {billing.total_charges?.toFixed(0)}</span></div>
        {mode==='final' && <div style={{display:'flex', justifyContent:'space-between'}}><span>Total Payments</span><span>INR {billing.total_payments?.toFixed(0)}</span></div>}
        {mode==='final' && billing.total_refunds>0 && <div style={{display:'flex', justifyContent:'space-between'}}><span>Refunds</span><span>INR {billing.total_refunds?.toFixed(0)}</span></div>}
        <hr style={{border:'none', borderTop:'1px solid #000'}} />
        {mode==='final' && <div style={{display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:'12pt'}}>
          <span>Outstanding Balance</span>
          <span style={{color:billing.outstanding_balance>0?'#d00':'#16a34a'}}>INR {billing.outstanding_balance?.toFixed(0)}</span>
        </div>}
      </div>}

      <div style={{textAlign:'right', marginTop:'8mm', fontSize:'10pt'}}>
        <div style={{marginBottom:'5mm'}}>Authorized signature</div>
        <div style={{borderTop:'1px solid #000', width:'45mm', display:'inline-block', paddingTop:'1mm'}}></div>
      </div>

      <div style={{textAlign:'center', fontSize:'8pt', color:'#888', borderTop:'1px solid #ddd', paddingTop:'2mm', marginTop:'3mm'}}>
        Computer-generated {title.toLowerCase()} &bull; Ayush Hospital, KPHB, Hyderabad
      </div>
    </div>
  </div>);
};

export default BillPrintTemplate;
