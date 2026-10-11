import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/opd" element={<OPDPage />} />
            <Route path="/opd/patient/:id/consultations" element={<PatientConsultationsPage />} />
            <Route path="/ipd" element={<IPDHomePage />} />
            <Route path="/ipd/new" element={<NewAdmissionPage />} />
            <Route path="/ipd/admissions/:id" element={<AdmissionWorkspacePage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;