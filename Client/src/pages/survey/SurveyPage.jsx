import { Navigate, useNavigate } from 'react-router-dom';
import OnboardingSurvey from '../../components/forms/OnboardingSurvey';
import { useHealthProfile } from '../../hooks/useHealthProfile';

export default function SurveyPage() {
  const navigate = useNavigate();
  const { surveyCompleted, loading } = useHealthProfile();

  if (loading) return <div className="loading">Loading...</div>;
  if (surveyCompleted) return <Navigate to="/home" replace />;

  const handleComplete = () => {
    sessionStorage.setItem('allowHealthReportOnce', 'true');
    navigate('/meal-plan/report', { replace: true, state: { fromSurvey: true } });
  };

  return <OnboardingSurvey onComplete={handleComplete} />;
}
