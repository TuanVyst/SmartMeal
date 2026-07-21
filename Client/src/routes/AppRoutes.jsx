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
import MealDetail from '../pages/MealDetail/MealDetail';
import IngredientList from '../pages/food/IngredientList';
import IngredientForm from '../pages/food/IngredientForm';
import IngredientDetail from '../pages/food/IngredientDetail';
import LandingPage from '../pages/landing/LandingPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminIngredientTags from '../pages/admin/AdminIngredientTags';
import AdminIngredients from '../pages/admin/AdminIngredients';
import AdminRecipeTags from '../pages/admin/AdminRecipeTags';
import AdminRecipes from '../pages/admin/AdminRecipes';
import AdminCategories from '../pages/admin/AdminCategories';
// import AdminFeedback from '../pages/admin/AdminFeedback';
// import AdminFeedbackDetail from '../pages/admin/AdminFeedbackDetail';
import AdminPlans from '../pages/admin/AdminPlans';
import AdminStatistics from '../pages/admin/AdminStatistics';
import Nutrition from '../pages/nutrition/Nutrition';
import SurveyPage from '../pages/survey/SurveyPage';
import RecipeForm from '../pages/food/RecipeForm';
import SubscriptionPlans from '../pages/subscription/SubscriptionPlans';
import Payment from '../pages/subscription/Payment';
import PaymentSuccess from '../pages/subscription/PaymentSuccess';
import PaymentCancel from '../pages/subscription/PaymentCancel';

import HealthReport from '../pages/meal-plan/HealthReport';
import MealPlanPreview from '../pages/meal-plan/MealPlanPreview';
import MealPlanPage from '../pages/meal-plan/MealPlanPage';
import MealPlanSuggestion from '../pages/meal-plan/MealPlanSuggestion';

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
        <Route path="/subscription" element={<SubscriptionPlans />} />
        <Route path="/subscription/payment" element={<Payment />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/meal-suggestions" element={<MealSuggestions />} />
        <Route path="/meal-suggestion" element={<MealPlanSuggestion />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/recipes/new" element={<RecipeForm />} />
        <Route path="/recipes/:id/edit" element={<RecipeForm />} />
        <Route path="/recipe/:id" element={<MealDetail />} />
        <Route path="/ingredients" element={<IngredientList />} />
        <Route path="/ingredients/new" element={<IngredientForm />} />
        <Route path="/ingredients/:id" element={<IngredientDetail />} />
        <Route path="/ingredients/:id/edit" element={<IngredientForm />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      {/* Protected routes without MainLayout (no sidebar) */}
      <Route
        path="/health-survey"
        element={
          <ProtectedRoute>
            <SurveyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meal-plan/report"
        element={
          <ProtectedRoute>
            <HealthReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meal-plan/preview"
        element={
          <ProtectedRoute>
            <MealPlanPreview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meal-plan"
        element={
          <ProtectedRoute>
            <MealPlanPage />
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
        <Route path="ingredient-tags" element={<AdminIngredientTags />} />
        <Route path="ingredients" element={<AdminIngredients />} />
        <Route path="recipe-tags" element={<AdminRecipeTags />} />
        <Route path="recipes" element={<AdminRecipes />} />
        <Route path="categories" element={<AdminCategories />} />
        {/* <Route path="feedback" element={<AdminFeedback />} /> */}
        {/* <Route path="feedback/:id" element={<AdminFeedbackDetail />} /> */}
        <Route path="plans" element={<AdminPlans />} />
        <Route path="statistics" element={<AdminStatistics />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
