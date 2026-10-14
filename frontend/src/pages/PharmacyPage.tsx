import React, { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { pharmacyApi, patientsApi, doctorsApi, ipdApi } from '../services/api';
import type {
  PharmacyVendor, PharmacyDrug, PharmacySaleResponse,
  Doctor,
} from '../types';

type TabId = 'vendors' | 'purchases' | 'pos';

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
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* LEFT — invoice details + drug lines */}
        <div className="lg:col-span-4 hms-card p-4">
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
              <div key={i} className="flex gap-1.5 items-center border border-slate-100 rounded-lg p-1.5 overflow-x-auto">
                <select value={it.drug_type||'Tablet'} onChange={e=>updItem(i,'drug_type',e.target.value)} className="w-22 shrink-0 px-2 py-1.5 border border-slate-300 rounded text-xs outline-none bg-white">
                  <option>Tablet</option><option>Capsule</option><option>Syrup</option><option>Powder</option><option>Injection</option><option>Drops</option><option>Cream</option><option>Ointment</option><option>Other</option>
                </select>
                <input value={it.drug_name} onChange={e=>updItem(i,'drug_name',e.target.value)} placeholder="Drug name *" className="w-32 shrink-0 px-2 py-1.5 border border-slate-300 rounded text-xs outline-none" />
                <input value={it.strength} onChange={e=>updItem(i,'strength',e.target.value)} placeholder="Strength" className="w-14 shrink-0 px-2 py-1.5 border border-slate-300 rounded text-xs outline-none" />
                <input value={it.batch} onChange={e=>updItem(i,'batch',e.target.value)} placeholder="Batch" className="w-18 shrink-0 px-2 py-1.5 border border-slate-300 rounded text-xs outline-none" />
                <span className="text-[10px] text-slate-500 shrink-0">Exp:</span>
                <input type="date" value={it.expiry} onChange={e=>updItem(i,'expiry',e.target.value)} className="w-24 shrink-0 px-2 py-1.5 border border-slate-300 rounded text-xs outline-none" />
                <input value={it.qty} onChange={e=>updItem(i,'qty',e.target.value)} placeholder="Qty" type="number" className="w-14 shrink-0 px-1 py-1.5 border border-slate-300 rounded text-xs outline-none" />
                <input value={it.pprice} onChange={e=>updItem(i,'pprice',e.target.value)} placeholder="PP(Buy)" type="number" className="w-18 shrink-0 px-1 py-1.5 border border-slate-300 rounded text-xs outline-none" />
                <input value={it.sprice} onChange={e=>updItem(i,'sprice',e.target.value)} placeholder="SP(Sell)" type="number" className="w-18 shrink-0 px-1 py-1.5 border border-slate-300 rounded text-xs outline-none" />
                <button onClick={()=>rmItem(i)} className="shrink-0 px-2 py-1.5 text-[10px] font-medium text-red-600 bg-red-50 rounded hover:bg-red-100">x</button>
              </div>
            ))}
          </div>
          <button onClick={addItem} className="mt-2 px-3 py-1.5 text-[11px] font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">+ Add Item</button>
        </div>

        {/* RIGHT — summary & save */}
        <div className="lg:col-span-2 hms-card p-4 flex flex-col justify-between">
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
 * 3. POS — SALES COUNTER TAB (revised)
 * ===================================================== */

