import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css'; // design system tokens + components
import './index.css';        // tailwind (coexists — tokens são CSS vars, não classes)
import { AuthProvider } from './context/AuthContext';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
