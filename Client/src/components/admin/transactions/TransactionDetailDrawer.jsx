import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiShield,
  FiX,
} from 'react-icons/fi';
import { adminService } from '../../../services/adminService';
import {
  CopyButton,
  EvidenceBadge,
  TransactionSourceBadge,
  TransactionStatusBadge,
} from './TransactionBadges';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDuration,
  formatPlanTier,
  maskAccountNumber,
} from './transactionFormat';

function displayValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  return value;
}

function DetailItem({ label, value, children, mono = false }) {
  const hasChildren = children !== undefined && children !== null;
  return (
    <div className="txn-detail-item">
      <span className="txn-detail-label">{label}</span>
      <span className={`txn-detail-value ${mono ? 'txn-mono' : ''}`.trim()}>
        {hasChildren ? children : displayValue(value)}
      </span>
    </div>
  );
}

function TimelineItem({ label, value, isLast, filled }) {
  return (
    <div className="txn-timeline-item">
      <div className="txn-timeline-rail" aria-hidden="true">
        <span className={`txn-timeline-dot ${filled ? 'filled' : ''}`} />
        {!isLast && <span className="txn-timeline-line" />}
      </div>
      <div className="txn-timeline-content">
        <span className="txn-timeline-label">{label}</span>
        <span className={`txn-timeline-value ${filled ? '' : 'txn-muted'}`.trim()}>{value}</span>
      </div>
    </div>
  );
}

