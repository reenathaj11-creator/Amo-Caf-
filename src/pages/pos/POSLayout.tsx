import { Routes, Route } from 'react-router-dom';
import { POSProvider } from '@/contexts/POSContext';
import { POSDashboard } from './POSDashboard';
import { TopHeader } from '@/components/layout/TopHeader';

export function POSLayout() {
  return (
    <POSProvider>
      <div className="flex flex-col h-screen bg-cream-50 font-sans">
          <TopHeader />
          
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<POSDashboard />} />
            </Routes>
          </main>
        </div>
    </POSProvider>
  );
}
