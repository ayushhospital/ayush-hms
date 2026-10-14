import React, { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { usersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { AuthUser, ModuleKey, UserCreatePayload } from '../types';

const MODULES: { key: ModuleKey; label: string; desc: string }[] = [
  { key: 'opd', label: 'OPD', desc: 'Outpatient management' },
  { key: 'ipd', label: 'IPD', desc: 'Inpatient admissions & billing' },
  { key: 'reports', label: 'Reports', desc: 'Revenue & operational reports' },
];

interface FormState {
  id: number | null;
  username: string;
  password: string;
  role: 'super' | 'normal';
  modules: ModuleKey[];
  is_active: boolean;
}

const emptyForm: FormState = {
  id: null,
  username: '',
  password: '',
  role: 'normal',
  modules: ['opd'],
  is_active: true,
};

const UsersPage: React.FC = () => {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setUsers(await usersApi.list());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (u: AuthUser) => {
    setForm({
      id: u.id,
      username: u.username,
      password: '',
      role: u.role,
      modules: u.modules.length ? u.modules : ['opd'],
      is_active: u.is_active,
    });
    setShowForm(true);
  };

  const toggleModule = (key: ModuleKey) => {
    setForm((f) => ({
      ...f,
      modules: f.modules.includes(key) ? f.modules.filter((m) => m !== key) : [...f.modules, key],
    }));
  };

  const submit = async () => {
    setError('');
    setNotice('');
    if (!form.username.trim()) { setError('Username is required'); return; }
    if (form.id === null && !form.password) { setError('Password is required for a new user'); return; }
    if (form.role === 'normal' && form.modules.length === 0) {
      setError('Select at least one module for a normal user');
      return;
    }
    setSaving(true);
    try {
      if (form.id === null) {
        const payload: UserCreatePayload = {
          username: form.username.trim(),
          password: form.password,
          role: form.role,
          modules: form.role === 'super' ? (['opd', 'ipd', 'reports'] as ModuleKey[]) : form.modules,
        };
        await usersApi.create(payload);
        setNotice('User "' + form.username.trim() + '" created');
      } else {
        await usersApi.update(form.id, {
          password: form.password || undefined,
          role: form.role,
          modules: form.role === 'super' ? (['opd', 'ipd', 'reports'] as ModuleKey[]) : form.modules,
          is_active: form.is_active,
        });
        setNotice('User updated');
        if (form.id === currentUser?.id) await refreshUser();
      }
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (u: AuthUser) => {
    if (!window.confirm('Delete user "' + u.username + '"? This cannot be undone.')) return;
    setError('');
    try {
      await usersApi.remove(u.id);
      setNotice('User "' + u.username + '" deleted');
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const moduleLabel = (k: string) => MODULES.find((m) => m.key === k)?.label || k;

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Create and manage users — assign roles and module access"
        actions={<button onClick={openCreate} className="hms-btn-primary">+ Create User</button>}
      />

      {error && <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}
      {notice && <div className="mb-4 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">{notice}</div>}

      <div className="hms-card overflow-x-auto">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No users yet</div>
        ) : (
          <table className="hms-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Module Access</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold uppercase">{u.username.slice(0, 2)}</span>
                      {u.username}
                      {u.id === currentUser?.id && <span className="text-[10px] text-slate-400">(you)</span>}
                    </span>
                  </td>
                  <td>
                    <span className={"inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase " + (u.role === 'super' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700')}>{u.role}</span>
                  </td>
                  <td>
                    {u.role === 'super' ? (
                      <span className="text-[11px] text-slate-500">All modules</span>
                    ) : (
                      <span className="flex flex-wrap gap-1">
                        {u.modules.length === 0 && <span className="text-[11px] text-slate-400">None</span>}
                        {u.modules.map((m) => (
                          <span key={m} className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium uppercase">{moduleLabel(m)}</span>
                        ))}
                      </span>
                    )}
                  </td>
                  <td>
                    {u.is_active
                      ? <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">Active</span>
                      : <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">Inactive</span>}
                  </td>
                  <td className="text-slate-500 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="text-right whitespace-nowrap">
                    <button onClick={() => openEdit(u)} className="px-2.5 py-1.5 text-[11px] font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 mr-1.5">Edit</button>
                    <button onClick={() => remove(u)} disabled={u.id === currentUser?.id}
                      className="px-2.5 py-1.5 text-[11px] font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 m-0">{form.id ? 'Edit User — ' + form.username : 'Create User'}</h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                {form.id ? 'Update role, module access or reset the password.' : 'Choose a role and grant module access.'}
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Username *</label>
                <input type="text" value={form.username} disabled={form.id !== null}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{form.id ? 'New password (leave blank to keep)' : 'Password *'}</label>
                <input type="password" value={form.password} placeholder="••••••••"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['normal', 'super'] as const).map((r) => (
                    <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                      className={"px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors " + (form.role === r ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>
                      <span className="block font-semibold capitalize">{r}</span>
                      <span className="block text-[10px] font-normal mt-0.5">
                        {r === 'normal' ? 'Access to granted modules only' : 'Full access + user management'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {form.role === 'normal' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Module access (select all that apply)</label>
                  <div className="space-y-2">
                    {MODULES.map((m) => (
                      <label key={m.key}
                        className={"flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer transition-colors " + (form.modules.includes(m.key) ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50')}>
                        <input type="checkbox" checked={form.modules.includes(m.key)} onChange={() => toggleModule(m.key)} className="accent-blue-600 w-4 h-4" />
                        <span className="flex-1">
                          <span className="block text-sm font-medium text-slate-800">{m.label}</span>
                          <span className="block text-[11px] text-slate-500">{m.desc}</span>
                        </span>
                        {form.modules.includes(m.key) && <span className="text-[10px] font-semibold text-blue-600 uppercase">Granted</span>}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {form.id !== null && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-blue-600 w-4 h-4" />
                  <span className="text-sm text-slate-700">Account active (can sign in)</span>
                </label>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
              <button onClick={submit} disabled={saving}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving…' : form.id ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
