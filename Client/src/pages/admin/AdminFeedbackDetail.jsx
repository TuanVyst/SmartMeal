import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';

export default function AdminFeedbackDetail() {
  const { id } = useParams();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getFeedbackDetail(id)
      .then(data => setFeedback(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="admin-loading">Đang tải chi tiết phản hồi...</div>;

  if (!feedback) {
    return (
      <div>
        <Link to="/admin/feedback" className="back-link">&larr; Back to Feedback</Link>
        <div className="empty-state"><p>Feedback not found</p></div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/feedback" className="back-link">&larr; Back to Feedback</Link>
      <div className="feedback-detail">
        <div className="feedback-detail-header">
          <h1>{feedback.subject || 'No Subject'}</h1>
          <div className="feedback-detail-meta">
            <span><strong>From:</strong> {feedback.name}</span>
            <span><strong>Email:</strong> {feedback.email}</span>
            <span><strong>Date:</strong> {new Date(feedback.date || feedback.created_at || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="feedback-detail-body">
          {feedback.message}
        </div>
      </div>
    </div>
  );
}
