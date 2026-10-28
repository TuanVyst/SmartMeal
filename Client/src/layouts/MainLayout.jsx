import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import FeedbackWidget from '../components/common/FeedbackWidget';
import './MainLayout.css';

export default function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    const mainEl = document.querySelector('.main-page-content');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content-wrapper">
        <Header />
        <main className="main-page-content">
          <Outlet />
        </main>
        <FeedbackWidget />
      </div>
    </div>
  );
}
