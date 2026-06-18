import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import TopNav from '@/components/layout/TopNav';
import DashboardPage from '@/pages/DashboardPage';
import ClueDetailPage from '@/pages/ClueDetailPage';
import HandleRecordPage from '@/pages/HandleRecordPage';
import HandoverPage from '@/pages/HandoverPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clue/:id" element={<ClueDetailPage />} />
          <Route path="/clue/:id/handle" element={<HandleRecordPage />} />
          <Route path="/handover" element={<HandoverPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
