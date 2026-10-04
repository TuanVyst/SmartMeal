import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FavoriteProvider } from './context/FavoriteContext';
import { HealthProfileProvider } from './context/HealthProfileContext';
import { DialogProvider } from './context/DialogContext';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import './assets/styles/landing.css';

import ErrorBoundary from './components/common/ErrorBoundary';
import { useActivityTracker } from './hooks/useActivityTracker';

function AppContent() {
  const { user } = useAuth();
  useActivityTracker();

  return (
    <FavoriteProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </FavoriteProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HealthProfileProvider>
          <DialogProvider>
            <AppContent />
          </DialogProvider>
        </HealthProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}