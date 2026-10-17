import React, { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { pharmacyApi, patientsApi, doctorsApi, ipdApi } from '../services/api';
import type {
  PharmacyVendor, PharmacyDrug, PharmacySaleResponse,
  Doctor,
} from '../types';

type TabId = 'vendors' | 'purchases' | 'availability' | 'pos';

const PharmacyPage: React.FC = () => {
  const [tab, setTab] = useState<TabId>('vendors');

  return (
    <div>
      <PageHeader title="Pharmacy" subtitle="Vendors, drug inventory & point-of-sale" />

      {/* Tab switcher */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto">
        {([
          { id: 'vendors' as TabId, label: 'Vendors' },
          { id: 'purchases' as TabId, label: 'Drug Entry (Purchase)' },
          { id: 'availability' as TabId, label: 'Drug Availability' },
          { id: 'pos' as TabId, label: 'POS — Sales Counter' },
        ]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${tab === t.id ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'vendors' && <VendorsTab />}
      {tab === 'purchases' && <PurchasesTab />}
      {tab === 'availability' && <AvailabilityTab />}
      {tab === 'pos' && <PosTab />}
    </div>
  );
};

/* =======================================================
 * 1. VENDORS TAB
 * ===================================================== */

const VendorsTab: React.FC = () => {
  const [vendors, setVendors] = useState<PharmacyVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [f, setF] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    pharmacyApi.vendors.list().then(setVendors).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditId(null); setF({}); setShowForm(true); };
  const openEdit = (v: PharmacyVendor) => { setEditId(v.id); setF(v); setShowForm(true); };

  const save = async () => {
    setError('');
    if (!f.vendor_name || !f.contact_number) { setError('Vendor name and contact are required'); return; }
    setSaving(true);
    try {
      if (editId) await pharmacyApi.vendors.update(editId, f);
      else await pharmacyApi.vendors.create(f as any);
      setShowForm(false); load();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this vendor?')) return;
    try { await pharmacyApi.vendors.remove(id); load(); } catch {}
  };

  return (<>
    <div className="flex justify-end mb-3">
      <button onClick={openCreate} className="hms-btn-primary">+ Add Vendor</button>
    </div>
    {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}
    <div className="hms-card overflow-x-auto">
      {loading ? <div className="py-10 text-center text-xs text-slate-400">Loading vendors…</div> : vendors.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">No vendors yet. Add your first vendor.</div>
      ) : (
        <table className="hms-table">
          <thead><tr>
            <th>Vendor Name</th><th>Contact</th><th>GST</th><th>Drug License</th><th>City</th><th className="text-right">Actions</th>
          </tr></thead>
          <tbody>{vendors.map((v) => (
            <tr key={v.id}>
              <td className="font-medium">{v.vendor_name}</td>
              <td>{v.contact_number}</td>
              <td className="font-mono">{v.gst_number}</td>
              <td className="font-mono">{v.drug_license_number}</td>
              <td>{v.city}</td>
              <td className="text-right whitespace-nowrap">
                <button onClick={() => openEdit(v)} className="px-2.5 py-1 text-[11px] font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 mr-1">Edit</button>
                <button onClick={() => del(v.id)} className="px-2.5 py-1 text-[11px] font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100">Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>

    {/* Add/Edit Vendor Modal */}
    {showForm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">{editId ? 'Edit Vendor' : 'Add Vendor'}</h3>
          </div>
          <div className="px-6 py-5 grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-xs font-medium text-slate-600 mb-0.5 block">Vendor Name *</label>
              <input value={f.vendor_name||''} onChange={e=>setF({...f,vendor_name:e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="text-xs font-medium text-slate-600 mb-0.5 block">Drug License No. *</label>
              <input value={f.drug_license_number||''} onChange={e=>setF({...f,drug_license_number:e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="text-xs font-medium text-slate-600 mb-0.5 block">GST No. *</label>
              <input value={f.gst_number||''} onChange={e=>setF({...f,gst_number:e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="text-xs font-medium text-slate-600 mb-0.5 block">Contact No. *</label>
              <input value={f.contact_number||''} onChange={e=>setF({...f,contact_number:e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="text-xs font-medium text-slate-600 mb-0.5 block">Email</label>
              <input value={f.email||''} onChange={e=>setF({...f,email:e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="text-xs font-medium text-slate-600 mb-0.5 block">PAN Card</label>
              <input value={f.pancard_number||''} onChange={e=>setF({...f,pancard_number:e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="text-xs font-medium text-slate-600 mb-0.5 block">Pincode *</label>
              <input value={f.pincode||''} onChange={e=>setF({...f,pincode:e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="text-xs font-medium text-slate-600 mb-0.5 block">Country *</label>
              <input value={f.country||''} onChange={e=>setF({...f,country:e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div><label className="text-xs font-medium text-slate-600 mb-0.5 block">City *</label>
              <input value={f.city||''} onChange={e=>setF({...f,city:e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none" /></div>
            <div className="col-span-2"><label className="text-xs font-medium text-slate-600 mb-0.5 block">Address *</label>
              <textarea value={f.address||''} onChange={e=>setF({...f,address:e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none rows-2" /></div>
          </div>
          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
            <button onClick={()=>setShowForm(false)} className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving…' : editId ? 'Update' : 'Add Vendor'}
            </button>
          </div>
        </div>
      </div>
    )}
  </>);
};

/* =======================================================
 * 2. DRUG ENTRY TAB
 * ===================================================== */

const PurchasesTab: React.FC = () => {
  const [vendors, setVendors] = useState<PharmacyVendor[]>([]);
  const [vendorId, setVendorId] = useState(0);
  const [invNo, setInvNo] = useState('');
  const [invDate, setInvDate] = useState(new Date().toISOString().substring(0,10));
  const [invAmt, setInvAmt] = useState('');
  const [payType, setPayType] = useState('credit');
  const [discType, setDiscType] = useState('cash');
  const [disc, setDisc] = useState('');
  const [grossAmt, setGrossAmt] = useState('');

  // Auto-calculate gross amount
  const computedGross = discType === 'percentage'
    ? (parseFloat(invAmt||'0') - (parseFloat(invAmt||'0') * (parseFloat(disc||'0')) / 100))
    : discType === 'cash'
    ? Math.max(0, parseFloat(invAmt||'0') - (parseFloat(disc||'0')))
    : parseFloat(invAmt||'0');
  const [items, setItems] = useState<any[]>([{drug_type:'Tablet', drug_name:'', strength:'', batch:'', expiry:'', qty:1, pprice:'', sprice:'',}]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { pharmacyApi.vendors.list().then(setVendors).catch(()=>{}); }, []);

  const addItem = () => setItems([...items,{drug_type:'Tablet', drug_name:'', strength:'', batch:'', expiry:'', qty:1, pprice:'', sprice:'',}]);
  const rmItem = (i: number) => items.length > 1 && setItems(items.filter((_,idx)=>idx!==i));
  const updItem = (i: number, k: string, v: any) => {
    const c = [...items]; c[i][k] = v; setItems(c);
  };

  const submit = async () => {
    setError(''); setMsg('');
    if (!vendorId || !invNo) { setError('Select vendor and enter invoice number'); return; }
    setSaving(true);
    try {
      await pharmacyApi.purchases.create({
        vendor_id: vendorId, invoice_number: invNo, invoice_date: invDate,
        invoice_amount: parseFloat(invAmt)||0, pay_type: payType,
        discount_type: discType, discount: parseFloat(disc)||0,
        gross_amount: computedGross,
        items: items.map(i => ({
          drug_name: i.drug_name, drug_type: i.drug_type, strength: i.strength, batch_number: i.batch,
          expiry_date: i.expiry || undefined,
          quantity: parseInt(i.qty)||0, purchase_price: parseFloat(i.pprice)||0,
          selling_price: parseFloat(i.sprice)||0,
        })),
      });
      setMsg('Purchase entry created. Drugs added to stock.');
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  return (
    <div>
      {msg && <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">{msg}</div>}
      {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT — invoice details + drug lines */}
        <div className="lg:col-span-9 hms-card p-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Invoice Details</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <select value={vendorId} onChange={e=>setVendorId(parseInt(e.target.value))} className="px-2.5 py-2 border border-slate-300 rounded-lg text-xs outline-none bg-white">
              <option value={0}>Select Vendor</option>
              {vendors.map(v=><option key={v.id} value={v.id}>{v.vendor_name}</option>)}
            </select>
            <input value={invNo} onChange={e=>setInvNo(e.target.value)} placeholder="Invoice No *" className="px-2.5 py-2 border border-slate-300 rounded-lg text-xs outline-none" />
            <input type="date" value={invDate} onChange={e=>setInvDate(e.target.value)} className="px-2.5 py-2 border border-slate-300 rounded-lg text-xs outline-none" />
            <input value={invAmt} onChange={e=>setInvAmt(e.target.value)} placeholder="Invoice Amount" type="number" className="px-2.5 py-2 border border-slate-300 rounded-lg text-xs outline-none" />
            <select value={payType} onChange={e=>setPayType(e.target.value)} className="px-2.5 py-2 border border-slate-300 rounded-lg text-xs outline-none bg-white">
              <option value="credit">Credit</option><option value="cash">Cash</option>
            </select>
            <select value={discType} onChange={e=>setDiscType(e.target.value)} className="px-2.5 py-2 border border-slate-300 rounded-lg text-xs outline-none bg-white">
              <option value="cash">Discount (Cash)</option><option value="percentage">Discount (%)</option>
            </select>
            <input value={disc} onChange={e=>setDisc(e.target.value)} placeholder="Discount" type="number" className="px-2.5 py-2 border border-slate-300 rounded-lg text-xs outline-none" />
            <div className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">Gross: ₹{computedGross.toLocaleString()}</div>
          </div>

          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Drug Items</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((it,i)=>(
              <div key={i} className="flex gap-1.5 items-center border border-slate-100 rounded-lg p-1.5">
                <select value={it.drug_type||'Tablet'} onChange={e=>updItem(i,'drug_type',e.target.value)} className="w-24 shrink-0 px-1.5 py-1.5 border border-slate-300 rounded text-xs outline-none bg-white">
                  <option>Tablet</option><option>Capsule</option><option>Syrup</option><option>Powder</option><option>Injection</option><option>Drops</option><option>Cream</option><option>Ointment</option><option>Other</option>
                </select>
                <input value={it.drug_name} onChange={e=>updItem(i,'drug_name',e.target.value)} placeholder="Drug name *" className="w-44 shrink-0 px-2 py-1.5 border border-slate-300 rounded text-xs outline-none" />
                <input value={it.strength} onChange={e=>updItem(i,'strength',e.target.value)} placeholder="Strength" className="w-16 shrink-0 px-2 py-1.5 border border-slate-300 rounded text-xs outline-none" />
                <input value={it.batch} onChange={e=>updItem(i,'batch',e.target.value)} placeholder="Batch" className="w-20 shrink-0 px-2 py-1.5 border border-slate-300 rounded text-xs outline-none" />
                <span className="text-[10px] text-slate-500 shrink-0">Exp:</span>
                <input type="date" value={it.expiry} onChange={e=>updItem(i,'expiry',e.target.value)} className="w-32 shrink-0 px-2 py-1.5 border border-slate-300 rounded text-xs outline-none" />
                <input value={it.qty} onChange={e=>updItem(i,'qty',e.target.value)} placeholder="Qty" type="number" className="w-14 shrink-0 px-1 py-1.5 border border-slate-300 rounded text-xs outline-none" />
                <input value={it.pprice} onChange={e=>updItem(i,'pprice',e.target.value)} placeholder="PP(Buy)" type="number" className="w-20 shrink-0 px-1 py-1.5 border border-slate-300 rounded text-xs outline-none" />
                <input value={it.sprice} onChange={e=>updItem(i,'sprice',e.target.value)} placeholder="SP(Sell)" type="number" className="w-20 shrink-0 px-1 py-1.5 border border-slate-300 rounded text-xs outline-none" />
                <button onClick={()=>rmItem(i)} className="shrink-0 px-2 py-1.5 text-[10px] font-medium text-red-600 bg-red-50 rounded hover:bg-red-100">x</button>
              </div>
            ))}
          </div>
          <button onClick={addItem} className="mt-2 px-3 py-1.5 text-[11px] font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">+ Add Item</button>
        </div>

        {/* RIGHT — summary & save */}
        <div className="lg:col-span-3 hms-card p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Summary</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Invoice Amt</span><span className="font-semibold">₹{parseFloat(invAmt||'0').toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-semibold">{discType==='percentage'?disc+'%':'₹'+(parseFloat(disc||'0').toLocaleString())}</span></div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-2"><span>Gross Amount</span><span>₹{computedGross.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs text-slate-500"><span>Items</span><span>{items.length}</span></div>
            </div>
          </div>
          <button onClick={submit} disabled={saving}
            className="mt-4 w-full py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Purchase Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =======================================================
 * 3. POS — SALES COUNTER TAB
 * ===================================================== */

/* =======================================================
 * 3. DRUG AVAILABILITY TAB
 * ===================================================== */

const AvailabilityTab: React.FC = () => {
  const [drugs, setDrugs] = useState<PharmacyDrug[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (query: string = '') => {
    setLoading(true);
    pharmacyApi.drugs.list(query).then(setDrugs).catch(() => setDrugs([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex justify-end mb-3">
        <input value={q} onChange={e => { setQ(e.target.value); load(e.target.value); }}
          placeholder="Search drug…" className="w-56 px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none" />
      </div>
      <div className="hms-card overflow-x-auto">
        {loading ? (
          <div className="py-10 text-center text-xs text-slate-400">Loading drugs…</div>
        ) : drugs.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">No drugs in stock. Add purchases in the Drug Entry tab.</div>
        ) : (
          <table className="hms-table">
            <thead><tr>
              <th>S.No</th><th>Drug Name</th><th>Type</th><th>Strength</th><th>Batch</th>
              <th>Expiry</th><th className="text-right">Stock</th><th className="text-right">PP (Buy)</th><th className="text-right">SP (Sell)</th>
            </tr></thead>
            <tbody>
              {drugs.map((d, i) => {
                const low = d.quantity_in_stock <= 10;
                const expSoon = d.expiry_date ? (new Date(d.expiry_date).getTime() - Date.now()) < 90 * 24 * 3600 * 1000 : false;
                return (
                  <tr key={d.id}>
                    <td className="text-slate-400">{i+1}</td>
                    <td className="font-medium">{d.name}</td>
                    <td>{d.drug_type ?? '-'}</td>
                    <td>{d.strength || '-'}</td>
                    <td>{d.batch_number || '-'}</td>
                    <td className={expSoon ? 'text-amber-600 font-medium' : ''}>{d.expiry_date || '-'}</td>
                    <td className={`text-right font-semibold ${low ? 'text-red-600' : 'text-emerald-700'}`}>{d.quantity_in_stock}</td>
                    <td className="text-right text-slate-500">₹{d.purchase_price ?? '-'}</td>
                    <td className="text-right">₹{d.selling_price ?? '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* =======================================================
 * 4. POS — SALES COUNTER TAB (revised)
 * ===================================================== */

const PosTab: React.FC = () => {
  // Smart customer search (unified typeahead — auto-detects patient vs walk-in)
  const [smartQ, setSmartQ] = useState('');
  const [smartResults, setSmartResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const [walkinForm, setWalkinForm] = useState(false);
  const [mode, setMode] = useState<'search'|'patient'|'walkin'>('search');
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [selectedPat, setSelectedPat] = useState<any>(null);
  const [linkVisit, setLinkVisit] = useState(false);
  const [refNo, setRefNo] = useState('');
  const [consOptions, setConsOptions] = useState<{label: string; value: string}[]>([]);
  const [ipdOptions, setIpdOptions] = useState<{label: string; value: string}[]>([]);
  const [visitType, setVisitType] = useState<'opd'|'ipd'>('opd');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [docId, setDocId] = useState(0);
  const [docCustom, setDocCustom] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [drugs, setDrugs] = useState<PharmacyDrug[]>([]);
  const [cart, setCart] = useState<{drug:PharmacyDrug; qty:number; sp:number}[]>([]);
  const [discType, setDiscType] = useState<'percentage'|'cash'|''>('');
  const [discVal, setDiscVal] = useState('');
  const [payMode, setPayMode] = useState<'cash'|'upi'|'card'>('cash');
  const [payRef, setPayRef] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastSale, setLastSale] = useState<PharmacySaleResponse|null>(null);
  const [showBill, setShowBill] = useState(false);

  useEffect(() => { doctorsApi.list().then(setDoctors).catch(()=>{}); }, []);

  const applyPatient = (p: any) => {
    setSelectedPat(p);
    setMode('patient');
    setSmartQ(''); setSmartResults([]); setNoMatch(false); setWalkinForm(false);
    setLinkVisit(false); setRefNo(''); setConsOptions([]); setIpdOptions([]);
    // Pre-fetch visit history in the background (for the optional visit linking)
    Promise.all([
      patientsApi.getConsultations(p.id).catch(() => []),
      ipdApi.list({ search: p.phone_number, limit: 100 }).catch(() => ({ admissions: [] })),
    ]).then(([cons, adm]: any) => {
      const consOpts = (Array.isArray(cons) ? cons : [])
        .filter((c:any)=>c.consultation_number)
        .map((c:any)=>({label:c.consultation_number, value:c.consultation_number}));
      const ipdOpts = ((adm?.admissions)||[])
        .filter((a:any)=>a.patient_id===p.id && a.admission_number)
        .map((a:any)=>({label:a.admission_number, value:a.admission_number}));
      setConsOptions(consOpts);
      setIpdOptions(ipdOpts);
    });
  };

  // Unified typeahead: auto-search as you type (300ms debounce), auto-select single match
  useEffect(() => {
    const q = smartQ.trim();
    setSmartResults([]); setNoMatch(false);
    if (q.length < 3) return;
    const isDigits = /^\d+$/.test(q);
    // Wait for a complete phone number before searching (backend needs 10+ digits)
    if (isDigits && q.length < 10) return;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = isDigits
          ? await patientsApi.search(q)
          : await patientsApi.searchByUhid(q).catch(() => ({ patients: [] }));
        const pats = ((res as any).patients || []).map((r:any)=>r.patient);
        setSmartResults(pats);
        setNoMatch(pats.length === 0);
        if (pats.length === 1) applyPatient(pats[0]); // auto-select single match
      } catch { setSmartResults([]); setNoMatch(true); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [smartQ]);

  const activeRefOptions = visitType === 'opd' ? consOptions : ipdOptions;

  const switchVisitType = (vt: 'opd'|'ipd') => {
    setVisitType(vt);
    const opts = vt === 'opd' ? consOptions : ipdOptions;
    setRefNo(opts.length > 0 ? opts[0].value : '');
  };

  const enableVisitLink = () => {
    setLinkVisit(true);
    const opts = visitType === 'opd' ? consOptions : ipdOptions;
    if (opts.length > 0) setRefNo(opts[0].value);
  };

  const resetCustomer = () => {
    setMode('search'); setSelectedPat(null); setSmartQ('');
    setSmartResults([]); setNoMatch(false); setWalkinForm(false);
    setWalkinName(''); setWalkinPhone(''); setLinkVisit(false);
    setRefNo(''); setConsOptions([]); setIpdOptions([]); setDocId(0); setDocCustom('');
  };

  const confirmWalkin = () => {
    setMode('walkin');
    setSmartQ(''); setNoMatch(false); setWalkinForm(false);
  };

  const openWalkinForm = () => {
    setWalkinForm(true);
    if (/^\d+$/.test(smartQ.trim()) && smartQ.trim().length >= 6) setWalkinPhone(smartQ.trim());
  };

  const docName = doctors.find(d => d.id === docId)?.name || docCustom;

  useEffect(() => {
    if (searchQ) pharmacyApi.drugs.list(searchQ).then(setDrugs).catch(()=>{});
    else setDrugs([]);
  }, [searchQ]);

  const rmCart = (i: number) => setCart(cart.filter((_,idx) => idx !== i));

  const total = cart.reduce((s,i) => s + i.qty * i.sp, 0);
  let netTotal = total;
  if (discType === 'percentage' && discVal) netTotal = total * (100 - parseFloat(discVal)) / 100;
  else if (discType === 'cash' && discVal) netTotal = Math.max(0, total - parseFloat(discVal));

  const submit = async () => {
    if (cart.length === 0) { setError('Add at least one item'); return; }
    setSaving(true); setError('');
    try {
      const sale = await pharmacyApi.sales.create({
        customer_type: mode === 'patient' ? 'patient' : 'self',
        patient_id: mode === 'patient' ? selectedPat?.id : undefined,
        patient_name: mode === 'patient' ? selectedPat.name : (walkinName || 'Walk-in'),
        phone_number: mode === 'patient' ? selectedPat.phone_number : (walkinPhone || undefined),
        doctor_name: (mode === 'patient' && !linkVisit) ? undefined : (docName || undefined),
        reference_no: (mode === 'patient' && linkVisit) ? (refNo || undefined) : undefined,
        payment_mode: payMode,
        payment_reference: payRef || undefined,
        discount_type: discType || undefined,
        discount_value: parseFloat(discVal||'0'),
        items: cart.map(c => ({drug_id: c.drug.id, quantity: c.qty, unit_price: c.sp})),
      });
      setLastSale(sale); setShowBill(true);
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  if (showBill && lastSale) {
    return <BillView sale={lastSale} onBack={() => { setShowBill(false); setCart([]); setLastSale(null); }} />;
  }

  return (
    <div>
      {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* LEFT — Customer + Drug search */}
        <div className="lg:col-span-3 space-y-4">

          {/* Customer — smart typeahead OR compact selected card */}
          {mode === 'search' ? (
            <div className="hms-card p-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3"><span className="text-blue-600">①</span> Customer</h4>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <svg viewBox="0 0 24 24" width="15" height="15" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" fill="none" />
                    <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input value={smartQ} onChange={e => setSmartQ(e.target.value)}
                    placeholder="Search patient — phone / UHID (auto-detects)…"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={openWalkinForm}
                  className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 whitespace-nowrap">+ Walk-in</button>
              </div>
              {searching && <p className="text-[10px] text-slate-400 mt-1.5">Searching…</p>}
              {!searching && /^\d+$/.test(smartQ.trim()) && smartQ.trim().length >= 3 && smartQ.trim().length < 10 && (
                <p className="text-[10px] text-slate-400 mt-1.5">Keep typing — phone search uses the full 10-digit number…</p>
              )}

              {/* Multiple matches → selection list */}
              {smartResults.length > 1 && (
                <div className="mt-2 border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-44 overflow-y-auto">
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">{smartResults.length} patients share this number — select one</p>
                  {smartResults.map((p:any) => (
                    <button key={p.id} onClick={() => applyPatient(p)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-blue-50 transition-colors">
                      <span className="text-xs font-medium text-slate-800">{p.name} <span className="text-slate-400">({p.gender}, Age {p.age})</span></span>
                      <span className="text-[10px] text-slate-500 font-mono">{p.uhid}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* No match (or explicit walk-in) → inline walk-in form */}
              {(noMatch || walkinForm) && (
                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{noMatch ? 'No registered patient found — proceed as walk-in' : 'Walk-in sale'}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_150px_auto] gap-2 sm:items-center">
                    <input value={walkinName} onChange={e=>setWalkinName(e.target.value)} placeholder="Customer name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none" />
                    <input value={walkinPhone} onChange={e=>setWalkinPhone(e.target.value)} placeholder="Phone (optional)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none" />
                    <button onClick={confirmWalkin} disabled={!walkinName.trim()}
                      className="px-3 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap">✓ Continue</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Compact selected customer card + optional visit linking */
            <div className="hms-card p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex items-center gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${mode === 'patient' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{mode === 'patient' ? 'Patient' : 'Walk-in'}</span>
                  <span className="text-sm font-semibold text-slate-900 truncate">{mode === 'patient' ? selectedPat.name : walkinName}</span>
                  <span className="text-xs text-slate-400 shrink-0">|</span>
                  <span className="text-xs text-slate-500 shrink-0">{mode === 'patient' ? selectedPat.phone_number : walkinPhone || '—'}</span>
                  {mode === 'patient' && <span className="text-[10px] font-mono text-slate-400 shrink-0 hidden sm:inline">{selectedPat.uhid}</span>}
                </div>
                <button onClick={resetCustomer}
                  className="px-2.5 py-1.5 text-[11px] font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 shrink-0">{mode === 'patient' ? 'Change' : 'Edit'}</button>
              </div>

              {/* Optional visit linking (registered patients only) */}
              {mode === 'patient' && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                    <input type="checkbox" checked={linkVisit}
                      onChange={e => e.target.checked ? enableVisitLink() : setLinkVisit(false)}
                      className="accent-blue-600 w-3.5 h-3.5" />
                    Link to hospital visit {consOptions.length + ipdOptions.length > 0 && <span className="text-slate-400">({consOptions.length} OPD · {ipdOptions.length} IPD)</span>}
                  </label>
                  {linkVisit && (
                    <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select value={visitType} onChange={e => switchVisitType(e.target.value as any)}
                        className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs outline-none bg-white">
                        <option value="opd">OPD Consultation</option>
                        <option value="ipd">IPD Admission</option>
                      </select>
                      {activeRefOptions.length > 0 ? (
                        <select value={activeRefOptions.some(o => o.value === refNo) ? refNo : ''} onChange={e => setRefNo(e.target.value)}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs outline-none bg-white">
                          {activeRefOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          <option value="">No number</option>
                        </select>
                      ) : (
                        <input value={refNo} onChange={e=>setRefNo(e.target.value)}
                          placeholder={visitType === 'opd' ? 'Consultation no.' : 'IP admission no.'}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs outline-none" />
                      )}
                      <div className="flex gap-1.5">
                        <select value={docId} onChange={e => { setDocId(parseInt(e.target.value)); setDocCustom(''); }}
                          className="flex-1 px-2.5 py-2 border border-slate-300 rounded-lg text-xs outline-none bg-white">
                          <option value={0}>Doctor…</option>
                          {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          <option value={-1}>Other</option>
                        </select>
                        {docId === -1 && <input value={docCustom} onChange={e=>setDocCustom(e.target.value)} placeholder="Name" className="w-24 px-2 py-2 border border-slate-300 rounded-lg text-xs outline-none" />}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Drug search */}
          <div className="hms-card p-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3"><span className="text-blue-600">②</span> Search Drugs</h4>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="Type drug name to search…" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none" />
            {searchQ && drugs.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="hms-table text-xs">
                  <thead><tr>
                    <th className="w-8">#</th><th>Drug Name</th><th>Strength</th><th>Stock</th>
                    <th className="text-right">Rate</th><th className="w-16 text-center">Qty</th><th className="w-20"></th>
                  </tr></thead>
                  <tbody>
                    {drugs.filter(d => d.quantity_in_stock > 0).map((d,i) => (
                      <tr key={d.id}>
                        <td className="text-slate-400">{i+1}</td>
                        <td className="font-medium">{d.name}</td>
                        <td>{d.strength || '-'}</td>
                        <td>{d.quantity_in_stock}</td>
                        <td className="text-right">₹{d.selling_price?.toLocaleString()}</td>
                        <td className="text-center">
                          <input type="number" id={`qty-${d.id}`} defaultValue={1} min={1} max={d.quantity_in_stock}
                            className="w-14 px-1 py-1 border border-slate-300 rounded text-xs outline-none text-center" />
                        </td>
                        <td className="text-center">
                          <button onClick={() => {
                            const qtyInput = document.getElementById(`qty-${d.id}`) as HTMLInputElement;
                            const qty = parseInt(qtyInput?.value || '1');
                            const exists = cart.find(c => c.drug.id === d.id);
                            if (exists) setCart(cart.map(c => c.drug.id === d.id ? {...c, qty: c.qty + qty} : c));
                            else setCart([...cart, {drug:d, qty, sp: d.selling_price || 0}]);
                          }} className="px-2.5 py-1 text-[10px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Add</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Cart & billing */}
        <div className="lg:col-span-2 hms-card p-4 flex flex-col">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3"><span className="text-blue-600">③</span> Cart &amp; Payment ({cart.length})</h4>

          {cart.length > 0 ? (
            <div className="overflow-x-auto mb-3">
              <table className="hms-table text-xs">
                <thead><tr>
                  <th>#</th><th>Drug</th><th className="text-center">Qty</th><th className="text-right">Rate</th><th className="text-right">Total</th><th></th>
                </tr></thead>
                <tbody>
                  {cart.map((c,i) => (
                    <tr key={i}>
                      <td className="text-slate-400">{i+1}</td>
                      <td className="font-medium">{c.drug.name}</td>
                      <td className="text-center">
                        <input type="number" value={c.qty} onChange={e => {
                          const c2 = [...cart]; c2[i].qty = parseInt(e.target.value) || 0; setCart(c2);
                        }} min={1} max={c.drug.quantity_in_stock} className="w-12 px-1 py-0.5 border border-slate-300 rounded text-xs text-center" />
                      </td>
                      <td className="text-right">{c.sp}</td>
                      <td className="text-right font-medium">₹{(c.qty * c.sp).toLocaleString()}</td>
                      <td><button onClick={() => rmCart(i)} className="text-red-500 hover:text-red-700 text-xs font-bold">x</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 py-8 text-center text-xs text-slate-400">Cart empty</div>
          )}

          {/* Totals */}
          <div className="border-t border-slate-200 pt-3 space-y-1 text-xs mb-3">
            <div className="flex justify-between"><span className="text-slate-500">Sub Total</span><span className="font-semibold">₹{total.toLocaleString()}</span></div>
            <div className="flex items-center gap-2 mt-2">
              <select value={discType} onChange={e => setDiscType(e.target.value as any)}
                className="flex-1 px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white">
                <option value="">No Discount</option>
                <option value="percentage">%</option>
                <option value="cash">₹</option>
              </select>
              {discType && (
                <input type="number" value={discVal} onChange={e => setDiscVal(e.target.value)}
                  placeholder="Value" min={0} className="w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none" />
              )}
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-2">
              <span>Net Total</span><span>₹{Math.round(netTotal).toLocaleString()}</span>
            </div>
            {/* Payment mode */}
            <div className="flex items-center gap-2 mt-2">
              <select value={payMode} onChange={e => setPayMode(e.target.value as any)}
                className="flex-1 px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white">
                <option value="cash">💵 Cash</option>
                <option value="upi">📱 UPI</option>
                <option value="card">💳 Card</option>
              </select>
              {payMode !== 'cash' && (
                <input value={payRef} onChange={e=>setPayRef(e.target.value)}
                  placeholder="Txn / Ref No" className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none" />
              )}
            </div>
          </div>

          <button onClick={submit} disabled={saving || cart.length === 0}
            className="w-full py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50">
            {saving ? 'Processing…' : 'Complete Sale & Print'}
          </button>
        </div>
      </div>
    </div>
  );
};
const BillView: React.FC<{ sale: PharmacySaleResponse; onBack: () => void }> = ({ sale, onBack }) => {
  return (
    <div className="max-w-md mx-auto">
      <div className="no-print flex justify-end mb-3">
        <button onClick={onBack} className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 mr-2">&larr; Back</button>
        <button onClick={() => window.print()} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Print</button>
      </div>
      <div className="print-template bg-white border border-slate-200 rounded-xl p-6" style={{fontSize:'11pt'}}>
        <div className="text-center border-b-2 border-dashed border-slate-300 pb-3 mb-3">
          <h2 className="text-lg font-bold m-0">Ayush Hospital Pharmacy</h2>
          <p className="text-xs text-slate-500 m-0 mt-1">Bill No: <span className="font-semibold">{sale.sale_number}</span></p>
        </div>

        {/* Patient info (left) + Date (right) */}
        <div className="flex justify-between items-start mb-3 gap-4">
          <div className="text-xs space-y-0.5">
            <p className="m-0"><span className="font-semibold">Patient:</span> {sale.patient_name || 'Walk-in'}</p>
            {sale.phone_number && <p className="m-0 text-slate-500">Phone: {sale.phone_number}</p>}
            {sale.doctor_name && <p className="m-0"><span className="font-semibold">Doctor:</span> {sale.doctor_name}</p>}
            {sale.reference_no && <p className="m-0 text-slate-500">Ref No: {sale.reference_no}</p>}
            {sale.payment_mode && (
              <p className="m-0 text-slate-500">Payment: <span className="font-semibold capitalize">{sale.payment_mode}</span>{sale.payment_reference ? ` (${sale.payment_reference})` : ''}</p>
            )}
          </div>
          <div className="text-xs text-right shrink-0">
            <p className="m-0 text-slate-500">Date</p>
            <p className="m-0 font-semibold">{new Date(sale.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p className="m-0 text-slate-500 text-[10px]">{new Date(sale.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
          </div>
        </div>

        <table className="w-full text-xs border-collapse">
          <thead><tr className="border-b border-slate-200 bg-slate-50">
            <th className="py-1.5 px-1 text-center font-semibold text-slate-600 w-8">S.No</th>
            <th className="py-1.5 px-1 text-left font-semibold text-slate-600">Item</th>
            <th className="py-1.5 px-1 text-center font-semibold text-slate-600">Qty</th>
            <th className="py-1.5 px-1 text-right font-semibold text-slate-600">Rate</th>
            <th className="py-1.5 px-1 text-right font-semibold text-slate-600">Total</th>
          </tr></thead>
          <tbody>
            {sale.items.map((it,i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-1.5 px-1 text-center text-slate-500">{i+1}</td>
                <td className="py-1.5 px-1">{it.drug_name} {it.strength ? '('+it.strength+')' : ''}</td>
                <td className="py-1.5 px-1 text-center">{it.quantity}</td>
                <td className="py-1.5 px-1 text-right">₹{it.unit_price}</td>
                <td className="py-1.5 px-1 text-right font-medium">₹{it.line_total}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td colSpan={4} className="py-2 px-1 text-right">Total</td>
              <td className="py-2 px-1 text-right">₹{sale.total_amount}</td>
            </tr>
            {sale.discount_type && sale.discount_value > 0 && (
              <tr className="text-slate-500">
                <td colSpan={4} className="py-1 px-1 text-right">Discount ({sale.discount_type === 'percentage' ? '%' : '₹'})</td>
                <td className="py-1 px-1 text-right">- {sale.discount_type === 'percentage' ? sale.discount_value+'%' : '₹'+sale.discount_value}</td>
              </tr>
            )}
            <tr className="font-bold text-sm border-t-2 border-slate-800">
              <td colSpan={4} className="py-2 px-1 text-right">Net Amount</td>
              <td className="py-2 px-1 text-right">₹{sale.net_amount}</td>
            </tr>
          </tfoot>
        </table>
        <p className="text-center text-[10px] text-slate-400 mt-4">Thank you! Visit again.</p>
      </div>
    </div>
  );
};


export default PharmacyPage;
