import { useParams, Link } from 'react-router-dom';

const mockFeedbacks = {
  1: { id: 1, name: 'Nguyễn Văn An', email: 'an@example.com', subject: 'Ứng dụng tuyệt vời!', message: 'Tôi yêu thích các gợi ý món ăn. Công thức dễ làm và rất ngon. Tôi đã giới thiệu ứng dụng này cho tất cả bạn bè!', date: '2026-06-15' },
  2: { id: 2, name: 'Trần Thị Bích', email: 'bich@example.com', subject: 'Yêu cầu tính năng', message: 'Sẽ rất tuyệt nếu có tính năng xuất danh sách mua sắm. Tôi thường đi chợ và muốn có danh sách in sẵn.', date: '2026-06-14' },
  3: { id: 3, name: 'Lê Văn Cường', email: 'cuong@example.com', subject: 'Báo lỗi', message: 'Chức năng tìm kiếm không hoạt động đúng trên thiết bị di động. Khi tôi gõ vào thanh tìm kiếm trên điện thoại, kết quả không cập nhật.', date: '2026-06-13' },
  4: { id: 4, name: 'Phạm Thị Dung', email: 'dung@example.com', subject: 'Trải nghiệm tuyệt vời', message: 'Tôi đã sử dụng SmartMeal được một tháng và rất yêu thích! Tính năng lập kế hoạch bữa ăn đã tiết kiệm rất nhiều thời gian cho tôi.', date: '2026-06-12' },
};

export default function AdminFeedbackDetail() {
  const { id } = useParams();
  const feedback = mockFeedbacks[Number(id)];

  if (!feedback) {
    return (
      <div>
        <Link to="/admin/feedback" className="back-link">&larr; Quay lại phản hồi</Link>
        <div className="empty-state"><p>Không tìm thấy phản hồi</p></div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/feedback" className="back-link">&larr; Quay lại phản hồi</Link>
      <div className="feedback-detail">
        <div className="feedback-detail-header">
          <h1>{feedback.subject}</h1>
          <div className="feedback-detail-meta">
            <span><strong>Từ:</strong> {feedback.name}</span>
            <span><strong>Email:</strong> {feedback.email}</span>
            <span><strong>Ngày:</strong> {feedback.date}</span>
          </div>
        </div>
        <div className="feedback-detail-body">
          {feedback.message}
        </div>
      </div>
    </div>
  );
}
