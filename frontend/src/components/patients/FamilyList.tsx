import React, { useState } from 'react';
import type { PatientSearchResult, Patient } from '../../types';
import { patientsApi } from '../../services/api';

interface FamilyListProps {
  patients: PatientSearchResult[];
  onNewConsultation: (patient: Patient) => void;
  onPrintExisting: (consultationId: number) => void;
  onPatientChanged: () => void;
  onViewConsultations: (patientId: number) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'Active Consultation')
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Active</span>;
  if (status === 'Expired')
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Expired</span>;
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200">No Consult</span>;
};

const FamilyList: React.FC<FamilyListProps> = ({ patients, onNewConsultation, onPrintExisting, onPatientChanged, onViewConsultations }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState('Male');
  const [editAge, setEditAge] = useState('');
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  return (
    <div className="space-y-3">
      {patients.map((item) => {
        const p = item.patient;
        const isEditing = editingId === p.id;

        const startEdit = () => {
          setEditingId(p.id);
          setEditName(p.name);
          setEditGender(p.gender);
          setEditAge(String(p.age));
          setEditError('');
        };

        const cancelEdit = () => {
          setEditingId(null);
          setEditError('');
        };

        const saveEdit = async () => {
          setEditError('');
          setEditSaving(true);
          try {
            await patientsApi.update(p.id, {
              name: editName.trim(),
              gender: editGender,
              age: parseInt(editAge, 10),
            });
            setEditingId(null);
            onPatientChanged();
          } catch (err: unknown) {
            setEditError(err instanceof Error ? err.message : 'Update failed');
          } finally {
            setEditSaving(false);
          }
        };

        return (
          <div key={p.id}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="px-5 py-3.5">
                {/* Normal display */}
                {!isEditing && (
                  <div className="flex items-center gap-4">
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
                      <button onClick={startEdit}
                        className="px-3 py-1.5 text-[12px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Edit</button>
                      <button onClick={() => onViewConsultations(p.id)}
                        className="px-3 py-1.5 text-[12px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Consults</button>
                    </div>
                  </div>
                )}

                {/* Inline edit */}
                {isEditing && (
                  <div>
                    <div className="space-y-2.5">
                      <input type="text" value={editName} onChange={e=>setEditName(e.target.value)} required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Name" />
                      <div className="flex gap-2.5">
                        <select value={editGender} onChange={e=>setEditGender(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                        </select>
                        <input type="number" value={editAge} onChange={e=>setEditAge(e.target.value)} required min={0} max={150}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Age" />
                      </div>
                      {editError && <div className="text-xs text-red-600">{editError}</div>}
                    </div>
                    <div className="flex gap-2 justify-end mt-3">
                      <button onClick={cancelEdit}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                      <button onClick={saveEdit} disabled={editSaving || !editName.trim()}
                        className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        {editSaving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
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
