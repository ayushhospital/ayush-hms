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
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-800 m-0">OPD — Patient Management</h2>
        <p className="text-xs text-gray-500 mt-0.5">Search by phone number to find or register a patient</p>
      </div>

      <PhoneSearch onSearch={handleSearch} loading={false} />

      {searchError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {searchError}
        </div>
      )}

      {searchResults.length > 0 && !showRegistration && !showConsultationForm && !printConsultation && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 m-0">
              {searchResults.length} patient{searchResults.length !== 1 ? 's' : ''} found
            </p>
            <button
              onClick={() => { setShowRegistration(true); loadDoctors(); }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              + Register
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
        <div className="mt-5 text-center py-8 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-sm mb-3">No patients found for this phone number</p>
          <button
            onClick={() => { setShowRegistration(true); loadDoctors(); }}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Register New Patient
          </button>
        </div>
      )}

      {showRegistration && (
        <div className="mt-5">
          <PatientRegistrationForm
            phone={searchedPhone}
            doctors={doctors}
            onComplete={handleRegisterComplete}
            onCancel={() => setShowRegistration(false)}
          />
        </div>
      )}

      {showConsultationForm && doctors.length > 0 && (
        <div className="mt-5">
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
        <div className="mt-5">
          <ConsultationSlip
            consultation={printConsultation}
            onClose={() => setPrintConsultation(null)}
          />
        </div>
      )}

      {!searchedPhone && searchResults.length === 0 && !showRegistration && (
        <div className="mt-12 text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-sm">Enter a phone number above to search</p>
        </div>
      )}
    </div>
  );
};

export default OPDPage;