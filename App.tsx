import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import HabitDetail from './pages/HabitDetail';
import HabitsPage from './pages/HabitsPage';
import Analytics from './pages/Analytics';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname.split('/')[1] ?? '/'}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/habit/:id" element={<HabitDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  );
}
