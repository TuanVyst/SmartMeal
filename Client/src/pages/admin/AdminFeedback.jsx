import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';

export default function AdminFeedback() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [feedbacks] = useState([
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', subject: 'Great App!', message: 'I love the meal recommendations. The recipes are easy to follow and delicious.', date: '2026-06-15' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', subject: 'Feature Request', message: 'Would be great to have a shopping list export feature.', date: '2026-06-14' },
    { id: 3, name: 'Carol Williams', email: 'carol@example.com', subject: 'Bug Report', message: 'The search function is not working properly on mobile devices.', date: '2026-06-13' },
    { id: 4, name: 'David Brown', email: 'david@example.com', subject: 'Great Experience', message: 'I have been using SmartMeal for a month now and I love it!', date: '2026-06-12' },
  ]);

  const filtered = feedbacks.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.subject.toLowerCase().includes(search.toLowerCase())
  );

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
                key={f.id}
                className="feedback-card"
                onClick={() => navigate(`/admin/feedback/${f.id}`)}
              >
                <div className="feedback-card-body">
                  <h3>{f.subject}</h3>
                  <p className="feedback-email">{f.name} &lt;{f.email}&gt;</p>
                  <p className="feedback-preview">{f.message}</p>
                </div>
                <div className="feedback-card-date">{f.date}</div>
                <button
                  className="action-btn view"
                  onClick={(e) => { e.stopPropagation(); navigate(`/admin/feedback/${f.id}`); }}
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
