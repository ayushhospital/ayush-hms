import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import OPDPage from './pages/OPDPage';
import IPDHomePage from './pages/IPDHomePage';
import NewAdmissionPage from './pages/NewAdmissionPage';
import AdmissionWorkspacePage from './pages/AdmissionWorkspacePage';
import ReportsPage from './pages/ReportsPage';
import PatientConsultationsPage from './pages/PatientConsultationsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { authApi } from './services/api';

const Protected: React.FC<{ module?: string; superOnly?: boolean; children: React.ReactNode }> = ({
  module,
  superOnly,
  children,
}) => {
  const { user, loading, isSuper, hasModule } = useAuth();
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-400">Loading…</div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (superOnly && !isSuper) return <Navigate to="/" replace />;
  if (module && !hasModule(module)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  const { user, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    (window as any).__openChangePw = () => setShowPasswordModal(true);
    return () => { (window as any).__openChangePw = undefined; };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {user && <Sidebar />}

      {/* Mobile top bar (desktop sidebar is hidden on small screens) */}
      {user && (
        <div className="no-print lg:hidden sticky top-0 z-40 bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline text-white">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-bold">AH</div>
            <span className="text-sm font-bold">Ayush HMS</span>
          </Link>
          <div className="flex items-center gap-2">
            <MobileDate />
            <MobileNav />
          </div>
        </div>
      )}

      <main className={`flex-1 min-w-0 ${user ? '' : 'p-0'}`}>
        {user && (
          <>
            {/* Top bar — date + user info */}
              <div className="no-print hidden lg:flex sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm items-center justify-between px-6 lg:px-8 py-1.5">
                <div className="flex-1" />
                <TopBarDate />
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs font-medium text-slate-500 hidden sm:inline">{user?.username}</span>
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold uppercase">{user?.username?.slice(0, 2)}</div>
                  <button onClick={logout}
                    className="text-[11px] font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 transition-colors ml-1">
                    Sign out
                  </button>
                </div>
              </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/" element={<Protected><HomePage /></Protected>} />
                <Route path="/opd" element={<Protected module="opd"><OPDPage /></Protected>} />
                <Route path="/opd/patient/:id/consultations" element={<Protected module="opd"><PatientConsultationsPage /></Protected>} />
                <Route path="/ipd" element={<Protected module="ipd"><IPDHomePage /></Protected>} />
                <Route path="/ipd/new" element={<Protected module="ipd"><NewAdmissionPage /></Protected>} />
                <Route path="/ipd/admissions/:id" element={<Protected module="ipd"><AdmissionWorkspacePage /></Protected>} />
                <Route path="/reports" element={<Protected module="reports"><ReportsPage /></Protected>} />
                <Route path="/users" element={<Protected superOnly><UsersPage /></Protected>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
          </>
        )}
        {!user && (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

/* Modal for changing own password */
const ChangePasswordModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!current || !newPw) { setError('Please fill all fields'); return; }
    if (newPw.length < 4) { setError('New password must be at least 4 characters'); return; }
    if (newPw !== confirm) { setError('Passwords do not match'); return; }
    setBusy(true);
    try {
      await authApi.changePassword(current, newPw);
      setSuccess('Password updated successfully');
      setTimeout(onClose, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900 m-0">Change Password</h3>
          <p className="text-xs text-slate-500 mt-0.5">Update your own account password</p>
        </div>
        <div className="px-5 py-4 space-y-3.5">
          {error && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          {success && <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{success}</div>}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Current Password</label>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">New Password</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Confirm New Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
          <button onClick={submit} disabled={busy || !current || !newPw || newPw !== confirm}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {busy ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
};
const TopBarDate: React.FC = () => {
  const now = new Date();
  const weekday = now.toLocaleDateString('en-IN', { weekday: 'long' });
  const dateMain = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-2 py-1">
        Today
      </span>
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{weekday}</span>
      <span className="text-sm font-bold text-slate-800">{dateMain}</span>
      <span className="text-[11px] font-medium text-slate-400 tabular-nums">{timeStr}</span>
    </div>
  );
};

/* Compact mobile date chip */
const MobileDate: React.FC = () => {
  const now = new Date();
  const d = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const t = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  return (
    <span className="text-[10px] text-slate-400 whitespace-nowrap">{d} · {t}</span>
  );
};

const MobileNav: React.FC = () => {
  const { hasModule, isSuper } = useAuth();
  const items: { to: string; label: string; show: boolean }[] = [
    { to: '/opd', label: 'OPD', show: hasModule('opd') },
    { to: '/ipd', label: 'IPD', show: hasModule('ipd') },
    { to: '/reports', label: 'Reports', show: hasModule('reports') },
    { to: '/users', label: 'Users', show: isSuper },
  ];
  return (
    <nav className="flex gap-2">
      {items.filter((i) => i.show).map((i) => (
        <Link key={i.to} to={i.to} className="text-[11px] text-slate-300 hover:text-white no-underline">
          {i.label}
        </Link>
      ))}
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;