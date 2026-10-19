import { Navigate, useNavigate } from 'react-router-dom';
import OnboardingSurvey from '../../components/forms/OnboardingSurvey';
import { useAuth } from '../../context/AuthContext';
import { useHealthProfile } from '../../hooks/useHealthProfile';

export default function SurveyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';
  if (isAdmin) return <Navigate to="/admin" replace />;

  const { surveyCompleted, loading } = useHealthProfile();

  if (loading) return <div className="loading">Loading...</div>;
  if (surveyCompleted) return <Navigate to="/" replace />;

  const handleComplete = () => {
    sessionStorage.setItem('allowHealthReportOnce', 'true');
    navigate('/meal-plan/report', { replace: true, state: { fromSurvey: true } });
  };

  return <OnboardingSurvey onComplete={handleComplete} />;
}
