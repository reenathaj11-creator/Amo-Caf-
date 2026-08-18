import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/auth/Login';
import { syncService } from '@/services/syncService';
import { supabase } from '@/services/supabase/client';
import { CashRegisterProvider } from '@/contexts/CashRegisterContext';
import { Loader2 } from 'lucide-react';

// Lazy loading das rotas pesadas
const POSLayout = lazy(() => import('./pages/pos/POSLayout').then(m => ({ default: m.POSLayout })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));

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

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
  </div>
);

function App() {
  return (
    <CashRegisterProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rotas Protegidas */}
          <Route path="/pos/*" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <POSLayout />
              </Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <PrivateAdminRoute>
                <Suspense fallback={<LoadingScreen />}>
                  <AdminLayout />
                </Suspense>
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
