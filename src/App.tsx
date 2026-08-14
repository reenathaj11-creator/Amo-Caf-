import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { POSLayout } from './pages/pos/POSLayout';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Login } from './pages/auth/Login';
import { syncService } from '@/services/syncService';
import { supabase } from '@/services/supabase/client';
import { CashRegisterProvider } from '@/contexts/CashRegisterContext';

// Inicia o sincronizador background
syncService.startAutoSync();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Carregando Amo Café...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

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
          
          {/* Rotas Protegidas */}
          <Route path="/pos/*" element={
            <ProtectedRoute>
              <POSLayout />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <PrivateAdminRoute>
                <AdminLayout />
              </PrivateAdminRoute>
            </ProtectedRoute>
          } />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/pos" replace />} />
        </Routes>
      </BrowserRouter>
    </CashRegisterProvider>
  );
}

export default App;
