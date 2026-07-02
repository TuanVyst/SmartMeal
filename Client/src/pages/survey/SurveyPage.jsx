import { Navigate, useNavigate } from 'react-router-dom';
import HealthSurveyModal from '../../components/forms/HealthSurveyModal';
import { useHealthProfile } from '../../hooks/useHealthProfile';

export default function SurveyPage() {
  const navigate = useNavigate();
  const { surveyCompleted, loading } = useHealthProfile();

  if (loading) return <div className="loading">Loading...</div>;
  if (surveyCompleted) return <Navigate to="/dashboard" replace />;

  const handleComplete = () => {
    navigate('/dashboard', { replace: true });
  };

  return <HealthSurveyModal mode="page" onComplete={handleComplete} />;
}
