import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import { formatDateVi } from '../../utils/dateTime';

export default function AdminFeedback() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getFeedbackList()
      .then(data => setFeedbacks(data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = feedbacks.filter((f) =>
    (f.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.subject || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Đang tải phản hồi...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Feedback Management</h1>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>All Feedback</h2>
          <input
            className="admin-table-search"
            placeholder="Search feedback..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No feedback found</p></div>
        ) : (
          <div className="feedback-list" style={{ padding: 16 }}>
            {filtered.map((f) => (
              <div
                key={f.feedback_id || f.id}
                className="feedback-card"
                onClick={() => navigate(`/admin/feedback/${f.feedback_id || f.id}`)}
              >
                <div className="feedback-card-body">
                  <h3>{f.subject || 'No Subject'}</h3>
                  <p className="feedback-email">{f.name} &lt;{f.email}&gt;</p>
                  <p className="feedback-preview">{f.message}</p>
                </div>
                <div className="feedback-card-date">{formatDateVi(f.date || f.created_at || Date.now())}</div>
                <button
                  className="action-btn view"
                  onClick={(e) => { e.stopPropagation(); navigate(`/admin/feedback/${f.feedback_id || f.id}`); }}
                >
                  <FiEye size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
