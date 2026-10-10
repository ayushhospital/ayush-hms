import React, { useState, useCallback } from 'react';
import { patientsApi, doctorsApi, consultationsApi } from '../services/api';
import type {
  PatientSearchResult,
  Doctor,
  Patient,
  ConsultationResponse,
} from '../types';
import PhoneSearch from '../components/patients/PhoneSearch';
import FamilyList from '../components/patients/FamilyList';
import PatientRegistrationForm from '../components/patients/PatientRegistrationForm';
import ConsultationForm from '../components/consultations/ConsultationForm';
import ConsultationSlip from '../components/consultations/ConsultationSlip';

const OPDPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [searchedPhone, setSearchedPhone] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showConsultationForm, setShowConsultationForm] = useState<{
    patient: Patient;
    existingConsultation?: ConsultationResponse;
  } | null>(null);
  const [printConsultation, setPrintConsultation] = useState<ConsultationResponse | null>(null);
  const [searchError, setSearchError] = useState('');

  const loadDoctors = useCallback(async () => {
    if (doctors.length > 0) return doctors;
    setLoadingDoctors(true);
    try {
      const docs = await doctorsApi.list();
      setDoctors(docs);
      return docs;
    } catch {
      return [];
    } finally {
      setLoadingDoctors(false);
    }
  }, [doctors.length]);
const handleSearch = async (phone: string) => {
    setSearchError('');
    setShowRegistration(false);
    setShowConsultationForm(null);
    setPrintConsultation(null);
    try {
      const result = await patientsApi.search(phone);
      setSearchResults(result.patients);
      setSearchedPhone(phone);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setSearchError(message);
      setSearchResults([]);
    }
  };

  const handleRegisterComplete = async () => {
    setShowRegistration(false);
    if (searchedPhone) {
      await handleSearch(searchedPhone);
    }
  };

  const handleNewConsultation = async (patient: Patient) => {
    await loadDoctors();
    setShowConsultationForm({ patient });
    setPrintConsultation(null);
  };

  const handlePrintExisting = async (consultationId: number) => {
    try {
      const consultation = await consultationsApi.get(consultationId);
      setPrintConsultation(consultation);
    } catch {
      alert('Failed to load consultation details');
    }
  };

  const handleConsultationComplete = async () => {
    setShowConsultationForm(null);
    if (searchedPhone) {
      await handleSearch(searchedPhone);
    }
  };

  const handleConsultationCreated = async (consultation: ConsultationResponse) => {
    setShowConsultationForm(null);
    setPrintConsultation(consultation);
    if (searchedPhone) {
      await handleSearch(searchedPhone);
    }
  };

  const handlePatientChanged = async () => {
    if (searchedPhone) {
      await handleSearch(searchedPhone);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 m-0">OPD — Patient Management</h2>
        <p className="text-xs text-gray-500 mt-0.5">Search by phone number to find or register a patient</p>
      </div>

      {/* Search bar */}
      <div className="mb-5">
        <PhoneSearch onSearch={handleSearch} loading={false} />
      </div>

      {searchError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{searchError}</div>
      )}

      {searchResults.length > 0 && !showRegistration && !showConsultationForm && !printConsultation && (
        <div className="mt-2">
          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 m-0">Patient Records</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">{searchResults.length} patient{searchResults.length !== 1 ? 's' : ''} found</p>
            </div>
            <button
              onClick={() => { setShowRegistration(true); loadDoctors(); }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              + New Registration
            </button>
          </div>
          <FamilyList
            patients={searchResults}
            onNewConsultation={handleNewConsultation}
            onPrintExisting={handlePrintExisting}
            onPatientChanged={handlePatientChanged}
          />
        </div>
      )}

      {searchResults.length === 0 && searchedPhone && !showRegistration && !searchError && (
        <div className="mt-3 text-center py-10 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-4xl text-gray-300 mb-3">👤</div>
          <p className="text-gray-700 text-sm font-medium mb-2">No patients found</p>
          <p className="text-[11px] text-gray-500 mb-4">No records linked to this phone number</p>
          <button
            onClick={() => { setShowRegistration(true); loadDoctors(); }}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            + New Registration
          </button>
        </div>
      )}

      {showRegistration && (
        <div className="mt-3">
          <PatientRegistrationForm
            phone={searchedPhone}
            doctors={doctors}
            onComplete={handleRegisterComplete}
            onCancel={() => setShowRegistration(false)}
          />
        </div>
      )}

      {showConsultationForm && doctors.length > 0 && (
        <div className="mt-3">
          <ConsultationForm
            patient={showConsultationForm.patient}
            doctors={doctors}
            onComplete={handleConsultationComplete}
            onConsultationCreated={handleConsultationCreated}
            onCancel={() => setShowConsultationForm(null)}
          />
        </div>
      )}

      {printConsultation && (
        <div className="mt-3">
          <ConsultationSlip
            consultation={printConsultation}
            onClose={() => setPrintConsultation(null)}
          />
        </div>
      )}

      {!searchedPhone && searchResults.length === 0 && !showRegistration && (
        <div className="mt-16 text-center text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 11.5l-10-8-1v10-3v-9m-1 4m2 9h-3" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Search for a patient</p>
          <p className="text-[11px] text-gray-400">Enter a phone number above to get started</p>
        </div>
      )}
    </div>
  );
};

export default OPDPage;