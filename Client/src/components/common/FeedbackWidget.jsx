import { useState, useRef } from 'react';
import { 
  FiMessageSquare, 
  FiX, 
  FiSend, 
  FiStar, 
  FiUploadCloud, 
  FiTrash2, 
  FiCheckCircle, 
  FiAlertCircle 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { feedbackService } from '../../services/feedbackService';
import api from '../../services/api';
import './FeedbackWidget.css';

const CATEGORIES = [
  { value: 0, label: 'Báo lỗi', icon: '🐞' },
  { value: 1, label: 'Góp ý', icon: '💡' },
  { value: 2, label: 'Dinh dưỡng', icon: '🥗' },
  { value: 3, label: 'Thanh toán', icon: '💳' },
  { value: 4, label: 'Khác', icon: '💬' },
];

export default function FeedbackWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState(1); // Default: Góp ý
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef(null);

  // Sync contact email if user changes
  const handleOpen = () => {
    if (!contactEmail && user?.email) {
      setContactEmail(user.email);
    }
    setIsSuccess(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa 5MB.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/Upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.url) {
        setAttachmentUrl(res.data.url);
        toast.success('Tải ảnh minh họa thành công!');
      } else {
        toast.error('Không nhận được đường dẫn ảnh.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tải ảnh lên.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setAttachmentUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề phản hồi.');
      return;
    }
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung chi tiết.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        category,
        rating,
        attachmentUrl: attachmentUrl || null,
        contactEmail: contactEmail.trim() || user?.email || null,
      };

      const res = await feedbackService.createFeedback(payload);
      if (res.data?.success) {
        setIsSuccess(true);
        setTitle('');
        setContent('');
        setAttachmentUrl('');
        setRating(5);
        setCategory(1);
        toast.success('Đã gửi phản hồi thành công!');
      } else {
        toast.error(res.data?.message || 'Có lỗi xảy ra khi gửi phản hồi.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi phản hồi lúc này.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── Trigger Floating Button ── */}
      <button
        type="button"
        className={`feedback-fab-btn ${isOpen ? 'active' : ''}`}
        onClick={isOpen ? handleClose : handleOpen}
        title="Góp ý & Báo lỗi"
        aria-label="Góp ý & Báo lỗi"
      >
        <span className="feedback-fab-icon">
          {isOpen ? <FiX size={22} /> : <FiMessageSquare size={22} />}
        </span>
        <span className="feedback-fab-text">Góp ý</span>
      </button>

      {/* ── Feedback Modal Popup ── */}
      {isOpen && (
        <div className="feedback-modal-overlay" onClick={handleClose}>
          <div 
            className="feedback-modal-card" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="feedback-modal-header">
              <div className="feedback-header-title-wrap">
                <div className="feedback-header-icon">
                  <FiMessageSquare size={20} />
                </div>
                <div>
                  <h3>Gửi ý kiến phản hồi</h3>
                  <p>Mọi góp ý của bạn giúp SmartMeal ngày một tốt hơn</p>
                </div>
              </div>
              <button 
                type="button" 
                className="feedback-modal-close" 
                onClick={handleClose}
                aria-label="Đóng"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Body */}
            {isSuccess ? (
              <div className="feedback-success-state">
                <div className="feedback-success-icon">
                  <FiCheckCircle size={56} />
                </div>
                <h4>Cảm ơn bạn đã đóng góp!</h4>
                <p>
                  Ý kiến của bạn đã được chuyển tới đội ngũ quản trị SmartMeal.
                  Câu trả lời sẽ được gửi trực tiếp về email <strong>{contactEmail || user?.email}</strong>.
                </p>
                <div className="feedback-success-actions">
                  <button 
                    type="button" 
                    className="feedback-btn-primary"
                    onClick={() => { setIsSuccess(false); handleClose(); }}
                  >
                    Hoàn tất
                  </button>
                  <button 
                    type="button" 
                    className="feedback-btn-ghost"
                    onClick={() => setIsSuccess(false)}
                  >
                    Gửi phản hồi khác
                  </button>
                </div>
              </div>
            ) : (
              <form className="feedback-form" onSubmit={handleSubmit}>
                {/* 1. Category chips */}
                <div className="feedback-form-group">
                  <label className="feedback-label">Chủ đề phản hồi</label>
                  <div className="feedback-categories-row">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        className={`feedback-category-chip ${category === cat.value ? 'selected' : ''}`}
                        onClick={() => setCategory(cat.value)}
                      >
                        <span className="cat-icon">{cat.icon}</span>
                        <span className="cat-label">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Rating stars */}
                <div className="feedback-form-group">
                  <label className="feedback-label">Mức độ hài lòng của bạn</label>
                  <div className="feedback-stars-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`feedback-star-btn ${
                          (hoverRating || rating) >= star ? 'filled' : ''
                        }`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        title={`${star} sao`}
                      >
                        <FiStar size={24} />
                      </button>
                    ))}
                    <span className="feedback-rating-hint">
                      {rating === 5 && 'Rất tuyệt vời!'}
                      {rating === 4 && 'Hài lòng'}
                      {rating === 3 && 'Bình thường'}
                      {rating === 2 && 'Cần cải thiện'}
                      {rating === 1 && 'Chưa hài lòng'}
                    </span>
                  </div>
                </div>

                {/* 3. Title */}
                <div className="feedback-form-group">
                  <label htmlFor="fb-title" className="feedback-label">
                    Tiêu đề <span className="req">*</span>
                  </label>
                  <input
                    id="fb-title"
                    type="text"
                    className="feedback-input"
                    placeholder="Tóm tắt ngắn gọn vấn đề hoặc ý tưởng..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    required
                  />
                </div>

                {/* 4. Content */}
                <div className="feedback-form-group">
                  <label htmlFor="fb-content" className="feedback-label">
                    Nội dung chi tiết <span className="req">*</span>
                  </label>
                  <textarea
                    id="fb-content"
                    className="feedback-textarea"
                    rows={4}
                    placeholder="Mô tả cụ thể trải nghiệm của bạn, các bước xảy ra lỗi hoặc đề xuất của bạn cho SmartMeal..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>

                {/* 5. Screenshot attachment */}
                <div className="feedback-form-group">
                  <label className="feedback-label">Ảnh minh họa (không bắt buộc)</label>
                  {attachmentUrl ? (
                    <div className="feedback-attachment-preview">
                      <img src={attachmentUrl} alt="Minh họa phản hồi" />
                      <button 
                        type="button" 
                        className="feedback-remove-image-btn"
                        onClick={handleRemoveImage}
                        title="Xóa ảnh"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="feedback-upload-box">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="feedback-file-input"
                        id="fb-image-upload"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      <label htmlFor="fb-image-upload" className="feedback-upload-label">
                        <FiUploadCloud size={20} />
                        <span>{isUploading ? 'Đang tải ảnh...' : 'Tải ảnh chụp màn hình (tối đa 5MB)'}</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* 6. Contact email notice */}
                <div className="feedback-form-group">
                  <label htmlFor="fb-email" className="feedback-label">
                    Email nhận phản hồi từ Admin
                  </label>
                  <input
                    id="fb-email"
                    type="email"
                    className="feedback-input"
                    placeholder="email@vidu.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                  <span className="feedback-email-hint">
                    <FiAlertCircle size={14} /> Admin sẽ gửi câu trả lời trực tiếp tới email này.
                  </span>
                </div>

                {/* Footer Buttons */}
                <div className="feedback-modal-footer">
                  <button
                    type="button"
                    className="feedback-btn-ghost"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="feedback-btn-primary"
                    disabled={isSubmitting || isUploading || !title.trim() || !content.trim()}
                  >
                    {isSubmitting ? (
                      <span className="feedback-btn-loading">
                        <span className="spinner-sm" /> Đang gửi...
                      </span>
                    ) : (
                      <>
                        <FiSend size={16} /> Gửi phản hồi
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
