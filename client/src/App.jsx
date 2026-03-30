import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import PatientListing from './pages/PatientListing';
import PatientForm from './pages/PatientForm';
import PatientDiseases from './pages/PatientDiseases';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/patients" element={<PrivateRoute><PatientListing /></PrivateRoute>} />
          <Route path="/patients/new" element={<PrivateRoute><PatientForm /></PrivateRoute>} />
          <Route path="/patients/:id/edit" element={<PrivateRoute><PatientForm key="edit" /></PrivateRoute>} />
          <Route path="/patients/:id/add-disease" element={<PrivateRoute><PatientForm key="add-disease" addDisease /></PrivateRoute>} />
          <Route path="/patients/:id/diseases" element={<PrivateRoute><PatientDiseases /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/patients" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
