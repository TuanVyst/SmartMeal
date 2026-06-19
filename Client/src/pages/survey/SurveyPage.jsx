import { useNavigate } from 'react-router-dom';
import HealthSurveyModal from '../../components/forms/HealthSurveyModal';
import { useHealthProfile } from '../../hooks/useHealthProfile';
import { useEffect } from 'react';

export default function SurveyPage() {
  const navigate = useNavigate();
  const { surveyCompleted } = useHealthProfile();

  useEffect(() => {
    if (surveyCompleted) {
      navigate('/dashboard', { replace: true });
    }
  }, [surveyCompleted, navigate]);

  const handleComplete = () => {
    navigate('/dashboard', { replace: true });
  };

  return <HealthSurveyModal mode="page" onComplete={handleComplete} />;
}
