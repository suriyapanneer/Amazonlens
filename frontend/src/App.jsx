import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// App pages
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import CompetitorPage from './pages/CompetitorPage';
import KeywordsPage from './pages/KeywordsPage';
import ProductsDBPage from './pages/ProductsDBPage';
import ComparisonPage from './pages/ComparisonPage';
import ProfitPage from './pages/ProfitPage';
import ForecastPage from './pages/ForecastPage';
import ReportsPage from './pages/ReportsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import StoragePage from './pages/StoragePage';

export default function App() {
  const [xrayData,     setXrayData]     = useState(null);
  const [cerebroData,  setCerebroData]  = useState(null);
  const [blackBoxData, setBlackBoxData] = useState(null);
  const [costs,        setCosts]        = useState(null);
  const [analysis,     setAnalysis]     = useState(null);
  const [compareAsins, setCompareAsins] = useState([]);

  // Auto-run analysis when we have xray + costs
  const handleCosts = async (c) => {
    setCosts(c);
    if (xrayData?.stats) {
      try {
        const { api } = await import('./lib/api');
        const res = await api.analyze({ stats: xrayData.stats, costs: c });
        setAnalysis(res);
      } catch {}
    }
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={
              <AppLayout
                opportunityScore={xrayData?.opportunityScore}
                verdict={xrayData?.verdict}
              />
            }>
              <Route path="/" element={<Navigate to="/upload" replace />} />
              <Route path="/upload" element={
                <UploadPage
                  onXray={setXrayData}
                  onCerebro={setCerebroData}
                  onBlackBox={setBlackBoxData}
                  xrayData={xrayData}
                  cerebroData={cerebroData}
                  blackBoxData={blackBoxData}
                />
              } />
              <Route path="/dashboard" element={<DashboardPage data={xrayData} />} />
              <Route path="/competitors" element={<CompetitorPage data={xrayData} />} />
              <Route path="/keywords" element={<KeywordsPage data={cerebroData} />} />
              <Route path="/products" element={<ProductsDBPage onCompare={(asins) => setCompareAsins(asins)} />} />
              <Route path="/compare" element={<ComparisonPage asins={compareAsins} />} />
              <Route path="/profit" element={<ProfitPage costs={costs} setCosts={handleCosts} xrayData={xrayData} />} />
              <Route path="/forecast" element={<ForecastPage analysis={analysis} xrayData={xrayData} costs={costs} />} />
              <Route path="/reports" element={<ReportsPage analysis={analysis} xrayData={xrayData} costs={costs} />} />
              <Route path="/ai-insights" element={<AIInsightsPage />} />
              <Route path="/storage" element={<StoragePage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
