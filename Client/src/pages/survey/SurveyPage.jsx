import { Navigate, useNavigate } from 'react-router-dom';
import OnboardingSurvey from '../../components/forms/OnboardingSurvey';
import { useHealthProfile } from '../../hooks/useHealthProfile';

export default function SurveyPage() {
  const navigate = useNavigate();
  const { surveyCompleted, loading } = useHealthProfile();

  if (loading) return <div className="loading">Loading...</div>;
  if (surveyCompleted) return <Navigate to="/meal-plan/report" replace />;

  const handleComplete = () => {
    navigate('/meal-plan/report', { replace: true });
  };

  return <OnboardingSurvey onComplete={handleComplete} />;
}
