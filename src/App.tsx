import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { POSLayout } from './pages/pos/POSLayout';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Login } from './pages/auth/Login';
import { syncService } from '@/services/syncService';

// Inicia o sincronizador background
syncService.startAutoSync();

import { CashRegisterProvider } from '@/contexts/CashRegisterContext';

const PrivateAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const role = localStorage.getItem('@amocafe:role');
  if (role === 'pdv') {
    return <Navigate to="/pos" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <CashRegisterProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* PDV Routes */}
          <Route path="/pos/*" element={<POSLayout />} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <PrivateAdminRoute>
              <AdminLayout />
            </PrivateAdminRoute>
          } />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/pos" replace />} />
        </Routes>
      </BrowserRouter>
    </CashRegisterProvider>
  );
}

export default App;