const PosTab: React.FC = () => {
  const [custType, setCustType] = useState<'patient'|'walkin'>('walkin');
  const [patPhone, setPatPhone] = useState('');
  const [patName, setPatName] = useState('');
  const [patQ, setPatQ] = useState('');
  const [patResults, setPatResults] = useState<any[]>([]);
  const [selectedPat, setSelectedPat] = useState<any>(null);
  const [patInfo, setPatInfo] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [docId, setDocId] = useState(0);
  const [docCustom, setDocCustom] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [drugs, setDrugs] = useState<PharmacyDrug[]>([]);
  const [cart, setCart] = useState<{drug:PharmacyDrug; qty:number; sp:number}[]>([]);
  const [discType, setDiscType] = useState<'percentage'|'cash'|''>('');
  const [discVal, setDiscVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastSale, setLastSale] = useState<PharmacySaleResponse|null>(null);
  const [showBill, setShowBill] = useState(false);

  useEffect(() => { doctorsApi.list().then(setDoctors).catch(()=>{}); }, []);

  const fetchPatient = async () => {
    if (patQ.length < 2) return;
    setSelectedPat(null); setPatInfo('');
    try {
      const res = await patientsApi.search(patQ);
      if (res.patients.length > 0) {
        setPatResults(res.patients.map((r:any)=>r.patient));
        const p = res.patients[0].patient;
        setSelectedPat(p);
        setPatInfo(`${p.name} | ${p.gender} | ${p.uhid} | ${p.phone_number}`);
        setPatName(p.name);
      } else {
        setPatResults([]);
        setPatInfo('No patient found');
      }
    } catch { setPatInfo('Search failed'); }
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
        customer_type: custType === 'walkin' ? 'self' : 'patient',
        patient_id: selectedPat?.id || undefined,
        patient_name: custType === 'walkin' ? (patName || 'Walk-in') : selectedPat?.name,
        phone_number: custType === 'walkin' ? patPhone : (selectedPat?.phone_number || patPhone),
        doctor_name: docName || undefined,
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

          {/* Customer section */}
          <div className="hms-card p-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Customer</h4>
            <div className="flex flex-wrap items-center gap-2">
              <select value={custType} onChange={e => { setCustType(e.target.value as any); setSelectedPat(null); setPatInfo(''); }}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none bg-white">
                <option value="walkin">Walk-in</option>
                <option value="patient">Registered Patient</option>
              </select>

              {custType === 'walkin' ? (
                <>
                  <input value={patName} onChange={e=>setPatName(e.target.value)} placeholder="Name" className="flex-1 min-w-[120px] px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none" />
                  <input value={patPhone} onChange={e=>setPatPhone(e.target.value)} placeholder="Phone number" className="w-40 px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none" />
                </>
              ) : (
                <>
                  <input value={patQ} onChange={e => setPatQ(e.target.value)}
                    placeholder="Search by phone / UHID / admission no" className="flex-1 min-w-[160px] px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none" />
                  <button onClick={fetchPatient} className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Fetch</button>
                </>
              )}
            </div>
            {custType === 'walkin' && doctors.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-slate-500 shrink-0">Doctor:</span>
                <select value={docId} onChange={e => { setDocId(parseInt(e.target.value)); setDocCustom(''); }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none bg-white">
                  <option value={0}>Select doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  <option value={-1}>Other (type below)</option>
                </select>
                {docId === -1 && <input value={docCustom} onChange={e=>setDocCustom(e.target.value)} placeholder="Doctor name" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none" />}
              </div>
            )}
            {custType === 'patient' && patInfo && (
              <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">{patInfo}</div>
            )}
            {custType === 'patient' && selectedPat && doctors.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-slate-500 shrink-0">Doctor:</span>
                <select value={docId} onChange={e => { setDocId(parseInt(e.target.value)); setDocCustom(''); }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none bg-white">
                  <option value={0}>Select doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  <option value={-1}>Other</option>
                </select>
                {docId === -1 && <input value={docCustom} onChange={e=>setDocCustom(e.target.value)} placeholder="Doctor name" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none" />}
              </div>
            )}
          </div>

          {/* Drug search */}
          <div className="hms-card p-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Search Drugs</h4>
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
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Cart ({cart.length})</h4>

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
      <div className="bg-white border border-slate-200 rounded-xl p-6 print:p-4 print:shadow-none print:border-0" style={{fontSize:'11pt'}}>
        <div className="text-center border-b-2 border-dashed border-slate-300 pb-3 mb-3">
          <h2 className="text-lg font-bold m-0">Ayush Hospital Pharmacy</h2>
          <p className="text-xs text-slate-500 m-0 mt-1">{sale.sale_number}</p>
        </div>
        <div className="text-xs mb-3 space-y-0.5">
          <p className="m-0"><span className="font-semibold">Customer:</span> {sale.patient_name || 'Walk-in'}</p>
          {sale.phone_number && <p className="m-0 text-slate-500">Ph: {sale.phone_number}</p>}
          {sale.doctor_name && <p className="m-0 text-slate-500">Dr: {sale.doctor_name}</p>}
          <p className="m-0 text-slate-500">{new Date(sale.created_at).toLocaleString('en-IN')}</p>
        </div>
        <table className="w-full text-xs border-collapse">
          <thead><tr className="border-b border-slate-200">
            <th className="py-1.5 text-left font-semibold text-slate-600">Item</th>
            <th className="py-1.5 text-center font-semibold text-slate-600">Qty</th>
            <th className="py-1.5 text-right font-semibold text-slate-600">Rate</th>
            <th className="py-1.5 text-right font-semibold text-slate-600">Total</th>
          </tr></thead>
          <tbody>
            {sale.items.map((it,i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-1.5">{it.drug_name} {it.strength ? '('+it.strength+')' : ''}</td>
                <td className="py-1.5 text-center">{it.quantity}</td>
                <td className="py-1.5 text-right">₹{it.unit_price}</td>
                <td className="py-1.5 text-right font-medium">₹{it.line_total}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td colSpan={3} className="py-2 text-right">Total</td>
              <td className="py-2 text-right">₹{sale.total_amount}</td>
            </tr>
            {sale.discount_type && sale.discount_value > 0 && (
              <tr className="text-slate-500">
                <td colSpan={3} className="py-1 text-right">Discount ({sale.discount_type})</td>
                <td className="py-1 text-right">- {sale.discount_type === 'percentage' ? sale.discount_value+'%' : '₹'+sale.discount_value}</td>
              </tr>
            )}
            <tr className="font-bold text-sm border-t-2 border-slate-800">
              <td colSpan={3} className="py-2 text-right">Net Amount</td>
              <td className="py-2 text-right">₹{sale.net_amount}</td>
            </tr>
          </tfoot>
        </table>
        <p className="text-center text-[10px] text-slate-400 mt-4">Thank you! Visit again.</p>
      </div>
    </div>
  );
};


export default PharmacyPage;
