import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import OPDPage from './pages/OPDPage';
import ReportsPage from './pages/ReportsPage';
import IPDPlaceholderPage from './pages/IPDPlaceholderPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/opd" element={<OPDPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/ipd" element={<IPDPlaceholderPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;