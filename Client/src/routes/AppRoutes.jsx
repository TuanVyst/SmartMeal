import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminGuard from '../components/admin/AdminGuard';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Profile from '../pages/profile/Profile';
import MealDetail from '../pages/MealDetail/MealDetail';
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
import AdminPlans from '../pages/admin/AdminPlans';
import AdminStatistics from '../pages/admin/AdminStatistics';
import SurveyPage from '../pages/survey/SurveyPage';
import RecipeForm from '../pages/food/RecipeForm';
import SubscriptionPlans from '../pages/subscription/SubscriptionPlans';
import Payment from '../pages/subscription/Payment';
import PaymentSuccess from '../pages/subscription/PaymentSuccess';
import PaymentCancel from '../pages/subscription/PaymentCancel';

import HealthReport from '../pages/meal-plan/HealthReport';
import MealPlanPreview from '../pages/meal-plan/MealPlanPreview';
import MealPlanPage from '../pages/meal-plan/MealPlanPage';

// ── 2 trang chính mới ──
import DiscoverPage from '../pages/DiscoverPage/DiscoverPage';
import JournalPage from '../pages/JournalPage/JournalPage';
import Favorites from '../pages/food/Favorites';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ═══════════════════════════════════════════════
          MAIN APP - Protected routes với MainLayout
          ═══════════════════════════════════════════════ */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* ── TRANG 1: Discover (Tổng quan + Khám phá + Kế hoạch) ── */}
        <Route path="/home" element={<DiscoverPage />} />

        {/* Redirects từ routes cũ → đúng tab */}
        <Route path="/dashboard"        element={<Navigate to="/home?tab=overview" replace />} />
        <Route path="/meal-suggestions" element={<Navigate to="/home?tab=discover" replace />} />
        <Route path="/meal-suggestion"  element={<Navigate to="/home?tab=plan"     replace />} />
        <Route path="/favorites"        element={<Favorites />} />

        {/* ── TRANG 2: Journal (Nhật ký + Tra cứu nguyên liệu) ── */}
        <Route path="/journal" element={<JournalPage />} />

        {/* Redirects từ routes cũ → đúng tab */}
        <Route path="/nutrition"   element={<Navigate to="/journal?tab=diary"  replace />} />
        <Route path="/ingredients" element={<Navigate to="/journal?tab=lookup" replace />} />

        {/* ── Trang phụ trợ giữ nguyên ── */}
        <Route path="/subscription"         element={<SubscriptionPlans />} />
        <Route path="/subscription/payment" element={<Payment />} />
        <Route path="/payment/success"      element={<PaymentSuccess />} />
        <Route path="/payment/cancel"       element={<PaymentCancel />} />
        <Route path="/profile"              element={<Profile />} />
        <Route path="/recipe/:id"           element={<MealDetail />} />

        {/* Ingredient & Recipe forms (admin/power user) */}
        <Route path="/ingredients/new"      element={<IngredientForm />} />
        <Route path="/ingredients/:id"      element={<IngredientDetail />} />
        <Route path="/ingredients/:id/edit" element={<IngredientForm />} />
        <Route path="/recipes/new"          element={<RecipeForm />} />
        <Route path="/recipes/:id/edit"     element={<RecipeForm />} />
      </Route>

      {/* ── Protected routes without MainLayout (no sidebar) ── */}
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

      {/* ── Admin routes ── */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users"           element={<AdminUsers />} />
        <Route path="ingredient-tags" element={<AdminIngredientTags />} />
        <Route path="ingredients"     element={<AdminIngredients />} />
        <Route path="recipe-tags"     element={<AdminRecipeTags />} />
        <Route path="recipes"         element={<AdminRecipes />} />
        <Route path="categories"      element={<AdminCategories />} />
        <Route path="plans"           element={<AdminPlans />} />
        <Route path="statistics"      element={<AdminStatistics />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
