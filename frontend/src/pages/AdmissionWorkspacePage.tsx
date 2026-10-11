import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ipdApi, doctorsApi } from '../services/api';
import type { IPDAdmissionResponse, IPDAttendantResponse, Doctor } from '../types';

type TabId = 'overview'|'tests'|'medications'|'insurance'|'billing'|'discharge'|'activity';

const AdmissionWorkspacePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admission, setAdmission] = useState<IPDAdmissionResponse | null>(null);
  const [attendant, setAttendant] = useState<IPDAttendantResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TabId>('overview');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [tabError, setTabError] = useState('');
  const [tabSuccess, setTabSuccess] = useState('');

  useEffect(() => {
    if (!id) return;
    const aid = parseInt(id, 10);
    Promise.all([
      ipdApi.get(aid),
      ipdApi.getAttendant(aid).catch(() => null),
      doctorsApi.list().catch(() => [] as Doctor[]),
    ]).then(([adm, att, docs]) => {
      setAdmission(adm); setAttendant(att); setDoctors(docs);
    }).catch(() => setError('Failed to load admission'))
    .finally(() => setLoading(false));
  }, [id]);

  const fmt = (s?: string) => {
    if (!s) return '-';
    const d = new Date(s);
    return `${('0'+d.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${d.getFullYear()}`;
  };

  const aid = id ? parseInt(id, 10) : 0;

  if (loading) return <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-600 text-sm">{error}</div>;
  if (!admission) return <div className="text-center py-10 text-gray-400 text-sm">Admission not found</div>;

  const tabs: { id: TabId; label: string }[] = [
    { id:'overview', label:'Overview' },
    { id:'tests', label:'Tests & Reports' },
    { id:'medications', label:'Medications' },
    { id:'insurance', label:'Insurance' },
    { id:'billing', label:'Payments & Billing' },
    { id:'discharge', label:'Discharge Summary' },
    { id:'activity', label:'Activity' }];

  return (<div className="max-w-5xl mx-auto">
    <div className="flex items-center justify-between mb-3">
      <div><p className="text-xs text-gray-500">IPD / Admissions / {admission.admission_number}</p>
        <h2 className="text-base font-semibold text-gray-900 m-0 mt-1">{admission.admission_number}</h2></div>
      <button onClick={() => navigate('/ipd')} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Back</button>
    </div>

    <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 shadow-sm mb-3 flex items-center justify-between">
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-900 m-0">{admission.patient_name} <span className="text-xs text-gray-500 ml-2">{admission.patient_uhid}</span></h4>
        <p className="text-[11px] text-gray-500 mt-0.5">{admission.patient_gender}, Age {admission.patient_age} | {admission.patient_phone} | Dr. {admission.doctor_name} | {fmt(admission.admission_datetime)}</p>
      </div>
      <div>{admission.status==='Open'
        ? <span className="text-green-700 bg-green-50 px-3 py-0.5 rounded-full text-xs font-medium">Open</span>
        : <span className="text-gray-500 bg-gray-100 px-3 py-0.5 rounded-full text-xs font-medium">Discharged</span>}</div>
    </div>

    <div className="flex gap-1.5 mb-4 overflow-x-auto">
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)}
          className={`px-3 py-1.5 text-[11px] font-medium rounded-lg whitespace-nowrap ${tab===t.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.label}</button>
      ))}
    </div>

    {tabError && <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{tabError}</div>}
    {tabSuccess && <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">{tabSuccess}</div>}

    {tab === 'overview' && <OverviewTab admission={admission} attendant={attendant} aid={aid} />}
    {tab === 'tests' && <TestsTab aid={aid} doctors={doctors} onError={(s:string)=>setTabError(s)} onSuccess={(s:string)=>setTabSuccess(s)} />}
    {tab === 'medications' && <MedicationsTab aid={aid} doctors={doctors} />}
    {tab === 'insurance' && <InsuranceTab aid={aid} />}
    {tab === 'billing' && <BillingTab aid={aid} />}
    {tab === 'discharge' && <DischargeTab aid={aid} doctors={doctors} admission={admission} />}
    {tab === 'activity' && <ActivityTab aid={aid} />}
  </div>);
};

// ===== TAB COMPONENTS =====

const OverviewTab: React.FC<{admission:IPDAdmissionResponse; attendant:IPDAttendantResponse|null; aid:number}> = ({admission, attendant, aid}) => {
  const [billing, setBilling] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  useEffect(() => {
    Promise.all([
      fetch(BASE + `/ipd/admissions/${aid}/billing-summary`).then(r => r.json()).catch(() => null),
      fetch(BASE + `/ipd/admissions/${aid}/activity`).then(r => r.json()).catch(() => []),
    ]).then(([b, a]) => { setBilling(b); setActivity(Array.isArray(a) ? a : []); });
  }, [aid]);
  const fmt = (s?:string) => { if(!s) return '-'; const d=new Date(s); return `${('0'+d.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${d.getFullYear()}`; };
  const BASE = window.location.origin + '/api/v1';
  return (<>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Admission Details</h4>
        <div className="text-xs text-gray-600 space-y-1.5">
          <div><span className="font-medium inline-block w-28">Admission:</span>{admission.admission_number}</div>
          <div><span className="font-medium inline-block w-28">Date:</span>{fmt(admission.admission_datetime)}</div>
          <div><span className="font-medium inline-block w-28">Type:</span>{admission.admission_type}</div>
          <div><span className="font-medium inline-block w-28">Doctor:</span>{admission.doctor_name}</div>
          <div><span className="font-medium inline-block w-28">Dept:</span>{admission.department || '-'}</div>
          <div><span className="font-medium inline-block w-28">Ward/Bed:</span>{admission.ward_bed || '-'}</div>
          <div><span className="font-medium inline-block w-28">Status:</span>{admission.status}</div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Attendant</h4>
        {attendant ? (<div className="text-xs text-gray-600 space-y-1.5">
          <div><span className="font-medium inline-block w-28">Name:</span>{attendant.name}</div>
          <div><span className="font-medium inline-block w-28">Relation:</span>{attendant.relation}</div>
          <div><span className="font-medium inline-block w-28">Phone:</span>{attendant.phone_number}</div>
          {attendant.alternate_phone_number && <div><span className="font-medium inline-block w-28">Alt:</span>{attendant.alternate_phone_number}</div>}
        </div>) : <p className="text-xs text-gray-400">No attendant</p>}
      </div>
    </div>
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-4">
      <h4 className="text-xs font-semibold text-gray-700 mb-1">Reason</h4>
      <p className="text-xs text-gray-600 whitespace-pre-wrap">{admission.reason_for_admission}</p>
    </div>
    {billing && <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-4">
      <h4 className="text-xs font-semibold text-gray-700 mb-2">Financial Summary</h4>
      <div className="grid grid-cols-4 gap-3 text-xs text-gray-600">
        <div><span className="font-medium">Charges:</span> INR {billing.total_charges?.toFixed(0)}</div>
        <div className="text-emerald-600"><span className="font-medium">Payments:</span> INR {billing.total_payments?.toFixed(0)}</div>
        <div className="text-amber-600"><span className="font-medium">Refunds:</span> INR {billing.total_refunds?.toFixed(0)}</div>
        <div className="font-semibold"><span className="font-medium">Balance:</span> INR {billing.outstanding_balance?.toFixed(0)}</div>
      </div>
    </div>}
    {activity.length > 0 && <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <h4 className="text-xs font-semibold text-gray-700 mb-2">Recent Activity</h4>
      <div className="text-xs text-gray-500 space-y-1 max-h-32 overflow-y-auto">
        {activity.slice(0,8).map((a:any) => <div key={a.id}>{fmt(a.created_at)} &mdash; {a.action} {a.section ? '('+a.section+')' : ''}</div>)}
      </div>
    </div>}
  </>);
};

const TestsTab: React.FC<{aid:number; doctors:Doctor[]; onError:(s:string)=>void; onSuccess:(s:string)=>void}> = ({aid, doctors, onError, onSuccess}) => {
  const [tests, setTests] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [fName, setFName] = useState(''); const [fCat, setFCat] = useState(''); const [fNotes, setFNotes] = useState('');
  const [fResText, setFResText] = useState(''); const [fResId, setFResId] = useState<number|null>(null);
  const BASE = window.location.origin + '/api/v1';
  useEffect(() => { fetch(BASE+`/ipd/admissions/${aid}/tests`).then(r=>r.json()).then(d=>setTests(Array.isArray(d)?d:[])).catch(()=>{}).finally(()=>setLoading(false)); }, [aid]);
  const addTest = async () => {
    if(!fName.trim()) return;
    const r = await fetch(BASE+`/ipd/admissions/${aid}/tests`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({test_name:fName.trim(), category:fCat, notes:fNotes})});
    if(r.ok) { setShowForm(false); setFName(''); setFCat(''); setFNotes(''); onSuccess('Test added'); const d=await fetch(BASE+`/ipd/admissions/${aid}/tests`).then(r=>r.json()); setTests(Array.isArray(d)?d:[]); }
    else { const e=await r.json(); onError(e.detail||'Error'); }
  };
  const recordResult = async (tid:number) => {
    if(!fResText.trim()) return;
    const r = await fetch(BASE+`/ipd/tests/${tid}/result`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({result_text:fResText.trim()})});
    if(r.ok) { setFResId(null); setFResText(''); onSuccess('Result recorded'); const d=await fetch(BASE+`/ipd/admissions/${aid}/tests`).then(r=>r.json()); setTests(Array.isArray(d)?d:[]); }
    else { const e=await r.json(); onError(e.detail||'Error'); }
  };
  const fmt=(s?:string)=>{if(!s)return'-';const d=new Date(s);return `${('0'+d.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${d.getFullYear()}`;};
  return (<div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-xs font-semibold text-gray-700 m-0">Tests & Reports</h4>
      <button onClick={()=>setShowForm(!showForm)} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">{showForm?'Cancel':'+ Add Test'}</button>
    </div>
    {showForm && <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
      <input value={fName} onChange={e=>setFName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Test name *" />
      <div className="flex gap-3"><input value={fCat} onChange={e=>setFCat(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Category" />
      <input value={fNotes} onChange={e=>setFNotes(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Notes" /></div>
      <button onClick={addTest} className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Test</button>
    </div>}
    {loading ? <p className="text-xs text-gray-400">Loading...</p> : tests.length === 0 ? <p className="text-xs text-gray-400">No tests recorded</p> :
    <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-gray-200 bg-gray-50">
      <th className="py-1.5 px-2 text-left font-medium text-gray-600">Test</th><th className="py-1.5 px-2 text-left font-medium text-gray-600">Category</th><th className="py-1.5 px-2 text-left font-medium text-gray-600">Date</th><th className="py-1.5 px-2 text-center font-medium text-gray-600">Status</th><th className="py-1.5 px-2 text-center font-medium text-gray-600">Result</th><th className="py-1.5 px-2"></th>
    </tr></thead><tbody>{tests.map((t:any) => <tr key={t.id} className="border-b border-gray-100">
      <td className="py-1.5 px-2">{t.test_name}</td><td className="py-1.5 px-2 text-gray-500">{t.category||'-'}</td>
      <td className="py-1.5 px-2 text-gray-500 whitespace-nowrap">{fmt(t.ordered_datetime)}</td>
      <td className="py-1.5 px-2 text-center">{t.status==='Completed'?<span className="text-green-600">Completed</span>:<span className="text-amber-600">{t.status}</span>}</td>
      <td className="py-1.5 px-2 text-center">{t.result_text ? <span className="text-xs">{t.result_text.substring(0,40)}</span> : <span className="text-gray-400">-</span>}</td>
      <td className="py-1.5 px-2 text-center">{!t.result_text ? <button onClick={()=>{setFResId(t.id);setFResText('');}} className="px-2 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100">Add Result</button> : <span className="text-green-500">Done</span>}</td>
    </tr>)}</tbody></table></div>}
    {fResId !== null && <div className="bg-gray-50 rounded-lg p-3 mt-2 space-y-2"><textarea value={fResText} onChange={e=>setFResText(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Enter result text" /><button onClick={()=>recordResult(fResId)} className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Result</button></div>}
  </div>);
};

const MedicationsTab: React.FC<{aid:number; doctors:Doctor[]}> = ({aid, doctors}) => {
  const [meds, setMeds] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState<any>({});
  const BASE = window.location.origin + '/api/v1';
  useEffect(() => { fetch(BASE+`/ipd/admissions/${aid}/medications`).then(r=>r.json()).then(d=>setMeds(Array.isArray(d)?d:[])).catch(()=>{}).finally(()=>setLoading(false)); }, [aid]);
  const save = async () => {
    if(!f.medicine_name||!f.dose||!f.route||!f.frequency||!f.start_date) return;
    const r = await fetch(BASE+`/ipd/admissions/${aid}/medications`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(f)});
    if(r.ok) { setShowForm(false); setF({}); const d=await fetch(BASE+`/ipd/admissions/${aid}/medications`).then(r=>r.json()); setMeds(Array.isArray(d)?d:[]); }
  };
  const fmt=(s?:string)=>{if(!s)return'-';const d=new Date(s);return `${('0'+d.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${d.getFullYear()}`;};
  return (<div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-xs font-semibold text-gray-700 m-0">Medications</h4>
      <button onClick={()=>setShowForm(!showForm)} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">{showForm?'Cancel':'+ Add Medication'}</button>
    </div>
    {showForm && <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
      <div className="flex gap-3"><input value={f.medicine_name||''} onChange={e=>setF({...f,medicine_name:e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Medicine *" />
      <input value={f.strength||''} onChange={e=>setF({...f,strength:e.target.value})} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Strength" /></div>
      <div className="flex gap-3"><input value={f.dose||''} onChange={e=>setF({...f,dose:e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Dose *" />
      <input value={f.route||''} onChange={e=>setF({...f,route:e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Route * (Oral/IV/IM)" /></div>
      <div className="flex gap-3"><input value={f.frequency||''} onChange={e=>setF({...f,frequency:e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Frequency *" />
      <input value={f.start_date||''} onChange={e=>setF({...f,start_date:e.target.value})} type="date" className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Start" /></div>
      <button onClick={save} className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Medication</button>
    </div>}
    {loading ? <p className="text-xs text-gray-400">Loading...</p> : meds.length === 0 ? <p className="text-xs text-gray-400">No medications recorded</p> :
    <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-gray-200 bg-gray-50">
      <th className="py-1.5 px-2 text-left font-medium text-gray-600">Medicine</th><th className="py-1.5 px-2 text-left font-medium text-gray-600">Dose</th><th className="py-1.5 px-2 text-left font-medium text-gray-600">Route</th><th className="py-1.5 px-2 text-left font-medium text-gray-600">Freq</th><th className="py-1.5 px-2 text-left font-medium text-gray-600">Start</th><th className="py-1.5 px-2 text-left font-medium text-gray-600">End</th><th className="py-1.5 px-2 text-center font-medium text-gray-600">Status</th>
    </tr></thead><tbody>{meds.map((m:any) => <tr key={m.id} className="border-b border-gray-100">
      <td className="py-1.5 px-2">{m.medicine_name}</td><td className="py-1.5 px-2">{m.dose}</td><td className="py-1.5 px-2 text-gray-500">{m.route}</td><td className="py-1.5 px-2">{m.frequency}</td>
      <td className="py-1.5 px-2 whitespace-nowrap">{fmt(m.start_date)}</td><td className="py-1.5 px-2 whitespace-nowrap">{fmt(m.end_date)}</td>
      <td className="py-1.5 px-2 text-center"><span className={m.status==='Active'?'text-green-600':'text-gray-500'}>{m.status}</span></td>
    </tr>)}</tbody></table></div>}
  </div>);
};

const InsuranceTab: React.FC<{aid:number}> = ({aid}) => {
  const [policies, setPolicies] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); const [f, setF] = useState<any>({provider:'',policy_number:'',policyholder_name:'',claim_status:'Not Submitted'});
  const BASE = window.location.origin + '/api/v1';
  useEffect(() => { fetch(BASE+`/ipd/admissions/${aid}/insurance`).then(r=>r.json()).then(d=>setPolicies(Array.isArray(d)?d:[])).catch(()=>{}).finally(()=>setLoading(false)); }, [aid]);
  const save = async () => {
    if(!f.provider) return;
    const r = await fetch(BASE+`/ipd/admissions/${aid}/insurance`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(f)});
    if(r.ok) { setShowForm(false); setF({provider:'',policy_number:'',policyholder_name:'',claim_status:'Not Submitted'}); const d=await fetch(BASE+`/ipd/admissions/${aid}/insurance`).then(r=>r.json()); setPolicies(Array.isArray(d)?d:[]); }
  };
  return (<div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-xs font-semibold text-gray-700 m-0">Insurance</h4>
      <button onClick={()=>setShowForm(!showForm)} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">{showForm?'Cancel':'+ Add Insurance'}</button>
    </div>
    {showForm && <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
      <input value={f.provider} onChange={e=>setF({...f,provider:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Insurance provider *" />
      <div className="flex gap-3"><input value={f.policy_number||''} onChange={e=>setF({...f,policy_number:e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Policy number" />
      <input value={f.policyholder_name||''} onChange={e=>setF({...f,policyholder_name:e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Policyholder" /></div>
      <button onClick={save} className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Insurance</button>
    </div>}
    {loading ? <p className="text-xs text-gray-400">Loading...</p> : policies.length === 0 ? <p className="text-xs text-gray-400">No insurance records</p> :
    <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-gray-200 bg-gray-50">
      <th className="py-1.5 px-2 text-left font-medium text-gray-600">Provider</th><th className="py-1.5 px-2 text-left font-medium text-gray-600">Policy#</th><th className="py-1.5 px-2 text-left font-medium text-gray-600">Holder</th><th className="py-1.5 px-2 text-center font-medium text-gray-600">Claim Status</th><th className="py-1.5 px-2 text-right font-medium text-gray-600">Approved</th>
    </tr></thead><tbody>{policies.map((p:any) => <tr key={p.id} className="border-b border-gray-100">
      <td className="py-1.5 px-2">{p.provider}</td><td className="py-1.5 px-2 font-mono">{p.policy_number||'-'}</td><td className="py-1.5 px-2">{p.policyholder_name||'-'}</td>
      <td className="py-1.5 px-2 text-center"><span className="text-[10px]">{p.claim_status}</span></td><td className="py-1.5 px-2 text-right">{p.approved_amount?`INR ${p.approved_amount}`: '-'}</td>
    </tr>)}</tbody></table></div>}
  </div>);
};

const BillingTab: React.FC<{aid:number}> = ({aid}) => {
  const [charges, setCharges] = useState<any[]>([]); const [payments, setPayments] = useState<any[]>([]);
  const [billing, setBilling] = useState<any>(null); const [loading, setLoading] = useState(true);
  const [showCharge, setShowCharge] = useState(false); const [showPayment, setShowPayment] = useState(false);
  const [c, setC] = useState<any>({}); const [p, setP] = useState<any>({});
  const BASE = window.location.origin + '/api/v1';
  const load = async () => {
    Promise.all([
      fetch(BASE+`/ipd/admissions/${aid}/charges`).then(r=>r.json()),
      fetch(BASE+`/ipd/admissions/${aid}/payments`).then(r=>r.json()),
      fetch(BASE+`/ipd/admissions/${aid}/billing-summary`).then(r=>r.json()),
    ]).then(([ch, pa, bi]) => {
      setCharges(Array.isArray(ch)?ch:[]); setPayments(Array.isArray(pa)?pa:[]); setBilling(bi);
    }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { load(); }, [aid]);
  const addCharge = async () => {
    if(!c.description||!c.unit_price) return;
    await fetch(BASE+`/ipd/admissions/${aid}/charges`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({description:c.description, unit_price:parseFloat(c.unit_price), quantity:c.quantity?parseInt(c.quantity):1, category:c.category})});
    setShowCharge(false); setC({}); load();
  };
  const addPayment = async () => {
    if(!p.amount||!p.payment_mode) return;
    await fetch(BASE+`/ipd/admissions/${aid}/payments`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({amount:parseFloat(p.amount), payment_mode:p.payment_mode, transaction_reference:p.transaction_reference})});
    setShowPayment(false); setP({}); load();
  };
  const fmt=(s?:string)=>{if(!s)return'-';const d=new Date(s);return `${('0'+d.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${d.getFullYear()}`;};
  return (<div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
    {billing && <div className="grid grid-cols-4 gap-3 mb-3 p-3 bg-gray-50 rounded-lg text-xs">
      <div className="font-medium">Charges: INR {billing.total_charges?.toFixed(0)}</div>
      <div className="text-emerald-600 font-medium">Paid: INR {billing.total_payments?.toFixed(0)}</div>
      <div className="text-amber-600">Refunds: INR {billing.total_refunds?.toFixed(0)}</div>
      <div className="font-bold">Balance: INR {billing.outstanding_balance?.toFixed(0)}</div>
    </div>}
    <div className="flex gap-2 mb-3">
      <button onClick={()=>{setShowCharge(!showCharge);setShowPayment(false)}} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">{showCharge?'Cancel':'+ Add Charge'}</button>
      <button onClick={()=>{setShowPayment(!showPayment);setShowCharge(false)}} className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">{showPayment?'Cancel':'+ Record Payment'}</button>
    </div>
    {showCharge && <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
      <input value={c.description||''} onChange={e=>setC({...c,description:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Description *" />
      <div className="flex gap-3"><input value={c.unit_price||''} onChange={e=>setC({...c,unit_price:e.target.value})} type="number" step="0.01" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Unit price *" />
      <input value={c.quantity||1} onChange={e=>setC({...c,quantity:e.target.value})} type="number" className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Qty" />
      <input value={c.category||''} onChange={e=>setC({...c,category:e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Category" /></div>
      <button onClick={addCharge} className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Add Charge</button>
    </div>}
    {showPayment && <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
      <div className="flex gap-3"><input value={p.amount||''} onChange={e=>setP({...p,amount:e.target.value})} type="number" step="0.01" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Amount *" />
      <select value={p.payment_mode||'Cash'} onChange={e=>setP({...p,payment_mode:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white"><option value="Cash">Cash</option><option value="UPI">UPI</option><option value="Card">Card</option><option value="Bank Transfer">Bank Transfer</option></select></div>
      <input value={p.transaction_reference||''} onChange={e=>setP({...p,transaction_reference:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Transaction reference" />
      <button onClick={addPayment} className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Record Payment</button>
    </div>}
    {loading ? <p className="text-xs text-gray-400">Loading...</p> : <>
      {charges.length > 0 && <h5 className="text-xs font-semibold text-gray-600 mb-1">Charges</h5>}
      {charges.length > 0 && <div className="overflow-x-auto mb-3"><table className="w-full text-xs"><thead><tr className="border-b border-gray-200 bg-gray-50">
        <th className="py-1 px-2 text-left font-medium text-gray-500">Date</th><th className="py-1 px-2 text-left font-medium text-gray-500">Description</th><th className="py-1 px-2 text-left font-medium text-gray-500">Category</th><th className="py-1 px-2 text-right font-medium text-gray-500">Qty</th><th className="py-1 px-2 text-right font-medium text-gray-500">Rate</th><th className="py-1 px-2 text-right font-medium text-gray-500">Total</th>
      </tr></thead><tbody>{charges.map((ch:any) => <tr key={ch.id} className="border-b border-gray-100">
        <td className="py-1 px-2 whitespace-nowrap">{fmt(ch.charge_datetime)}</td><td className="py-1 px-2">{ch.description}</td><td className="py-1 px-2 text-gray-500">{ch.category||'-'}</td>
        <td className="py-1 px-2 text-right">{ch.quantity}</td><td className="py-1 px-2 text-right">{ch.unit_price}</td><td className="py-1 px-2 text-right font-medium">{ch.total_amount}</td>
      </tr>)}</tbody></table></div>}
      {payments.length > 0 && <h5 className="text-xs font-semibold text-gray-600 mb-1">Payments</h5>}
      {payments.length > 0 && <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-gray-200 bg-gray-50">
        <th className="py-1 px-2 text-left font-medium text-gray-500">Receipt</th><th className="py-1 px-2 text-left font-medium text-gray-500">Date</th><th className="py-1 px-2 text-right font-medium text-gray-500">Amount</th><th className="py-1 px-2 text-left font-medium text-gray-500">Mode</th><th className="py-1 px-2 text-left font-medium text-gray-500">Ref</th><th className="py-1 px-2 text-center font-medium text-gray-500">Status</th>
      </tr></thead><tbody>{payments.map((pm:any) => <tr key={pm.id} className="border-b border-gray-100">
        <td className="py-1 px-2 font-mono">{pm.receipt_number}</td><td className="py-1 px-2 whitespace-nowrap">{fmt(pm.payment_datetime)}</td>
        <td className="py-1 px-2 text-right font-medium">{pm.amount}</td><td className="py-1 px-2">{pm.payment_mode}</td>
        <td className="py-1 px-2 text-gray-500">{pm.transaction_reference||'-'}</td>
        <td className="py-1 px-2 text-center">{pm.status==='Successful'?<span className="text-green-600">Paid</span>:<span className="text-gray-500">{pm.status}</span>}</td>
      </tr>)}</tbody></table></div>}
    </>}
  </div>);
};

const DischargeTab: React.FC<{aid:number; doctors:Doctor[]; admission:IPDAdmissionResponse}> = ({aid, doctors, admission}) => {
  const [ds, setDs] = useState<any>(null); const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); const [finError, setFinError] = useState('');
  const [f, setF] = useState<any>({});
  const BASE = window.location.origin + '/api/v1';
  useEffect(() => {
    fetch(BASE+`/ipd/admissions/${aid}/discharge-summary`).then(r=>r.ok?r.json():null).then(d => {
      if(d) { setDs(d); setF(d); } else setF({status:'Draft'});
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, [aid]);
  const save = async () => {
    setSaving(true);
    const r = await fetch(BASE+`/ipd/admissions/${aid}/discharge-summary`, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(f)});
    if(r.ok) { const d=await r.json(); setDs(d); setF(d); }
    setSaving(false);
  };
  const finalize = async () => {
    if(!f.condition_at_discharge||!f.discharging_doctor_id) { setFinError('Condition at discharge and discharging doctor required'); return; }
    await save();
    const r = await fetch(BASE+`/ipd/admissions/${aid}/discharge-summary/finalize`, {method:'POST'});
    if(r.ok) { const d=await r.json(); setDs(d); setF(d); window.location.reload(); }
    else { const e=await r.json(); setFinError(e.detail||'Error'); }
  };
  const fmt=(s?:string)=>{if(!s)return'-';const d=new Date(s);return `${('0'+d.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${d.getFullYear()}`;};
  return (<div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-xs font-semibold text-gray-700 m-0">Discharge Summary {ds?.status==='Finalized'?<span className="text-emerald-600 ml-2">(Finalized)</span>:<span className="text-amber-600 ml-2">(Draft)</span>}</h4>
      <div className="flex gap-2">
        <button onClick={save} disabled={saving||ds?.status==='Finalized'} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving?'Saving...':'Save Draft'}</button>
        {ds?.status!=='Finalized' && <button onClick={finalize} className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">Finalize Discharge</button>}
      </div>
    </div>
    {finError && <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 mb-2">{finError}</div>}
    {loading ? <p className="text-xs text-gray-400">Loading...</p> : <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Discharge Date</label>
          <input type="date" value={f.discharge_datetime?f.discharge_datetime.substring(0,10):''} onChange={e=>setF({...f,discharge_datetime:e.target.value+'T00:00:00'})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-0.5">Discharging Doctor</label>
          <select value={f.discharging_doctor_id||''} onChange={e=>setF({...f,discharging_doctor_id:parseInt(e.target.value,10)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white">
            <option value="">Select doctor</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select></div>
      </div>
      <textarea value={f.final_diagnosis||''} onChange={e=>setF({...f,final_diagnosis:e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Final diagnosis" />
      <textarea value={f.clinical_history||''} onChange={e=>setF({...f,clinical_history:e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Clinical history" />
      <textarea value={f.examination_findings||''} onChange={e=>setF({...f,examination_findings:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Examination findings" />
      <textarea value={f.investigations||''} onChange={e=>setF({...f,investigations:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Investigations and results" />
      <textarea value={f.treatment_given||''} onChange={e=>setF({...f,treatment_given:e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Treatment given" />
      <textarea value={f.condition_at_discharge||''} onChange={e=>setF({...f,condition_at_discharge:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Condition at discharge *" />
      <textarea value={f.discharge_medications||''} onChange={e=>setF({...f,discharge_medications:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Discharge medications" />
      <textarea value={f.follow_up_instructions||''} onChange={e=>setF({...f,follow_up_instructions:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Follow-up instructions" />
      <textarea value={f.additional_notes||''} onChange={e=>setF({...f,additional_notes:e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Additional notes" />
    </div>}
  </div>);
};

const ActivityTab: React.FC<{aid:number}> = ({aid}) => {
  const [logs, setLogs] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  const BASE = window.location.origin + '/api/v1';
  useEffect(() => { fetch(BASE+`/ipd/admissions/${aid}/activity`).then(r=>r.json()).then(d=>setLogs(Array.isArray(d)?d:[])).catch(()=>{}).finally(()=>setLoading(false)); }, [aid]);
  const fmt=(s:string)=>{const d=new Date(s);return `${('0'+d.getDate()).slice(-2)}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${d.getFullYear()} ${('0'+d.getHours()).slice(-2)}:${('0'+d.getMinutes()).slice(-2)}`;};
  return (<div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
    <h4 className="text-xs font-semibold text-gray-700 mb-3">Activity History</h4>
    {loading ? <p className="text-xs text-gray-400">Loading...</p> : logs.length === 0 ? <p className="text-xs text-gray-400">No activity recorded</p> :
    <div className="space-y-2 max-h-96 overflow-y-auto">{logs.map((l:any) => <div key={l.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
      <span className="text-[10px] text-gray-400 whitespace-nowrap">{fmt(l.created_at)}</span>
      <span className="text-xs font-medium text-gray-700">{l.action}</span>
      {l.section && <span className="text-[10px] text-gray-500">({l.section})</span>}
      {l.description && <span className="text-[10px] text-gray-500">{l.description}</span>}
    </div>)}</div>}
  </div>);
};

export default AdmissionWorkspacePage;
