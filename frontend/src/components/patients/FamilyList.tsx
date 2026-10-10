import React, { useState } from 'react';
import type { PatientSearchResult, Patient } from '../../types';
import PatientEditForm from './PatientEditForm';
import ViewConsultations from './ViewConsultations';

interface FamilyListProps {
  patients: PatientSearchResult[];
  onNewConsultation: (patient: Patient) => void;
  onPrintExisting: (consultationId: number) => void;
  onPatientChanged: () => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'Active Consultation')
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Active</span>;
  if (status === 'Expired')
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Expired</span>;
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200">No Consult</span>;
};

const FamilyList: React.FC<FamilyListProps> = ({ patients, onNewConsultation, onPrintExisting, onPatientChanged }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-3">
      {patients.map((item) => {
        const p = item.patient;
        return (
          <div key={p.id}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <h4 className="text-[15px] font-semibold text-gray-900 m-0 truncate">{p.name}</h4>
                    <StatusBadge status={item.consultation_status} />
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-gray-500">
                    <span className="font-mono text-gray-400">{p.uhid}</span>
                    <span className="text-gray-300">|</span>
                    <span>{p.gender}</span>
                    <span className="text-gray-300">|</span>
                    <span>Age {p.age}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingId(editingId === p.id ? null : p.id); setViewingId(null); }}
                    className="px-3 py-1.5 text-[12px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Edit</button>
                  <button onClick={() => {
                      const alreadyOpen = viewingId === p.id;
                      setEditingId(null);
                      if (alreadyOpen) setRefreshKey(refreshKey + 1);
                      else setViewingId(p.id);
                      setRefreshKey(refreshKey + 1);
                    }}
                    className="px-3 py-1.5 text-[12px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Consults</button>
                </div>
              </div>
            </div>
            {editingId === p.id && (
              <PatientEditForm patient={p} onSaved={() => { setEditingId(null); onPatientChanged(); }} onCancel={() => setEditingId(null)} />
            )}
            {viewingId === p.id && (
              <ViewConsultations patient={p} refreshKey={refreshKey}
                onNewConsultation={() => onNewConsultation(p)}
                onPrintExisting={onPrintExisting} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FamilyList;