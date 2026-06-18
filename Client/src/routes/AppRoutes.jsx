import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminGuard from '../components/admin/AdminGuard';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import Profile from '../pages/profile/Profile';
import MealSuggestions from '../pages/MealSuggestion/MealSuggestion';
import Favorites from '../pages/food/Favorites';
import MealPlanList from '../pages/mealplan/MealPlanList';
import MealDetail from '../pages/MealDetail/MealDetail';
import LandingPage from '../pages/landing/LandingPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminMeals from '../pages/admin/AdminMeals';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminFeedback from '../pages/admin/AdminFeedback';
import AdminFeedbackDetail from '../pages/admin/AdminFeedbackDetail';
import Nutrition from '../pages/nutrition/Nutrition';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meal-suggestions" element={<MealSuggestions />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/meal-plans" element={<MealPlanList />} />
        <Route path="/recipe/:id" element={<MealDetail />} />
        <Route path="/nutrition" element={<Nutrition />} />
      </Route>
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="meals" element={<AdminMeals />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="feedback" element={<AdminFeedback />} />
        <Route path="feedback/:id" element={<AdminFeedbackDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
