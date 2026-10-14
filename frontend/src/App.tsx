import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import HomePage from './pages/HomePage';
import OPDPage from './pages/OPDPage';
import IPDHomePage from './pages/IPDHomePage';
import NewAdmissionPage from './pages/NewAdmissionPage';
import AdmissionWorkspacePage from './pages/AdmissionWorkspacePage';
import ReportsPage from './pages/ReportsPage';
import PatientConsultationsPage from './pages/PatientConsultationsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        {/* Mobile top bar (sidebar is desktop-only) */}
        <div className="no-print lg:hidden sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline text-white">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold">AH</div>
            <span className="text-sm font-bold">Ayush HMS</span>
          </Link>
          <nav className="flex gap-2">
            <Link to="/opd" className="text-[11px] text-slate-300 hover:text-white no-underline">OPD</Link>
            <Link to="/ipd" className="text-[11px] text-slate-300 hover:text-white no-underline">IPD</Link>
            <Link to="/reports" className="text-[11px] text-slate-300 hover:text-white no-underline">Reports</Link>
          </nav>
        </div>
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/opd" element={<OPDPage />} />
              <Route path="/opd/patient/:id/consultations" element={<PatientConsultationsPage />} />
              <Route path="/ipd" element={<IPDHomePage />} />
              <Route path="/ipd/new" element={<NewAdmissionPage />} />
              <Route path="/ipd/admissions/:id" element={<AdmissionWorkspacePage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;