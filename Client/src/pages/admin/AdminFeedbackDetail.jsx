import { useParams, Link } from 'react-router-dom';

const mockFeedbacks = {
  1: { id: 1, name: 'Alice Johnson', email: 'alice@example.com', subject: 'Great App!', message: 'I love the meal recommendations. The recipes are easy to follow and delicious. I have recommended this app to all my friends!', date: '2026-06-15' },
  2: { id: 2, name: 'Bob Smith', email: 'bob@example.com', subject: 'Feature Request', message: 'Would be great to have a shopping list export feature. I often go grocery shopping and would love to have a printed list.', date: '2026-06-14' },
  3: { id: 3, name: 'Carol Williams', email: 'carol@example.com', subject: 'Bug Report', message: 'The search function is not working properly on mobile devices. When I type in the search bar on my phone, the results do not update.', date: '2026-06-13' },
  4: { id: 4, name: 'David Brown', email: 'david@example.com', subject: 'Great Experience', message: 'I have been using SmartMeal for a month now and I love it! The meal planning feature has saved me so much time.', date: '2026-06-12' },
};

export default function AdminFeedbackDetail() {
  const { id } = useParams();
  const feedback = mockFeedbacks[Number(id)];

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
          <h1>{feedback.subject}</h1>
          <div className="feedback-detail-meta">
            <span><strong>From:</strong> {feedback.name}</span>
            <span><strong>Email:</strong> {feedback.email}</span>
            <span><strong>Date:</strong> {feedback.date}</span>
          </div>
        </div>
        <div className="feedback-detail-body">
          {feedback.message}
        </div>
      </div>
    </div>
  );
}
