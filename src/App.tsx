import { BrowserRouter, Routes, Route, Outlet, useParams } from 'react-router-dom';
import './i18n';
import Navbar from './components/Navbar';
import AuthModal from './components/auth/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/Admin/AdminRoute';
import Home from './pages/Home';
import Questionnaire from './pages/Questionnaire';
import SupabaseQuestionnaire from './pages/SupabaseQuestionnaire';
import BudgetPreview from './pages/BudgetPreview';
import ProjectBudget from './pages/ProjectBudget';
import ClientArea from './pages/ClientArea';
import StyleGuide from './pages/StyleGuide';
import AdminDashboard from './pages/Admin/AdminDashboard';
import QuestionnaireEditor from './pages/Admin/QuestionnaireEditor';
import FeedbackWidget from './components/FeedbackWidget';

function SupabaseQuestionnairePage() {
  const { prefix = '' } = useParams<{ prefix: string }>();
  return <SupabaseQuestionnaire questionPrefix={prefix || undefined} categoryLabel={prefix || 'Questionário'} />;
}

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-page)' }}>
      <Navbar />
      <Outlet />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <FeedbackWidget />
      <Routes>
        {/* ── Main app ──────────────────────────────────────────────────────── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/questionario/:workType" element={<Questionnaire />} />
          <Route path="/questionario-v2/:prefix" element={<SupabaseQuestionnairePage />} />
          <Route path="/orcamento/obra" element={<ProjectBudget />} />
          <Route path="/area-cliente" element={<ProtectedRoute><ClientArea /></ProtectedRoute>} />
          <Route path="/styleguide" element={<StyleGuide />} />
        </Route>
        <Route path="/orcamento/preview" element={<><BudgetPreview /><AuthModal /></>} />

        {/* ── Admin (standalone, sem Navbar) ────────────────────────────────── */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/editor/:prefix" element={<AdminRoute><QuestionnaireEditor /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
