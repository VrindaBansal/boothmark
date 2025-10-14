import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CareerFairsPage from './pages/CareerFairsPage';
import CareerFairDetailPage from './pages/CareerFairDetailPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import ScanPage from './pages/ScanPage';
import ChecklistPage from './pages/ChecklistPage';
import MaterialsPage from './pages/MaterialsPage';
import FollowUpsPage from './pages/FollowUpsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="fairs"
              element={
                <ProtectedRoute>
                  <CareerFairsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="fairs/:fairId"
              element={
                <ProtectedRoute>
                  <CareerFairDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="fairs/:fairId/checklist"
              element={
                <ProtectedRoute>
                  <ChecklistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="fairs/:fairId/companies"
              element={
                <ProtectedRoute>
                  <CompaniesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="fairs/:fairId/companies/:companyId"
              element={
                <ProtectedRoute>
                  <CompanyDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="fairs/:fairId/scan"
              element={
                <ProtectedRoute>
                  <ScanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="materials"
              element={
                <ProtectedRoute>
                  <MaterialsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="follow-ups"
              element={
                <ProtectedRoute>
                  <FollowUpsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
