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
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Active</span>;
  if (status === 'Expired')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Expired</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200">No Consult</span>;
};

const FamilyList: React.FC<FamilyListProps> = ({ patients, onNewConsultation, onPrintExisting, onPatientChanged, onViewConsultations }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState('Male');
  const [editAge, setEditAge] = useState('');
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-[12px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="py-2.5 px-4 text-left text-[11px] font-semibold text-gray-600">Patient Name</th>
            <th className="py-2.5 px-4 text-left text-[11px] font-semibold text-gray-600">Status</th>
            <th className="py-2.5 px-4 text-left text-[11px] font-semibold text-gray-600">UHID</th>
            <th className="py-2.5 px-4 text-left text-[11px] font-semibold text-gray-600">Gender</th>
            <th className="py-2.5 px-4 text-left text-[11px] font-semibold text-gray-600">Age</th>
            <th className="py-2.5 px-4 text-center text-[11px] font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
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

            const cancelEdit = () => { setEditingId(null); setEditError(''); };

            const saveEdit = async () => {
              setEditError('');
              setEditSaving(true);
              try {
                await patientsApi.update(p.id, { name: editName.trim(), gender: editGender, age: parseInt(editAge, 10) });
                setEditingId(null);
                onPatientChanged();
              } catch (err: unknown) {
                setEditError(err instanceof Error ? err.message : 'Update failed');
              } finally { setEditSaving(false); }
            };

            return (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* Patient Name */}
                <td className="py-3 px-4 text-gray-900 font-medium">
                  {isEditing
                    ? <input type="text" value={editName} onChange={e=>setEditName(e.target.value)} required
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    : p.name
                  }
                </td>
                {/* Status */}
                <td className="py-3 px-4">{StatusBadge({status: item.consultation_status})}</td>
                {/* UHID */}
                <td className="py-3 px-4 text-gray-500 font-mono">{p.uhid}</td>
                {/* Gender */}
                <td className="py-3 px-4 text-gray-600">
                  {isEditing
                    ? <select value={editGender} onChange={e=>setEditGender(e.target.value)}
                        className="px-2.5 py-1.5 border border-gray-300 rounded-md text-sm outline-none bg-white">
                        <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                      </select>
                    : p.gender
                  }
                </td>
                {/* Age */}
                <td className="py-3 px-4 text-gray-600">
                  {isEditing
                    ? <input type="number" value={editAge} onChange={e=>setEditAge(e.target.value)} required min={0} max={150}
                        className="w-20 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm outline-none" />
                    : p.age
                  }
                </td>
                {/* Actions */}
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  {isEditing ? (
                    <>
                      {editError && <span className="text-[10px] text-red-500 block">{editError}</span>}
                      <div className="flex gap-1.5 justify-center">
                        <button onClick={cancelEdit} className="px-2.5 py-1 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-100">Cancel</button>
                        <button onClick={saveEdit} disabled={editSaving||!editName.trim()}
                          className="px-2.5 py-1 text-[11px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">{editSaving?'Saving...':'Save'}</button>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={startEdit} className="px-2.5 py-1 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-100">Edit</button>
                      <button onClick={() => onNewConsultation(p)} className="px-2.5 py-1 text-[11px] font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700">New</button>
                      <button onClick={() => onViewConsultations(p.id)} className="px-2.5 py-1 text-[11px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Consults</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FamilyList;
