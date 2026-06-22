import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import '../assets/styles/admin.css';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content-wrapper">
        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
