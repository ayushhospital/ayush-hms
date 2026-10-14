import React from 'react';
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
            {/* Top bar — date prominently at the top right */}
              <div className="no-print hidden lg:block sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2 flex items-center justify-end">
                  <TopBarDate />
                  <button onClick={logout}
                    className="ml-4 text-[11px] font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 transition-colors">
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