import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';

export default function AdminFeedback() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [feedbacks] = useState([
    { id: 1, name: 'Nguyễn Văn An', email: 'an@example.com', subject: 'Ứng dụng tuyệt vời!', message: 'Tôi yêu thích các gợi ý món ăn. Công thức dễ làm và rất ngon.', date: '2026-06-15' },
    { id: 2, name: 'Trần Thị Bích', email: 'bich@example.com', subject: 'Yêu cầu tính năng', message: 'Sẽ rất tuyệt nếu có tính năng xuất danh sách mua sắm.', date: '2026-06-14' },
    { id: 3, name: 'Lê Văn Cường', email: 'cuong@example.com', subject: 'Báo lỗi', message: 'Chức năng tìm kiếm không hoạt động đúng trên thiết bị di động.', date: '2026-06-13' },
    { id: 4, name: 'Phạm Thị Dung', email: 'dung@example.com', subject: 'Trải nghiệm tuyệt vời', message: 'Tôi đã sử dụng SmartMeal được một tháng và rất yêu thích!', date: '2026-06-12' },
  ]);

  const filtered = feedbacks.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="admin-page-header">
        <h1>Quản lý phản hồi</h1>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>Tất cả phản hồi</h2>
          <input
            className="admin-table-search"
            placeholder="Tìm kiếm phản hồi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state"><p>Không tìm thấy phản hồi</p></div>
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
