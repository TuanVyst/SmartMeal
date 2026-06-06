import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoriteProvider } from './context/FavoriteContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import './assets/styles/landing.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoriteProvider>
          <AppRoutes />
        </FavoriteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
