import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUsers, 
  FiTag, 
  FiShoppingBag, 
  FiAward, 
  FiHeart, 
  FiClock, 
  FiActivity, 
  FiUserPlus, 
  FiTrendingUp, 
  FiTrendingDown,
  FiCalendar,
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { adminService } from '../../services/adminService';

export default function AdminDashboard() {
  const [systemStats, setSystemStats] = useState(null);
  const [engagementStats, setEngagementStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEngagementLoading, setIsEngagementLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeChartTab, setActiveChartTab] = useState('visits'); // 'visits' | 'duration' | 'newAccounts'
  const dateInputRef = useRef(null);

  useEffect(() => {
    Promise.allSettled([
      adminService.getDashboardStats(),
      adminService.getWeeklyEngagementStats(),
    ])
      .then(([sysRes, engRes]) => {
        if (sysRes.status === 'fulfilled') {
          setSystemStats(sysRes.value);
        } else {
          setSystemStats({ totalUsers: 0, totalRecipes: 0, totalCategories: 0, totalIngredients: 0, totalTags: 0 });
        }

        if (engRes.status === 'fulfilled' && engRes.value) {
          setEngagementStats(engRes.value);
          const sel = engRes.value.thisWeek?.selectedDate || engRes.value.ThisWeek?.SelectedDate;
          if (sel) {
            setSelectedDate(sel);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const loadEngagement = async (targetDate) => {
    setIsEngagementLoading(true);
    try {
      const data = await adminService.getWeeklyEngagementStats(targetDate);
      if (data) {
        setEngagementStats(data);
        const sel = data.thisWeek?.selectedDate || data.ThisWeek?.SelectedDate;
        if (sel) {
          setSelectedDate(sel);
        }
      }
    } catch (err) {
      console.error('Error fetching weekly engagement stats:', err);
    } finally {
      setIsEngagementLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const dateVal = e.target.value;
    setSelectedDate(dateVal);
    if (dateVal) {
      loadEngagement(dateVal);
    }
  };

  const handleOpenPicker = () => {
    if (isEngagementLoading) return;
    try {
      if (dateInputRef.current?.showPicker) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current?.focus();
      }
    } catch (err) {
      console.error('showPicker error:', err);
    }
  };

  if (loading) return <div className="admin-loading">Đang tải bảng điều khiển...</div>;

  const resourceCards = [
    { label: 'Tổng người dùng', value: systemStats?.totalUsers || 0, icon: <FiUsers />, color: 'green', to: '/admin/users' },
    { label: 'Tổng công thức', value: systemStats?.totalRecipes || 0, icon: <FiHeart />, color: 'blue', to: '/admin/recipes' },
    { label: 'Danh mục nguyên liệu', value: systemStats?.totalCategories || 0, icon: <FiTag />, color: 'orange', to: '/admin/categories' },
    { label: 'Nguyên liệu', value: systemStats?.totalIngredients || 0, icon: <FiShoppingBag />, color: 'teal', to: '/admin/ingredients' },
    { label: 'Thẻ công thức', value: systemStats?.totalTags || 0, icon: <FiAward />, color: 'red', to: '/admin/recipe-tags' },
  ];

  const thisWeek = engagementStats?.thisWeek || engagementStats?.ThisWeek || {};
  const lastWeek = engagementStats?.lastWeek || engagementStats?.LastWeek || {};
  const growth = engagementStats?.growth || engagementStats?.Growth || {};
  const dailyStats = engagementStats?.DailyStats || engagementStats?.dailyStats || [];

  const isCurrentWeek = Boolean(thisWeek.isCurrentWeek ?? thisWeek.IsCurrentWeek ?? true);
  const previousWeekDate = thisWeek.previousWeekDate ?? thisWeek.PreviousWeekDate;
  const nextWeekDate = thisWeek.nextWeekDate ?? thisWeek.NextWeekDate;
  const startDate = thisWeek.startDate ?? thisWeek.StartDate;
  const endDate = thisWeek.endDate ?? thisWeek.EndDate;

  // Helper to render growth indicator badge
  const renderGrowthBadge = (growthPercent) => {
    if (growthPercent === undefined || growthPercent === null) return null;
    const isPos = growthPercent > 0;
    const isNeg = growthPercent < 0;
    const cls = isPos ? 'positive' : isNeg ? 'negative' : 'neutral';
    const Icon = isPos ? FiTrendingUp : isNeg ? FiTrendingDown : null;

    return (
      <span className={`growth-badge ${cls}`}>
        {Icon && <Icon size={12} />}
        {isPos ? `+${growthPercent}%` : `${growthPercent}%`} so với tuần trước
      </span>
    );
  };

  // Determine max value for chart scaling
  const getChartMetricValue = (day) => {
    if (activeChartTab === 'visits') return day.visits || 0;
    if (activeChartTab === 'duration') return day.avgDurationMinutes || 0;
    if (activeChartTab === 'newAccounts') return day.newAccounts || 0;
    return 0;
  };

  const chartMaxVal = Math.max(...dailyStats.map(getChartMetricValue), 1);

  const getMetricUnit = () => {
    if (activeChartTab === 'visits') return 'lượt';
    if (activeChartTab === 'duration') return 'phút';
    if (activeChartTab === 'newAccounts') return 'tài khoản';
    return '';
  };

  return (
    <div className="admin-page-content">
      {/* ══════════════════════════════════════════════════════
          CHỈ SỐ HOẠT ĐỘNG NGƯỜI DÙNG TRONG TUẦN
         ══════════════════════════════════════════════════════ */}
      <div className="engagement-section">
        <div className="section-title-wrap">
          <h2 className="section-title">
            <FiActivity size={20} color="#059669" /> HOẠT ĐỘNG NGƯỜI DÙNG TRONG TUẦN
          </h2>

          {/* Unified Week Selector: < [ Date Range  Tuần này ] > */}
          <div className="week-selector-wrapper">
            <button 
              type="button" 
              className="week-arrow-btn"
              onClick={() => previousWeekDate && loadEngagement(previousWeekDate)}
              title="Xem tuần trước"
              disabled={isEngagementLoading || !previousWeekDate}
            >
              <FiChevronLeft size={18} />
            </button>

            <div 
              className="week-picker-box"
              onClick={handleOpenPicker}
              title="Nhấn để chọn tuần qua lịch"
            >
              <FiCalendar size={15} color="#059669" className="week-cal-icon" />
              <span className="week-range-text">
                {startDate && endDate ? `${startDate} – ${endDate}` : 'Đang tải...'}
              </span>

              {isCurrentWeek ? (
                <span className="current-week-tag">Tuần này</span>
              ) : (
                <button
                  type="button"
                  className="jump-today-tag"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadEngagement('');
                  }}
                  title="Quay lại tuần hiện tại"
                >
                  Về tuần này
                </button>
              )}

              {/* Native Date Input triggered by clicking the box */}
              <input 
                ref={dateInputRef}
                type="date" 
                className="hidden-date-input"
                value={selectedDate}
                onChange={handleDateChange}
                disabled={isEngagementLoading}
                tabIndex={-1}
                aria-label="Chọn ngày trong tuần"
              />
            </div>

            {/* Ẩn nút qua tuần sau khi đang ở tuần hiện tại */}
            {!isCurrentWeek && (
              <button 
                type="button" 
                className="week-arrow-btn"
                onClick={() => nextWeekDate && loadEngagement(nextWeekDate)}
                title="Xem tuần tiếp theo"
                disabled={isEngagementLoading || !nextWeekDate}
              >
                <FiChevronRight size={18} />
              </button>
            )}
          </div>
        </div>

        {/* 3 Metric Cards with Loading State */}
        <div className={`engagement-grid ${isEngagementLoading ? 'engagement-content-loading' : ''}`}>
          {/* Card 1: Thời gian sử dụng trung bình trong tuần */}
          <div className="engagement-card">
            <div>
              <div className="engagement-card-header">
                <span className="engagement-card-title">Thời gian sử dụng TB</span>
                <div className="engagement-icon indigo">
                  <FiClock />
                </div>
              </div>
              <div className="engagement-value">
                {thisWeek.avgDurationMinutes ?? 0} <span style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>phút / phiên</span>
              </div>
            </div>
            <div className="engagement-card-footer">
              <span>Tổng: <strong>{thisWeek.totalDurationHours ?? 0} giờ</strong> tuần này</span>
              {renderGrowthBadge(growth.avgDuration)}
            </div>
          </div>

          {/* Card 2: Số lần truy cập mỗi tuần của người dùng */}
          <div className="engagement-card">
            <div>
              <div className="engagement-card-header">
                <span className="engagement-card-title">Số lần truy cập trong tuần</span>
                <div className="engagement-icon emerald">
                  <FiActivity />
                </div>
              </div>
              <div className="engagement-value">
                {(thisWeek.totalVisits ?? 0).toLocaleString('vi-VN')} <span style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>lượt</span>
              </div>
            </div>
            <div className="engagement-card-footer">
              <span>TB: <strong>~{thisWeek.avgVisitsPerUser ?? 0}</strong> lượt / người ({thisWeek.activeUsers ?? 0} active)</span>
              {renderGrowthBadge(growth.visits)}
            </div>
          </div>

          {/* Card 3: Số lượng tài khoản mới đăng ký trong tuần */}
          <div className="engagement-card">
            <div>
              <div className="engagement-card-header">
                <span className="engagement-card-title">Tài khoản mới trong tuần</span>
                <div className="engagement-icon teal">
                  <FiUserPlus />
                </div>
              </div>
              <div className="engagement-value">
                +{thisWeek.newAccounts ?? 0} <span style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>tài khoản</span>
              </div>
            </div>
            <div className="engagement-card-footer">
              <span>Tuần trước: <strong>{lastWeek.newAccounts ?? 0}</strong> tài khoản</span>
              {renderGrowthBadge(growth.newAccounts)}
            </div>
          </div>
        </div>

        {/* 7-Day Interactive Weekly Chart */}
        {dailyStats.length > 0 && (
          <div className={`weekly-chart-card ${isEngagementLoading ? 'engagement-content-loading' : ''}`}>
            <div className="chart-toolbar">
              <div className="chart-title">
                <h3><FiBarChart2 style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Biểu đồ tuần {thisWeek.startDate} – {thisWeek.endDate} (Thứ 2 – Chủ Nhật)</h3>
                <p>Xem chi tiết biến động theo từng ngày trong tuần được chọn</p>
              </div>
              <div className="chart-tab-group">
                <button
                  type="button"
                  className={`chart-tab-btn ${activeChartTab === 'visits' ? 'active' : ''}`}
                  onClick={() => setActiveChartTab('visits')}
                >
                  Lượt truy cập
                </button>
                <button
                  type="button"
                  className={`chart-tab-btn ${activeChartTab === 'duration' ? 'active' : ''}`}
                  onClick={() => setActiveChartTab('duration')}
                >
                  Thời gian sử dụng
                </button>
                <button
                  type="button"
                  className={`chart-tab-btn ${activeChartTab === 'newAccounts' ? 'active' : ''}`}
                  onClick={() => setActiveChartTab('newAccounts')}
                >
                  Tài khoản mới
                </button>
              </div>
            </div>

            <div className="chart-canvas">
              {dailyStats.map((day, idx) => {
                const val = getChartMetricValue(day);
                const heightPct = Math.max(Math.round((val / chartMaxVal) * 100), val > 0 ? 8 : 3);

                return (
                  <div className="chart-day-col" key={idx}>
                    <div className="chart-bar-wrap">
                      <div
                        className={`chart-bar-fill ${activeChartTab} ${day.isToday ? 'is-today' : ''} ${day.isFuture ? 'is-future' : ''}`}
                        style={{ height: `${heightPct}%` }}
                        title={`${day.dayName} (${day.date}): ${val} ${getMetricUnit()}`}
                      >
                        {!day.isFuture && (
                          <span className="chart-bar-val-top">
                            {val}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="chart-day-footer">
                      <span className="chart-day-name">{day.dayName}</span>
                      <span className="chart-day-date">{day.date}</span>
                      {day.isToday && <span className="chart-today-tag">Hôm nay</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          TỔNG QUAN TÀI NGUYÊN HỆ THỐNG
         ══════════════════════════════════════════════════════ */}
      <div className="section-title-wrap">
        <h2 className="section-title">
          <FiTag size={20} color="#3b82f6" /> Tổng quan dữ liệu hệ thống
        </h2>
      </div>

      <div className="stats-grid">
        {resourceCards.map((card) => (
          <Link className="stat-card" key={card.label} to={card.to}>
            <div className={`stat-icon ${card.color}`}>{card.icon}</div>
            <div className="stat-info">
              <h3>{card.value}</h3>
              <p>{card.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
