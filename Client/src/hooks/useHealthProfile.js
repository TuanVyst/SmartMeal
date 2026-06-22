import { useContext } from 'react';
import { HealthProfileContext } from '../context/HealthProfileContext';

export function useHealthProfile() {
  const context = useContext(HealthProfileContext);
  if (!context) {
    throw new Error('useHealthProfile must be used within a HealthProfileProvider');
  }
  return context;
}