import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import './i18n';
import Navbar from './components/Navbar';
import AuthModal from './components/auth/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Questionnaire from './pages/Questionnaire';
import BudgetPreview from './pages/BudgetPreview';
import ProjectBudget from './pages/ProjectBudget';
import ClientArea from './pages/ClientArea';
import StyleGuide from './pages/StyleGuide';

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
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/questionario/:workType" element={<Questionnaire />} />
          <Route path="/orcamento/obra" element={<ProjectBudget />} />
          <Route path="/area-cliente" element={<ProtectedRoute><ClientArea /></ProtectedRoute>} />
          <Route path="/styleguide" element={<StyleGuide />} />
        </Route>
        {/* BudgetPreview é fora do MainLayout mas partilha o mesmo AuthModal via portal */}
        <Route path="/orcamento/preview" element={<><BudgetPreview /><AuthModal /></>} />
      </Routes>
    </BrowserRouter>
  );
}