export default function TransactionDetailDrawer({ subId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [verify, setVerify] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(true);
  const [verifyError, setVerifyError] = useState('');

  const [showFullAccounts, setShowFullAccounts] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);

  const runVerify = useCallback(async () => {
    if (!subId) return;
    await Promise.resolve();
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const result = await adminService.verifyPayOsTransaction(subId);
      setVerify(result);
    } catch (err) {
      setVerify(null);
      setVerifyError(err?.message || 'Không thể kết nối PayOS để đối chiếu.');
    } finally {
      setVerifyLoading(false);
    }
  }, [subId]);

  // Load detail whenever the selected transaction changes.
  useEffect(() => {
    if (!subId) return undefined;
    let alive = true;

    adminService
      .getAdminTransactionDetail(subId)
      .then((result) => {
        if (alive) setDetail(result);
      })
      .catch((err) => {
        if (alive) setError(err?.message || 'Không thể tải chi tiết giao dịch.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [subId, reloadKey]);

  useEffect(() => {
    if (!subId) return undefined;
    // Wait for the detail payload: admin grants have no PayOS link to verify.
    if (!detail) return undefined;
    if (detail.isAdminGrant) return undefined;
    const timer = window.setTimeout(() => {
      runVerify();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [subId, detail, runVerify]);

  // Focus management, Escape handling and scroll lock while the drawer is open.
  useEffect(() => {
    if (!subId) return undefined;
    lastFocusedRef.current = document.activeElement;
    const focusTimer = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (lastFocusedRef.current && typeof lastFocusedRef.current.focus === 'function') {
        lastFocusedRef.current.focus();
      }
    };
  }, [subId, onClose]);

  const rawText = useMemo(() => {
    const raw = detail?.rawEvidence;
    if (raw === null || raw === undefined || raw === '') return '';
    if (typeof raw === 'string') {
      try {
        return JSON.stringify(JSON.parse(raw), null, 2);
      } catch {
        return raw;
      }
    }
    try {
      return JSON.stringify(raw, null, 2);
    } catch {
      return String(raw);
    }
  }, [detail]);

  const hasCounterAccountNumbers = useMemo(() => {
    const list = verify?.transactions;
    if (!Array.isArray(list)) return false;
    return list.some((tx) => tx?.counterAccountNumber || tx?.virtualAccountNumber || tx?.accountNumber);
  }, [verify]);

  if (!subId) return null;

  const timeline = [
    { label: 'Khởi tạo', value: formatDateTime(detail?.createdAt), filled: Boolean(detail?.createdAt) },
    { label: 'Thanh toán', value: formatDateTime(detail?.paidAt), filled: Boolean(detail?.paidAt) },
    { label: 'Bắt đầu hiệu lực', value: formatDateTime(detail?.startDate), filled: Boolean(detail?.startDate) },
    { label: 'Kết thúc', value: formatDateTime(detail?.endDate), filled: Boolean(detail?.endDate) },
  ];

  const payosTransactions = Array.isArray(verify?.transactions) ? verify.transactions : [];

  return (
    <div
      className="txn-drawer-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        className="txn-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="txn-drawer-title"
      >
        <header className="txn-drawer-head">
          <div className="txn-drawer-head-main">
            <span className="txn-drawer-eyebrow">Chi tiết giao dịch</span>
            <h2 id="txn-drawer-title" className="txn-drawer-title">
              <span className="txn-mono">{detail?.orderCode || `#${subId}`}</span>
              {detail?.orderCode && (
                <CopyButton value={detail.orderCode} label="Sao chép mã đơn" />
              )}
            </h2>
            {detail && (
              <div className="txn-drawer-badges">
                <TransactionStatusBadge status={detail.status} />
                <TransactionSourceBadge source={detail.source} isAdminGrant={detail.isAdminGrant} />
                <EvidenceBadge level={detail.evidenceLevel} />
              </div>
            )}
          </div>
          <button
            type="button"
            className="txn-drawer-close"
            onClick={onClose}
            ref={closeBtnRef}
            aria-label="Đóng chi tiết giao dịch"
          >
            <FiX size={20} />
          </button>
        </header>

        <div className="txn-drawer-body">
          {loading && (
            <div className="txn-drawer-loading" aria-busy="true" aria-live="polite">
              <span className="txn-skeleton txn-skeleton-lg" />
              <span className="txn-skeleton txn-skeleton-lg" />
              <span className="txn-skeleton txn-skeleton-lg" />
              <span className="txn-skeleton txn-skeleton-lg" />
            </div>
          )}

          {!loading && error && (
            <div className="txn-inline-error" role="alert">
              <FiAlertTriangle aria-hidden="true" />
              <div>
                <strong>Không thể tải chi tiết</strong>
                <p>{error}</p>
              </div>
              <button
                type="button"
                className="txn-btn txn-btn-ghost txn-btn-sm"
                onClick={() => {
                  setLoading(true);
                  setError('');
                  setReloadKey((key) => key + 1);
                }}
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && detail && (
            <>
              {detail.isDeleted && (
                <div className="txn-inline-warning" role="alert">
                  <FiAlertTriangle aria-hidden="true" />
                  <span>Giao dịch này đã bị đánh dấu xóa trong hệ thống.</span>
                </div>
              )}

              <section className="txn-drawer-section">
                <h3 className="txn-drawer-section-title">Tổng quan</h3>
                <div className="txn-detail-grid">
                  <DetailItem label="Mã đơn hàng" value={detail.orderCode} mono />
                  <DetailItem label="Mã link PayOS" mono>
                    <span className="txn-inline-copy">
                      <span className="txn-mono">{displayValue(detail.paymentLinkId)}</span>
                      {detail.paymentLinkId && (
                        <CopyButton value={detail.paymentLinkId} label="Sao chép mã link PayOS" />
                      )}
                    </span>
                  </DetailItem>
                  <DetailItem label="Mã GD ngân hàng" mono>
                    <span className="txn-inline-copy">
                      <span className="txn-mono">{displayValue(detail.bankReference)}</span>
                      {detail.bankReference && (
                        <CopyButton value={detail.bankReference} label="Sao chép mã giao dịch ngân hàng" />
                      )}
                    </span>
                  </DetailItem>
                  <DetailItem label="Nguồn">
                    <TransactionSourceBadge source={detail.source} isAdminGrant={detail.isAdminGrant} />
                  </DetailItem>
                  <DetailItem label="Trạng thái">
                    <TransactionStatusBadge status={detail.status} />
                  </DetailItem>
                  <DetailItem label="Trạng thái từ PayOS" value={detail.providerStatus} />
                  <DetailItem label="Số tiền đã trả" value={formatCurrency(detail.pricePaid)} />
                  <DetailItem label="Nội dung chuyển khoản" value={detail.paymentDescription} />
                </div>
              </section>

              <section className="txn-drawer-section">
                <h3 className="txn-drawer-section-title">Người mua</h3>
                <div className="txn-detail-grid">
                  <DetailItem label="Họ tên" value={detail.accountName} />
                  <DetailItem label="Tên đăng nhập" value={detail.accountUsername} />
                  <DetailItem label="Email" value={detail.accountEmail} />
                  <DetailItem label="Số điện thoại" value={detail.accountPhone} />
                  <DetailItem label="Mã tài khoản" value={detail.accountId} mono />
                  <DetailItem label="Ngày tạo tài khoản" value={formatDateTime(detail.accountCreatedAt)} />
                  <DetailItem label="Trạng thái tài khoản">
                    <span className={`txn-badge ${detail.accountIsActive === false ? 'txn-badge-red' : 'txn-badge-emerald'}`}>
                      {detail.accountIsActive === false ? 'Đã khóa' : 'Đang hoạt động'}
                    </span>
                  </DetailItem>
                </div>
              </section>

              <section className="txn-drawer-section">
                <h3 className="txn-drawer-section-title">Gói &amp; thời hạn</h3>
                <div className="txn-detail-grid">
                  <DetailItem label="Tên gói" value={detail.planName} />
                  <DetailItem label="Giá niêm yết" value={formatCurrency(detail.planPrice)} />
                  {Number(detail.discountPercent) > 0 && (
                    <DetailItem label="Khuyến mãi" value={`-${detail.discountPercent}%`} />
                  )}
                  <DetailItem label="Thời lượng" value={formatDuration(detail.planDurationDays)} />
                  <DetailItem label="Loại gói" value={formatPlanTier(detail.planTier)} />
                  <DetailItem label="Bắt đầu" value={formatDate(detail.startDate)} />
                  <DetailItem label="Kết thúc" value={formatDate(detail.endDate)} />
                  <DetailItem label="Cấp tay">
                    <span className={`txn-badge ${detail.isAdminGrant ? 'txn-badge-violet' : 'txn-badge-slate'}`}>
                      {detail.isAdminGrant ? 'Có' : 'Không'}
                    </span>
                  </DetailItem>
                  {detail.isAdminGrant && (
                    <DetailItem
                      label="Người cấp"
                      value={detail.grantedByName || detail.grantedByAccountId}
                    />
                  )}
                </div>
              </section>

              <section className="txn-drawer-section">
                <h3 className="txn-drawer-section-title">Dòng thời gian</h3>
                <div className="txn-timeline">
                  {timeline.map((item, index) => (
                    <TimelineItem
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      filled={item.filled}
                      isLast={index === timeline.length - 1}
                    />
                  ))}
                </div>
              </section>

              <section className="txn-drawer-section">
                <h3 className="txn-drawer-section-title">Bằng chứng đã lưu</h3>
                <div className="txn-detail-grid">
                  <DetailItem label="Mức bằng chứng">
                    <EvidenceBadge level={detail.evidenceLevel} />
                  </DetailItem>
                  <DetailItem label="Nguồn bằng chứng" value={detail.evidenceSource} />
                  <DetailItem label="Đồng bộ gần nhất" value={formatDateTime(detail.evidenceSyncedAt)} />
                  <DetailItem label="Nội dung chuyển khoản" value={detail.paymentDescription} />
                </div>
              </section>

              <section className="txn-drawer-section">
                <div className="txn-verify-card">
                  <div className="txn-verify-head">
                    <div>
                      <h3 className="txn-drawer-section-title txn-verify-title">
                        <FiShield aria-hidden="true" /> Đối chiếu PayOS trực tiếp
                      </h3>
                      <p className="txn-verify-sub">Gọi PayOS theo thời gian thực để kiểm tra thanh toán.</p>
                    </div>
                    <div className="txn-verify-actions">
                      {!detail.isAdminGrant && hasCounterAccountNumbers && (
                        <button
                          type="button"
                          className="txn-btn txn-btn-ghost txn-btn-sm"
                          onClick={() => setShowFullAccounts((prev) => !prev)}
                        >
                          {showFullAccounts ? 'Ẩn số tài khoản' : 'Hiện đầy đủ'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="txn-btn txn-btn-ghost txn-btn-sm"
                        onClick={runVerify}
                        disabled={verifyLoading}
                        hidden={detail.isAdminGrant}
                      >
                        <FiRefreshCw className={verifyLoading ? 'txn-spin' : ''} aria-hidden="true" />
                        {verifyLoading ? 'Đang gọi PayOS...' : 'Đối chiếu lại'}
                      </button>
                    </div>
                  </div>

                  {detail.isAdminGrant && (
                    <p className="txn-verify-empty">
                      Giao dịch do admin cấp nên không có link PayOS để đối chiếu trực tiếp.
                    </p>
                  )}

                  {!detail.isAdminGrant && verifyLoading && (
                    <div className="txn-verify-loading" aria-busy="true">
                      <span className="txn-skeleton" />
                      <span className="txn-skeleton" />
                      <span className="txn-skeleton" />
                    </div>
                  )}

                  {!detail.isAdminGrant && !verifyLoading && verifyError && (
                    <div className="txn-inline-error" role="alert">
                      <FiAlertTriangle aria-hidden="true" />
                      <div>
                        <strong>Không gọi được PayOS</strong>
                        <p>{verifyError}</p>
                      </div>
                      <button type="button" className="txn-btn txn-btn-ghost txn-btn-sm" onClick={runVerify}>
                        Thử lại
                      </button>
                    </div>
                  )}

                  {!detail.isAdminGrant && !verifyLoading && !verifyError && verify && (
                    <div className="txn-verify-body">
                      <div className="txn-verify-meta">
                        <span>
                          Trạng thái PayOS:{' '}
                          <span className="txn-badge txn-badge-slate">{displayValue(verify.status)}</span>
                        </span>
                        <span className="txn-muted">Cập nhật: {formatDateTime(verify.fetchedAt)}</span>
                      </div>

                      {verify.available === false ? (
                        <p className="txn-verify-empty">
                          PayOS chưa có thông tin cho đơn này. Có thể đơn chưa được thanh toán hoặc
                          chưa được tạo trên PayOS.
                        </p>
                      ) : (
                        <div className="txn-detail-grid txn-detail-grid-tight">
                          <DetailItem label="Số tiền" value={formatCurrency(verify.amount)} />
                          <DetailItem label="Đã thanh toán" value={formatCurrency(verify.amountPaid)} />
                          <DetailItem label="Còn lại" value={formatCurrency(verify.amountRemaining)} />
                          <DetailItem label="Tạo lúc" value={formatDateTime(verify.createdAt)} />
                          <DetailItem label="Hủy lúc" value={formatDateTime(verify.canceledAt)} />
                          <DetailItem label="Lý do hủy" value={verify.cancellationReason} />
                        </div>
                      )}

                      <div className="txn-bank-tx-list">
                        <h4 className="txn-bank-tx-title">
                          Giao dịch ngân hàng PayOS ghi nhận ({payosTransactions.length})
                        </h4>
                        {payosTransactions.length === 0 ? (
                          <p className="txn-muted txn-small">Chưa có giao dịch ngân hàng nào được ghi nhận.</p>
                        ) : (
                          payosTransactions.map((tx, index) => (
                            <div className="txn-bank-tx" key={`${tx.reference || 'tx'}-${index}`}>
                              <div className="txn-bank-tx-head">
                                <span className="txn-inline-copy">
                                  <span className="txn-mono">{displayValue(tx.reference)}</span>
                                  {tx.reference && (
                                    <CopyButton value={tx.reference} label="Sao chép mã tham chiếu" />
                                  )}
                                </span>
                                <span className="txn-bank-tx-amount">{formatCurrency(tx.amount)}</span>
                              </div>
                              <div className="txn-detail-grid txn-detail-grid-tight">
                                <DetailItem label="Nội dung" value={tx.description} />
                                <DetailItem label="Thời điểm" value={formatDateTime(tx.transactionDateTime)} />
                                <DetailItem
                                  label="TK nhận"
                                  mono
                                  value={
                                    showFullAccounts
                                      ? tx.virtualAccountNumber || tx.accountNumber
                                      : maskAccountNumber(tx.virtualAccountNumber || tx.accountNumber)
                                  }
                                />
                                <DetailItem label="Chủ TK nhận" value={tx.virtualAccountName} />
                                <DetailItem
                                  label="Ngân hàng đối ứng"
                                  value={tx.counterAccountBankName || tx.counterAccountBankId}
                                />
                                <DetailItem label="Chủ TK đối ứng" value={tx.counterAccountName} />
                                <DetailItem
                                  label="STK đối ứng"
                                  mono
                                  value={
                                    showFullAccounts
                                      ? tx.counterAccountNumber
                                      : maskAccountNumber(tx.counterAccountNumber)
                                  }
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="txn-drawer-section">
                <div className="txn-raw-head">
                  <h3 className="txn-drawer-section-title">Raw evidence</h3>
                  <div className="txn-raw-actions">
                    {rawText && (
                      <CopyButton value={rawText} label="Sao chép raw evidence" />
                    )}
                    <button
                      type="button"
                      className="txn-btn txn-btn-ghost txn-btn-sm"
                      onClick={() => setShowRaw((prev) => !prev)}
                      aria-expanded={showRaw}
                    >
                      {showRaw ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
                      {showRaw ? 'Thu gọn' : 'Mở rộng'}
                    </button>
                  </div>
                </div>
                {showRaw && (
                  <pre className="txn-raw-pre">{rawText || 'Không có dữ liệu bằng chứng thô.'}</pre>
                )}
              </section>
            </>
          )}

          {!loading && !error && !detail && (
            <p className="txn-muted">Không tìm thấy giao dịch này.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
