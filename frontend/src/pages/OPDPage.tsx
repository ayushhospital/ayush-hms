import React, { useState } from 'react';
import { patientsApi, doctorsApi, consultationsApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import type { PatientSearchResult, Doctor, Patient, ConsultationResponse } from '../types';
import PhoneSearch from '../components/patients/PhoneSearch';
import FamilyList from '../components/patients/FamilyList';
import PatientRegistrationForm from '../components/patients/PatientRegistrationForm';
import ConsultationForm from '../components/consultations/ConsultationForm';
import ConsultationSlip from '../components/consultations/ConsultationSlip';

const OPDPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [searchedQuery, setSearchedQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'phone' | 'uhid' | 'date'>('phone');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showConsultationForm, setShowConsultationForm] = useState<{ patient: Patient } | null>(null);
  const [printConsultation, setPrintConsultation] = useState<ConsultationResponse | null>(null);
  const [searchError, setSearchError] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const loadDoctors = async () => {
    if (doctors.length > 0) return doctors;
    try { const d = await doctorsApi.list(); setDoctors(d); return d; }
    catch { return []; }
  };

  const handleSearch = async (query: string) => {
    setSearchError(''); setShowRegistration(false); setShowConsultationForm(null); setPrintConsultation(null);
    try {
      let result;
      if (searchMode === 'phone') result = await patientsApi.search(query);
      else if (searchMode === 'uhid') result = await patientsApi.searchByUhid(query);
      else result = await patientsApi.searchByDateRange(dateStart, dateEnd);
      setSearchResults(result.patients);
      setSearchedQuery(query);
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    }
  };

  const handleRegisterComplete = async () => {
    setShowRegistration(false);
    if (searchedQuery && searchMode === 'phone') await handleSearch(searchedQuery);
  };

  const handleNewConsultation = async (patient: Patient) => {
    await loadDoctors();
    setShowConsultationForm({ patient });
    setPrintConsultation(null);
  };

  const handlePrintExisting = async (consultationId: number) => {
    try { setPrintConsultation(await consultationsApi.get(consultationId)); }
    catch { alert('Failed to load'); }
  };

  const handleConsultationCreated = async (consultation: ConsultationResponse) => {
    setShowConsultationForm(null);
    setPrintConsultation(consultation);
    if (searchedQuery && searchMode === 'phone') await handleSearch(searchedQuery);
  };

  const handlePatientChanged = async () => {
    if (searchedQuery && searchMode === 'phone') await handleSearch(searchedQuery);
  };

  const today = () => new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 m-0">OPD — Patient Management</h2>
        <p className="text-xs text-gray-500 mt-0.5">Search to find or register a patient</p>
      </div>

      {/* Search mode tabs */}
      <div className="flex gap-2 mb-4">
        {['phone','uhid','date'].map((mode) => (
          <button key={mode} onClick={() => { setSearchMode(mode as 'phone'|'uhid'|'date'); setSearchResults([]); setSearchedQuery(''); setSearchError(''); }}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              searchMode === mode ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {mode === 'phone' ? 'Phone' : mode === 'uhid' ? 'UHID' : 'Date Range'}
          </button>
        ))}
      </div>

      {/* Search input */}
      {searchMode === 'phone' && <PhoneSearch onSearch={handleSearch} loading={false} />}

      {searchMode === 'uhid' && (
        <form onSubmit={(e) => { e.preventDefault(); const v = (document.getElementById('uhid-input') as HTMLInputElement).value.trim(); if (v) handleSearch(v); }} className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-0 px-4 py-2.5">
            <input id="uhid-input" type="text" placeholder="Enter UHID (e.g. AYH-000001)"
              className="flex-1 border-0 bg-transparent text-sm outline-none placeholder-gray-400" autoFocus />
            <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Search</button>
          </div>
        </form>
      )}

      {searchMode === 'date' && (
        <form onSubmit={(e) => { e.preventDefault(); if (dateStart && dateEnd) handleSearch(''); }} className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <span className="text-xs text-gray-500">From</span>
            <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none" />
            <span className="text-xs text-gray-500">To</span>
            <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none" />
            <button type="submit" disabled={!dateStart || !dateEnd}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40">Search</button>
          </div>
        </form>
      )}

      {searchError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{searchError}</div>}

      {searchResults.length > 0 && !showRegistration && !showConsultationForm && !printConsultation && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 m-0">Patient Records</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">{searchResults.length} patient{searchResults.length !== 1 ? 's' : ''} found</p>
            </div>
            <button onClick={() => { setShowRegistration(true); loadDoctors(); }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">+ New Registration</button>
          </div>
          <FamilyList patients={searchResults}
            onNewConsultation={handleNewConsultation}
            onPrintExisting={handlePrintExisting}
            onPatientChanged={handlePatientChanged}
            onViewConsultations={(pid) => navigate(`/opd/patient/${pid}/consultations`)} />
        </div>
      )}

      {searchResults.length === 0 && searchedQuery && !showRegistration && !searchError && (
        <div className="mt-3 text-center py-10 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-4xl text-gray-300 mb-3">\ud83d\udc64</div>
          <p className="text-gray-700 text-sm font-medium mb-2">No patients found</p>
          <p className="text-[11px] text-gray-500 mb-4">No records matched your search</p>
          <button onClick={() => { setShowRegistration(true); loadDoctors(); }}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">+ New Registration</button>
        </div>
      )}

      {showRegistration && (
        <div className="mt-3">
          <PatientRegistrationForm phone={searchedQuery} doctors={doctors}
            onComplete={handleRegisterComplete} onCancel={() => setShowRegistration(false)} />
        </div>
      )}

      {showConsultationForm && doctors.length > 0 && (
        <div className="mt-3">
          <ConsultationForm patient={showConsultationForm.patient} doctors={doctors}
            onComplete={() => setShowConsultationForm(null)}
            onConsultationCreated={handleConsultationCreated}
            onCancel={() => setShowConsultationForm(null)} />
        </div>
      )}

      {printConsultation && (
        <div className="mt-3">
          <ConsultationSlip consultation={printConsultation} onClose={() => setPrintConsultation(null)} />
        </div>
      )}

      {!searchedQuery && searchResults.length === 0 && !showRegistration && (
        <div className="mt-16 text-center text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <div className="text-4xl text-gray-300 mb-3">&#128269;</div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Search for a patient</p>
          <p className="text-[11px] text-gray-400">Use Phone, UHID, or Date Range above</p>
        </div>
      )}
    </div>
  );
};

export default OPDPage;
