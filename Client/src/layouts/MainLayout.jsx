import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content-wrapper">
        <Header />
        <main className="main-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
