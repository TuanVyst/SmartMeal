import { useState, useEffect, useCallback } from 'react';
import { 
  FiMessageSquare, 
  FiClock, 
  FiCheckCircle, 
  FiSearch, 
  FiMail, 
  FiTrash2, 
  FiEye, 
  FiSend, 
  FiX, 
  FiStar, 
  FiExternalLink,
  FiFilter
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { feedbackService } from '../../services/feedbackService';
import { useDialog } from '../../context/DialogContext';
import './AdminFeedbacks.css';

const CATEGORY_MAP = {
  0: { label: 'Báo lỗi', className: 'badge-bug', icon: '🐞' },
  1: { label: 'Góp ý', className: 'badge-suggestion', icon: '💡' },
  2: { label: 'Dinh dưỡng', className: 'badge-nutrition', icon: '🥗' },
  3: { label: 'Thanh toán', className: 'badge-billing', icon: '💳' },
  4: { label: 'Khác', className: 'badge-other', icon: '💬' },
};

const STATUS_MAP = {
  0: { label: 'Chờ phản hồi', className: 'badge-pending' },
  1: { label: 'Đã phản hồi', className: 'badge-replied' },
  2: { label: 'Đã đóng', className: 'badge-closed' },
};

export default function AdminFeedbacks() {
  const dialog = useDialog();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState(''); // '' for all, 0, 1, 2
  const [categoryFilter, setCategoryFilter] = useState(''); // '' for all, 0..4
  const [searchTerm, setSearchTerm] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;

  // Selected feedback for Detail / Reply modal
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Fullscreen image preview modal
  const [previewImage, setPreviewImage] = useState(null);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageIndex,
        pageSize,
      };
      if (statusFilter !== '') params.status = Number(statusFilter);
      if (categoryFilter !== '') params.category = Number(categoryFilter);
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await feedbackService.getAdminFeedbacks(params);
      if (res.data?.success && res.data.data) {
        setFeedbacks(res.data.data.items || []);
        setTotalCount(res.data.data.totalCount || 0);
        setTotalPages(res.data.data.totalPages || 1);
      } else {
        setFeedbacks([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách phản hồi.');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, statusFilter, categoryFilter, searchTerm]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleOpenDetail = (item) => {
    setSelectedFeedback(item);
    setReplyText(item.adminReply || '');
  };

  const handleCloseDetail = () => {
    setSelectedFeedback(null);
    setReplyText('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Vui lòng nhập nội dung câu trả lời.');
      return;
    }

    setIsReplying(true);
    try {
      const res = await feedbackService.replyAdminFeedback(selectedFeedback.feedback_id, {
        adminReply: replyText.trim(),
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Đã gửi phản hồi và email thành công!');
        handleCloseDetail();
        fetchFeedbacks();
      } else {
        toast.error(res.data?.message || 'Có lỗi khi gửi phản hồi.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi phản hồi lúc này.');
    } finally {
      setIsReplying(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await dialog.confirm({
      title: 'Xóa phản hồi',
      message: 'Bạn có chắc chắn muốn xóa phản hồi này không?',
      confirmLabel: 'Xóa',
      danger: true,
    });

    if (!ok) return;

    try {
      const res = await feedbackService.deleteAdminFeedback(id);
      if (res.data?.success) {
        toast.success('Đã xóa phản hồi thành công.');
        if (selectedFeedback?.feedback_id === id) {
          handleCloseDetail();
        }
        fetchFeedbacks();
      } else {
        toast.error(res.data?.message || 'Lỗi khi xóa.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa phản hồi.');
    }
  };

  const pendingCount = feedbacks.filter((f) => f.status === 0).length;
  const repliedCount = feedbacks.filter((f) => f.status === 1).length;

  return (
    <div className="admin-page-content">
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div className="header-text">
          <h1>Quản lý phản hồi người dùng</h1>
          <p>Lắng nghe góp ý, xử lý báo lỗi và phản hồi trực tiếp qua email cho người dùng SmartMeal</p>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            <FiMessageSquare />
          </div>
          <div className="stat-info">
            <h3>{totalCount}</h3>
            <p>Tổng phản hồi</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <FiClock />
          </div>
          <div className="stat-info">
            <h3>{statusFilter === '0' ? totalCount : pendingCount}</h3>
            <p>Đang chờ phản hồi</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <FiCheckCircle />
          </div>
          <div className="stat-info">
            <h3>{statusFilter === '1' ? totalCount : repliedCount}</h3>
            <p>Đã gửi email trả lời</p>
          </div>
        </div>
      </div>

      {/* ── Table & Filters ── */}
      <div className="admin-table-container">
        {/* Toolbar */}
        <div className="admin-feedback-toolbar">
          {/* Status Tabs */}
          <div className="status-tabs-group">
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === '' ? 'active' : ''}`}
              onClick={() => { setStatusFilter(''); setPageIndex(1); }}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === '0' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('0'); setPageIndex(1); }}
            >
              Chờ phản hồi
            </button>
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === '1' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('1'); setPageIndex(1); }}
            >
              Đã phản hồi
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="filter-controls-group">
            <div className="category-select-wrap">
              <FiFilter size={14} className="filter-icon" />
              <select
                className="category-dropdown"
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPageIndex(1); }}
              >
                <option value="">Tất cả chủ đề</option>
                <option value="0">🐞 Báo lỗi</option>
                <option value="1">💡 Góp ý</option>
                <option value="2">🥗 Dinh dưỡng</option>
                <option value="3">💳 Thanh toán</option>
                <option value="4">💬 Khác</option>
              </select>
            </div>

            <div className="admin-search-wrap">
              <FiSearch className="search-icon" size={16} />
              <input
                type="text"
                className="admin-table-search"
                placeholder="Tìm tiêu đề, nội dung, email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPageIndex(1); }}
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="admin-loading-row">Đang tải dữ liệu phản hồi...</div>
        ) : feedbacks.length === 0 ? (
          <div className="admin-empty-state">
            <FiMessageSquare size={48} />
            <p>Không có phản hồi nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Thời gian</th>
                <th style={{ width: '190px' }}>Người gửi</th>
                <th style={{ width: '120px' }}>Chủ đề</th>
                <th style={{ width: '110px' }}>Đánh giá</th>
                <th>Tiêu đề & Nội dung</th>
                <th style={{ width: '130px' }}>Trạng thái</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((item) => {
                const cat = CATEGORY_MAP[item.category] || { label: 'Khác', className: 'badge-other', icon: '💬' };
                const st = STATUS_MAP[item.status] || { label: 'Chờ', className: 'badge-pending' };
                const formattedDate = new Date(item.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={item.feedback_id} className={item.status === 0 ? 'row-pending' : ''}>
                    <td>
                      <span className="feedback-time-text">{formattedDate}</span>
                    </td>
                    <td>
                      <div className="sender-info">
                        <strong className="sender-name">{item.userName || 'Người dùng'}</strong>
                        <span className="sender-email" title={item.contactEmail || item.userEmail}>
                          <FiMail size={12} /> {item.contactEmail || item.userEmail || 'Chưa có email'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`cat-badge ${cat.className}`}>
                        {cat.icon} {cat.label}
                      </span>
                    </td>
                    <td>
                      {item.rating ? (
                        <div className="rating-stars-badge" title={`${item.rating} sao`}>
                          <FiStar size={14} className="star-filled" />
                          <span>{item.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div className="feedback-content-cell">
                        <strong className="feedback-table-title">{item.title}</strong>
                        <p className="feedback-table-preview">{item.content}</p>
                        {item.attachmentUrl && (
                          <button
                            type="button"
                            className="preview-attachment-btn"
                            onClick={() => setPreviewImage(item.attachmentUrl)}
                          >
                            📷 Có ảnh đính kèm
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="table-actions-cell">
                        <button
                          type="button"
                          className="action-icon-btn action-view"
                          onClick={() => handleOpenDetail(item)}
                          title="Xem chi tiết & Trả lời"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn action-delete"
                          onClick={() => handleDelete(item.feedback_id)}
                          title="Xóa phản hồi"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-table-pagination">
            <span>
              Trang {pageIndex} / {totalPages} (Tổng {totalCount} phản hồi)
            </span>
            <div className="pagination-buttons">
              <button
                type="button"
                className="btn-page"
                disabled={pageIndex <= 1}
                onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
              >
                Trước
              </button>
              <button
                type="button"
                className="btn-page"
                disabled={pageIndex >= totalPages}
                onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail & Reply Modal ── */}
      {selectedFeedback && (
        <div className="admin-modal-overlay" onClick={handleCloseDetail}>
          <div 
            className="admin-modal-card admin-feedback-modal" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <div className="modal-title-with-badge">
                <h2>Chi tiết phản hồi</h2>
                <span className={`status-badge ${STATUS_MAP[selectedFeedback.status]?.className}`}>
                  {STATUS_MAP[selectedFeedback.status]?.label}
                </span>
              </div>
              <button type="button" className="admin-modal-close" onClick={handleCloseDetail}>
                <FiX size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* User and metadata row */}
              <div className="feedback-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">Người gửi</span>
                  <strong className="meta-value">{selectedFeedback.userName || 'Khách'}</strong>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Email nhận phản hồi</span>
                  <strong className="meta-value">
                    <FiMail size={14} /> {selectedFeedback.contactEmail || selectedFeedback.userEmail || 'Chưa cung cấp'}
                  </strong>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Chủ đề</span>
                  <span className={`cat-badge ${CATEGORY_MAP[selectedFeedback.category]?.className}`}>
                    {CATEGORY_MAP[selectedFeedback.category]?.icon} {CATEGORY_MAP[selectedFeedback.category]?.label}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Đánh giá</span>
                  <strong className="meta-value">
                    {selectedFeedback.rating ? `${selectedFeedback.rating}/5 sao` : 'Không đánh giá'}
                  </strong>
                </div>
              </div>

              {/* Title & Content */}
              <div className="feedback-detail-box">
                <h4 className="detail-title">{selectedFeedback.title}</h4>
                <div className="detail-content-text">{selectedFeedback.content}</div>

                {selectedFeedback.attachmentUrl && (
                  <div className="detail-attachment-box">
                    <span className="meta-label">Ảnh chụp màn hình:</span>
                    <div 
                      className="detail-attachment-img-wrap"
                      onClick={() => setPreviewImage(selectedFeedback.attachmentUrl)}
                      title="Nhấn để xem ảnh phóng to"
                    >
                      <img src={selectedFeedback.attachmentUrl} alt="Đính kèm" />
                      <div className="zoom-hint">
                        <FiExternalLink size={14} /> Xem kích thước đầy đủ
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Reply if already replied */}
              {selectedFeedback.adminReply && (
                <div className="previous-reply-box">
                  <div className="previous-reply-header">
                    <span>
                      <FiCheckCircle size={14} /> Đã gửi phản hồi vào{' '}
                      {new Date(selectedFeedback.repliedAt).toLocaleString('vi-VN')}
                    </span>
                    {selectedFeedback.repliedByName && (
                      <span className="replied-by-badge">Người duyệt: {selectedFeedback.repliedByName}</span>
                    )}
                  </div>
                  <p className="previous-reply-body">{selectedFeedback.adminReply}</p>
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="reply-form-section">
                <label className="reply-form-label">
                  {selectedFeedback.adminReply ? 'Cập nhật lại câu trả lời và gửi email mới:' : 'Soạn câu trả lời gửi cho người dùng:'}
                </label>
                <textarea
                  className="reply-textarea"
                  rows={5}
                  placeholder="Nhập nội dung giải đáp, hướng dẫn khắc phục hoặc lời cảm ơn gửi tới người dùng..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                />
                <div className="feedback-modal-footer">
                  <button 
                    type="button" 
                    className="btn-feedback-close" 
                    onClick={handleCloseDetail} 
                    disabled={isReplying}
                  >
                    Đóng
                  </button>
                  <button 
                    type="submit" 
                    className="btn-feedback-send" 
                    disabled={isReplying || !replyText.trim() || !(selectedFeedback.contactEmail || selectedFeedback.userEmail)}
                  >
                    {isReplying ? (
                      <span className="loading-spinner-wrap">
                        <span className="spinner-sm" /> Đang gửi email...
                      </span>
                    ) : (
                      <>
                        <FiSend size={16} /> Gửi câu trả lời qua Email
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Fullscreen Preview Modal ── */}
      {previewImage && (
        <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
          <div className="image-preview-card" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="image-preview-close" 
              onClick={() => setPreviewImage(null)}
            >
              <FiX size={24} />
            </button>
            <img src={previewImage} alt="Ảnh phóng to" className="image-preview-img" />
          </div>
        </div>
      )}
    </div>
  );
}
