import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientsApi, doctorsApi, ipdApi } from '../services/api';
import type { Patient, Doctor } from '../types';

const NewAdmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientSearchMode, setPatientSearchMode] = useState<'phone' | 'uhid'>('phone');
  const [patientError, setPatientError] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [admissionType, setAdmissionType] = useState<'Planned' | 'Emergency' | 'Referral'>('Emergency');
  const [admittingDoctorId, setAdmittingDoctorId] = useState(0);
  const [reason, setReason] = useState('');
  const [initialDiagnosis, setInitialDiagnosis] = useState('');
  const [referralSource, setReferralSource] = useState('Self');
  const [referringProvider, setReferringProvider] = useState('');
  const [wardBed, setWardBed] = useState('');
  const [dept, setDept] = useState('');
  const [attName, setAttName] = useState('');
  const [attRelation, setAttRelation] = useState('Spouse');
  const [attPhone, setAttPhone] = useState('');
  const [attAltPhone, setAttAltPhone] = useState('');
  const [attAddress, setAttAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { doctorsApi.list().then(d => setDoctors(d)).catch(() => {}); }, []);

  const searchPatients = async () => {
    setPatientError('');
    if (patientSearch.length < 3) return;
    try {
      let result;
      if (patientSearchMode === 'phone') result = await patientsApi.search(patientSearch);
      else result = await patientsApi.searchByUhid(patientSearch);
      setSearchResults(result.patients.map((r: any) => r.patient));
    } catch { setPatientError('Search failed'); }
  };

  const [showReg, setShowReg] = useState(false);
  const [regName, setRegName] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regAge, setRegAge] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regErr, setRegErr] = useState('');
  const [regSaving, setRegSaving] = useState(false);

  const registerPatient = async () => {
    setRegErr('');
    if (!regName.trim() || !regPhone.trim() || !regAge) { setRegErr('Name, phone and age are required'); return; }
    setRegSaving(true);
    try {
      const p = await patientsApi.create({
        name: regName.trim(), gender: regGender,
        age: parseInt(regAge, 10), phone_number: regPhone.trim(),
      });
      setSelectedPatient(p);
      setSearchResults([p]);
      setStep(2);
    } catch (err: unknown) {
      setRegErr(err instanceof Error ? err.message : 'Failed to create patient');
    } finally { setRegSaving(false); }
  };

  const submitAdmission = async () => {
    setError('');
    if (!selectedPatient || !admittingDoctorId || !reason.trim() || !attName.trim() || !attPhone.trim()) {
      setError('Please fill all required fields'); return;
    }
    setSubmitting(true);
    try {
      const res = await ipdApi.create({
        patient_id: selectedPatient.id,
        admission_datetime: new Date().toISOString(),
        admission_type: admissionType,
        admitting_doctor_id: admittingDoctorId,
        department: dept || undefined,
        reason_for_admission: reason.trim(),
        initial_diagnosis: initialDiagnosis.trim() || undefined,
        referral_source: referralSource,
        referring_provider: referringProvider.trim() || undefined,
        ward_bed: wardBed.trim() || undefined,
        attendant_name: attName.trim(),
        attendant_relationship: attRelation,
        attendant_phone: attPhone.trim(),
        attendant_alternate_phone: attAltPhone.trim() || undefined,
        attendant_address: attAddress.trim() || undefined,
      });
      navigate('/ipd/admissions/' + res.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create admission');
    } finally { setSubmitting(false); }
  };

  return (<div className="max-w-2xl mx-auto">
    <button onClick={() => navigate('/ipd')} className="mb-4 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">&larr; Back to IPD</button>
    <h2 className="text-base font-semibold text-gray-900 m-0 mb-2">New IPD Admission</h2>

    <div className="flex gap-2 mb-4">
      {['Select Patient', 'Admission Details', 'Attendant & Confirm'].map((l, i) => (
        <div key={i} className={`px-3 py-1 text-xs font-medium rounded-lg ${step===i+1?'bg-blue-600 text-white':step>i+1?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>Step {i+1}: {l}</div>
      ))}
    </div>

    {error && <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 mb-3">{error}</div>}

    {step === 1 && (<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Select Patient</h3>
      <div className="flex items-center gap-2 mb-3">
        <select value={patientSearchMode} onChange={e => setPatientSearchMode(e.target.value as 'phone'|'uhid')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white">
          <option value="phone">Phone</option><option value="uhid">UHID</option></select>
        <input type="text" value={patientSearch} onChange={e => setPatientSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Enter phone number or UHID"
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); searchPatients(); } }} />
        <button onClick={searchPatients} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Search</button>
      </div>
      {patientError && <div className="text-xs text-red-600 mb-2">{patientError}</div>}
      {selectedPatient && <div className="bg-emerald-50 rounded-lg p-3 mb-3"><p className="text-xs font-semibold text-emerald-800">Selected: {selectedPatient.name} ({selectedPatient.uhid})</p><p className="text-xs text-emerald-600">{selectedPatient.gender}, Age {selectedPatient.age} &mdash; {selectedPatient.phone_number}</p></div>}
      {searchResults.map(p => (
        <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg border border-gray-200 px-4 py-2.5 mb-2">
          <div><p className="text-sm font-medium text-gray-800">{p.name}</p><p className="text-[11px] text-gray-500">{p.uhid} | {p.gender}, Age {p.age} | {p.phone_number}</p></div>
          <button onClick={() => { setSelectedPatient(p); setStep(2); }} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Select</button>
        </div>
      ))}
      <div className="border-t border-gray-100 pt-3 mt-1">
        {searchResults.length === 0 && patientSearch.length >= 3 && !selectedPatient && (
          <p className="text-xs text-gray-500 mb-1">No patient found with this {patientSearchMode === 'phone' ? 'phone number' : 'UHID'}. You can register a new patient below.</p>
        )}
        {!selectedPatient && (
          <button onClick={() => { setShowReg(!showReg); if (!showReg) setRegPhone(patientSearch); }}
            className="text-xs font-medium text-blue-600 hover:underline">
            {showReg ? 'Cancel registration' : '+ Register a new patient'}
          </button>
        )}
        {showReg && !selectedPatient && (
          <div className="mt-2 bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-700">New Patient Registration</p>
            <div className="flex gap-2">
              <input type="text" value={regName} onChange={e => setRegName(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Full name *" />
              <select value={regGender} onChange={e => setRegGender(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
              <input type="number" value={regAge} onChange={e => setRegAge(e.target.value)} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Age *" />
            </div>
            <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Phone number *" />
            {regErr && <p className="text-xs text-red-600">{regErr}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowReg(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={registerPatient} disabled={regSaving} className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                {regSaving ? 'Creating...' : 'Create & Continue'}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-4">
        <button onClick={() => navigate('/ipd')} className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
      </div>
    </div>)}

    {step === 2 && (<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Admission Details</h3>
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-0.5">Type *</label>
            <select value={admissionType} onChange={e => setAdmissionType(e.target.value as 'Planned' | 'Emergency' | 'Referral')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white">
              <option value="Planned">Planned</option><option value="Emergency">Emergency</option><option value="Referral">Referral</option></select></div>
          <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-0.5">Doctor *</label>
            <select value={admittingDoctorId} onChange={e => setAdmittingDoctorId(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white">
              <option value="">Select doctor</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.department})</option>)}
            </select></div>
        </div>
        <textarea value={reason} onChange={e => setReason(e.target.value)} required rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Reason for admission *" />
        <textarea value={initialDiagnosis} onChange={e => setInitialDiagnosis(e.target.value)} rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Initial diagnosis (optional)" />
        <div className="flex gap-3">
          <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-0.5">Referral</label>
            <select value={referralSource} onChange={e => setReferralSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white">
              <option value="Self">Self/Direct</option><option value="Doctor">Doctor</option><option value="Hospital">Hospital</option><option value="Other">Other</option></select></div>
          <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-0.5">Dept</label>
            <input type="text" value={dept} onChange={e => setDept(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Department" /></div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-0.5">Ward/Bed</label>
            <input type="text" value={wardBed} onChange={e => setWardBed(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="e.g. Ward A, Bed 12" /></div>
          <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-0.5">Referring Provider</label>
            <input type="text" value={referringProvider} onChange={e => setReferringProvider(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="If referred" /></div>
        </div>
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button onClick={() => setStep(1)} className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">&larr; Back</button>
        <button onClick={() => setStep(3)} className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Continue &rarr;</button>
      </div>
    </div>)}

    {step === 3 && (<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Attendant &amp; Confirm</h3>
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-0.5">Attendant Name *</label>
            <input type="text" value={attName} onChange={e => setAttName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Full name" /></div>
          <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-0.5">Relationship *</label>
            <select value={attRelation} onChange={e => setAttRelation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white">
              {['Spouse','Parent','Child','Sibling','Relative','Friend','Other'].map(r => <option key={r} value={r}>{r}</option>)}
            </select></div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-0.5">Phone *</label>
            <input type="tel" value={attPhone} onChange={e => setAttPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Phone number" /></div>
          <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-0.5">Alt Phone</label>
            <input type="tel" value={attAltPhone} onChange={e => setAttAltPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Optional" /></div>
        </div>
        <textarea value={attAddress} onChange={e => setAttAddress(e.target.value)} rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="Address (optional)" />
      </div>
      <div className="bg-gray-50 rounded-lg p-3 mt-3">
        <p className="text-xs font-semibold text-gray-700 mb-1">Summary</p>
        {selectedPatient && <p className="text-xs text-gray-600">Patient: {selectedPatient.name} ({selectedPatient.uhid})</p>}
        <p className="text-xs text-gray-600">Type: {admissionType} | Doctor: {doctors.find(d=>d.id===admittingDoctorId)?.name||'-'}</p>
        <p className="text-xs text-gray-600">Attendant: {attName} ({attRelation}) &mdash; {attPhone}</p>
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button onClick={() => setStep(2)} className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">&larr; Back</button>
        <button onClick={submitAdmission} disabled={submitting}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {submitting ? 'Saving...' : 'Save Admission'}</button>
      </div>
    </div>)}
  </div>);
};
export default NewAdmissionPage;
