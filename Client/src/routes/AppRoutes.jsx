import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import Profile from '../pages/profile/Profile';
import MealSuggestions from '../pages/MealSuggestion/MealSuggestion';
import Favorites from '../pages/food/Favorites';
import MealPlanList from '../pages/mealplan/MealPlanList';
import MealDetail from '../pages/MealDetail/MealDetail';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/meal-suggestions" element={<MealSuggestions />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/meal-plans" element={<MealPlanList />} />
        <Route path="/recipe/:id" element={<MealDetail />} />
      </Route>
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
