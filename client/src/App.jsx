import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import PatientListing from './pages/PatientListing';
import PatientForm from './pages/PatientForm';
import PatientDiseases from './pages/PatientDiseases';
import DiseaseManagement from './pages/DiseaseManagement';
import { canManagePatients, canViewManagement } from './utils/permissions';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function RoleRoute({ children, check }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!check(user?.role)) return <Navigate to="/patients" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/patients" element={<PrivateRoute><PatientListing /></PrivateRoute>} />
          <Route
            path="/patients/new"
            element={
              <PrivateRoute>
                <RoleRoute check={canManagePatients}><PatientForm /></RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/patients/:id/edit"
            element={
              <PrivateRoute>
                <RoleRoute check={canManagePatients}><PatientForm key="edit" /></RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/patients/:id/add-disease"
            element={
              <PrivateRoute>
                <RoleRoute check={canManagePatients}><PatientForm key="add-disease" addDisease /></RoleRoute>
              </PrivateRoute>
            }
          />
          <Route path="/patients/:id/diseases" element={<PrivateRoute><PatientDiseases /></PrivateRoute>} />
          <Route
            path="/patients/:id/diseases/:diseaseId/management"
            element={
              <PrivateRoute>
                <RoleRoute check={canViewManagement}><DiseaseManagement /></RoleRoute>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/patients" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
