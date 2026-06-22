import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FavoriteProvider } from './context/FavoriteContext';
import { HealthProfileProvider } from './context/HealthProfileContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import './assets/styles/landing.css';

function AppContent() {
  const { user } = useAuth();

  return (
    <FavoriteProvider>
      <AppRoutes />
    </FavoriteProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HealthProfileProvider>
          <AppContent />
        </HealthProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}