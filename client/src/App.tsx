import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <CustomerAuthProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Customer Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="catalogue" element={<Catalogue />} />
              <Route path="about" element={<Navigate to="/" replace />} />
              <Route path="contact" element={<Navigate to="/" replace />} />
              <Route path="login" element={<Navigate to="/" replace />} />
              <Route path="register" element={<Navigate to="/" replace />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            {/* Catch-all fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </CustomerAuthProvider>
  );
}

export default App;