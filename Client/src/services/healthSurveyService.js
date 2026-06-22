import api from './api';

export async function submitHealthSurvey(surveyData) {
  const { data } = await api.post('/health-survey', surveyData);
  if (data.success && data.profile) {
    localStorage.setItem('userHealthProfile', JSON.stringify(data.profile));
    localStorage.setItem('healthSurveyCompleted', 'true');
  }
  return data;
}

export async function getHealthProfile() {
  const { data } = await api.get('/health-survey/profile');
  return data;
}

export async function updateHealthProfile(profileData) {
  const { data } = await api.put('/health-survey/profile', profileData);
  if (data.success && data.profile) {
    localStorage.setItem('userHealthProfile', JSON.stringify(data.profile));
  }
  return data;
}

export async function getBmiHistory() {
  const { data } = await api.get('/health-survey/bmi-history');
  return data;
}

export const healthSurveyService = {
  submitHealthSurvey,
  getHealthProfile,
  updateHealthProfile,
  getBmiHistory,
};