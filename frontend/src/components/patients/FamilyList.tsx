import React from 'react';
import type { PatientSearchResult, Patient } from '../../types';

interface FamilyListProps {
  patients: PatientSearchResult[];
  onNewConsultation: (patient: Patient) => void;
  onPrintExisting: (consultationId: number) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'Active Consultation') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
  }
  if (status === 'Expired') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Expired</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">No Consult</span>;
};

const FamilyList: React.FC<FamilyListProps> = ({ patients, onNewConsultation, onPrintExisting }) => {
  return (
    <div className="space-y-2">
      {patients.map((item) => {
        const patient = item.patient;
        return (
          <div key={patient.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-800 m-0 truncate">{patient.name}</h4>
                  <StatusBadge status={item.consultation_status} />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                  <span>{patient.uhid}</span>
                  <span>{patient.gender}</span>
                  <span>Age {patient.age}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {item.active_consultation_id ? (
                  <button onClick={() => onPrintExisting(item.active_consultation_id!)}
                    className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    Print Slip
                  </button>
                ) : (
                  <button onClick={() => onNewConsultation(patient)}
                    className="px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    New
                  </button>
                )}
                {item.active_consultation_id && (
                  <button onClick={() => onNewConsultation(patient)}
                    className="px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    New
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FamilyList;