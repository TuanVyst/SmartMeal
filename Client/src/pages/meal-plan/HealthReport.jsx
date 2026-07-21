import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/layout/Header';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
    color: '#1E293B',
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '32px 24px',
  },
  title: {
    fontSize: 32,
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: 32,
    color: '#16a34a',
    letterSpacing: '-0.5px',
  },
  card: {
    background: 'white',
    borderRadius: 20,
    border: '1px solid #e2e8f0',
    padding: 32,
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    marginBottom: 24,
  },
  metricCard: {
    background: '#f8fafc',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    padding: 24,
  },
  metricTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#16a34a',
    marginBottom: 16,
  },
  bigNum: {
    fontSize: 44,
    fontWeight: 800,
    color: '#1E293B',
    display: 'inline',
  },
  bigLabel: {
    fontSize: 18,
    color: '#64748b',
    marginLeft: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    background: '#e2e8f0',
    borderRadius: 99,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: (pct) => ({
    height: '100%',
    width: `${Math.min(pct, 100)}%`,
    background: 'linear-gradient(90deg, #22c55e, #4ade80)',
    borderRadius: 99,
  }),
  macroGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 12,
    marginTop: 16,
  },
  macroItem: (color) => ({
    background: '#f8fafc',
    borderRadius: 12,
    border: `1px solid ${color}33`,
    padding: '12px 8px',
    textAlign: 'center',
  }),
  macroLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  macroValue: (color) => ({
    fontSize: 18,
    fontWeight: 700,
    color,
  }),
  infoBox: (bgColor, borderColor) => ({
    background: bgColor,
    borderRadius: 14,
    border: `1px solid ${borderColor}`,
    padding: 16,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 12,
  }),
  infoEmoji: {
    fontSize: 24,
    flexShrink: 0,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 1.7,
  },
  ctaSection: {
    textAlign: 'center',
    marginTop: 36,
  },
  ctaBtn: {
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: 'white',
    fontWeight: 700,
    fontSize: 17,
    padding: '16px 48px',
    borderRadius: 99,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 0 30px rgba(34,197,94,0.4)',
    transition: 'all 0.3s',
  },
  smallText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  loadingBox: {
    minHeight: '100vh',
    background: '#f0fdf4',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  spinner: {
    width: 56,
    height: 56,
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #22c55e',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

const HealthReport = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get('/HealthReport');
        setReport(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching health report:', err);
        setError(err?.message || 'Không thể lấy dữ liệu sức khỏe.');
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={styles.spinner} />
        <p style={{ color: '#16a34a', fontWeight: 600 }}>Đang tải dữ liệu sức khỏe...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={styles.loadingBox}>
        <p style={{ color: '#ef4444', fontSize: 16 }}>⚠️ {error || 'Không tìm thấy dữ liệu sức khỏe.'}</p>
        <button
          onClick={() => navigate('/health-survey')}
          style={{ ...styles.ctaBtn, marginTop: 16 }}
        >
          Làm bài khảo sát ngay
        </button>
      </div>
    );
  }

  const bmiPct = (report.bmi / 40) * 100;

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Header />
      <div style={styles.container}>
        <h1 style={styles.title}>📋 Báo Cáo Sức Khỏe Của Bạn</h1>

        <div style={styles.card}>
          <div style={styles.grid2}>
            {/* BMI */}
            <div style={styles.metricCard}>
              <div style={styles.metricTitle}>Chỉ Số Cơ Thể (BMI)</div>
              <div>
                <span style={styles.bigNum}>{report.bmi}</span>
                <span style={styles.bigLabel}>{report.bmiCategory}</span>
              </div>
              <div style={styles.progressBar}>
                <div style={styles.progressFill(bmiPct)} />
              </div>
              <p style={styles.smallText}>Cân nặng hiện tại: <strong style={{ color: '#1E293B' }}>{report.currentWeight} kg</strong></p>
              {report.targetWeight > 0 && (
                <p style={styles.smallText}>Mục tiêu: <strong style={{ color: '#16a34a' }}>{report.targetWeight} kg</strong></p>
              )}
            </div>

            {/* Calories */}
            <div style={styles.metricCard}>
              <div style={styles.metricTitle}>Mục Tiêu Dinh Dưỡng Mỗi Ngày</div>
              <div>
                <span style={styles.bigNum}>{Math.round(report.dailyCalories)}</span>
                <span style={styles.bigLabel}>kcal</span>
              </div>
              <div style={styles.macroGrid}>
                <div style={styles.macroItem('#60a5fa')}>
                  <div style={styles.macroLabel}>Protein</div>
                  <div style={styles.macroValue('#60a5fa')}>{Math.round(report.dailyProtein)}g</div>
                </div>
                <div style={styles.macroItem('#facc15')}>
                  <div style={styles.macroLabel}>Carbs</div>
                  <div style={styles.macroValue('#facc15')}>{Math.round(report.dailyCarbs)}g</div>
                </div>
                <div style={styles.macroItem('#f87171')}>
                  <div style={styles.macroLabel}>Fat</div>
                  <div style={styles.macroValue('#f87171')}>{Math.round(report.dailyFat)}g</div>
                </div>
              </div>
            </div>
          </div>

          {/* Explanations */}
          <div style={styles.infoBox('rgba(34,197,94,0.1)', 'rgba(34,197,94,0.25)')}>
            <span style={styles.infoEmoji}>📊</span>
            <p style={styles.infoText}>{report.calorieExplanation}</p>
          </div>
          <div style={styles.infoBox('rgba(59,130,246,0.1)', 'rgba(59,130,246,0.25)')}>
            <span style={styles.infoEmoji}>🗓️</span>
            <p style={styles.infoText}>{report.timelineExplanation}</p>
          </div>
          <div style={styles.infoBox('rgba(234,179,8,0.1)', 'rgba(234,179,8,0.25)')}>
            <span style={styles.infoEmoji}>💡</span>
            <p style={styles.infoText}>{report.generalAdvice}</p>
          </div>

          <div style={styles.ctaSection}>
            <button
              style={styles.ctaBtn}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              onClick={() => navigate('/meal-plan/preview')}
            >
              Tạo Thực Đơn Cho Tôi →
            </button>
            <p style={{ ...styles.smallText, marginTop: 12 }}>
              Hệ thống sẽ tạo thực đơn cá nhân dựa trên chỉ số của bạn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthReport;
