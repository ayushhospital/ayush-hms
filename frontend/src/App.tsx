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
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100">
      {user && <Sidebar />}

      {/* Mobile top bar (desktop sidebar is hidden on small screens) */}
      {user && (
        <div className="no-print lg:hidden sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline text-white">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold">AH</div>
            <span className="text-sm font-bold">Ayush HMS</span>
          </Link>
          <MobileNav />
        </div>
      )}

      <main className={`flex-1 min-w-0 ${user ? '' : 'p-0'}`}>
        {user && (
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
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