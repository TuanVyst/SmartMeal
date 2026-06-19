import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'Admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Bảng điều khiển</h2>
      </div>
      <p>Chào mừng đến với SmartMeal!</p>
    </div>
  );
}
