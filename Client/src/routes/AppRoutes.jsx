import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import IngredientList from '../pages/food/IngredientList';
import IngredientDetail from '../pages/food/IngredientDetail';
import IngredientForm from '../pages/food/IngredientForm';

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
        <Route path="/ingredients" element={<IngredientList />} />
        <Route path="/ingredients/new" element={<IngredientForm />} />
        <Route path="/ingredients/:id" element={<IngredientDetail />} />
        <Route path="/ingredients/:id/edit" element={<IngredientForm />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
