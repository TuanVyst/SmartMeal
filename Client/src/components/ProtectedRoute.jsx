import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHealthProfile } from '../hooks/useHealthProfile';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { surveyCompleted, loading: profileLoading } = useHealthProfile();
  const location = useLocation();

  if (loading || profileLoading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (surveyCompleted === false && location.pathname !== '/health-survey') {
    return <Navigate to="/health-survey" replace />;
  }

  return children;
}
