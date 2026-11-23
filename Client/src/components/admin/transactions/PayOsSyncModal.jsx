import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiX,
} from 'react-icons/fi';
import { adminService } from '../../../services/adminService';
import { useDialog } from '../../../context/DialogContext';
import { formatCurrency, todayInputValue, TRANSACTION_DEFAULT_FROM } from './transactionFormat';

const BATCH_SIZE = 25;
const MAX_BATCHES = 40;
const PREVIEW_LIMIT = 100;

function buildPayload({ dryRun, fromDate, toDate, onlyIncomplete, limit, offset }) {
  const payload = { dryRun, force: !onlyIncomplete };
  if (fromDate) payload.fromDate = fromDate;
  if (toDate) payload.toDate = toDate;
  if (limit) payload.limit = limit;
  if (offset) payload.offset = offset;
  return payload;
}

function numberValue(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function SummaryGrid({ result }) {
  const cards = [
    { label: 'Đã xử lý', value: result.processed, tone: 'blue' },
    { label: 'Cập nhật', value: result.updated, tone: 'emerald' },
    { label: 'Bỏ qua', value: result.skipped, tone: 'slate' },
    { label: 'Lỗi', value: result.failed, tone: 'red' },
    { label: 'Xung đột', value: result.conflicts, tone: 'amber' },
  ];
  return (
    <div className="txn-sync-summary">
      {cards.map((card) => (
        <div className={`txn-sync-stat tone-${card.tone}`} key={card.label}>
          <span className="txn-sync-stat-label">{card.label}</span>
          <strong className="txn-sync-stat-value">{numberValue(card.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function SyncItemsTable({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="txn-muted txn-small">PayOS không trả về giao dịch nào trong khoảng đã chọn.</p>;
  }

  const visible = items.slice(0, 300);

  return (
    <div className="txn-sync-table-wrap">
      <table className="txn-sync-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Trạng thái</th>
            <th>Số tiền</th>
            <th>Hành động</th>
            <th>Ghi chú</th>
            <th>Bằng chứng sau</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((item, index) => {
            const action = String(item.action || '').toLowerCase();
            const danger = action.includes('conflict') || action.includes('fail');
            return (
              <tr key={`${item.subId || item.orderCode || 'row'}-${index}`} className={danger ? 'is-danger' : ''}>
                <td>
                  <span className="txn-mono">{item.orderCode || item.subId || '—'}</span>
                </td>
                <td>
                  <span className="txn-sync-status">
                    <span>{item.dbStatus || '—'}</span>
                    <span aria-hidden="true">→</span>
                    <span>{item.payosStatus || '—'}</span>
                  </span>
                </td>
                <td>
                  <div className="txn-sync-amount">
                    <span>{formatCurrency(item.dbAmount)}</span>
                    <span className="txn-muted">→ {formatCurrency(item.payosAmountPaid)}</span>
                  </div>
                </td>
                <td>{item.action || '—'}</td>
                <td className="txn-sync-note" title={item.note || ''}>{item.note || '—'}</td>
                <td>{item.evidenceLevelAfter || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {items.length > visible.length && (
        <p className="txn-muted txn-small">
          Đang hiển thị {visible.length} / {items.length} dòng. Dùng CSV hoặc đối chiếu từng đơn để xem đầy đủ.
        </p>
      )}
    </div>
  );
}

export default function PayOsSyncModal({ open, onClose, onSynced, defaultFrom, defaultTo }) {
  const dialog = useDialog();
  const [fromDate, setFromDate] = useState(defaultFrom || TRANSACTION_DEFAULT_FROM);
  const [toDate, setToDate] = useState(defaultTo || todayInputValue());
  const [onlyIncomplete, setOnlyIncomplete] = useState(true);

  const [previewResult, setPreviewResult] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyResult, setApplyResult] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const closeBtnRef = useRef(null);
  const busy = previewLoading || applyLoading;
  const dateRangeInvalid = Boolean(fromDate && toDate && fromDate > toDate);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, busy, onClose]);

  const earlyDateWarning = useMemo(
    () => Boolean(fromDate && fromDate < TRANSACTION_DEFAULT_FROM),
    [fromDate]
  );

  if (!open) return null;

  const validate = () => {
    if (dateRangeInvalid) {
      dialog.error('Khoảng ngày không hợp lệ', 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
      return false;
    }
    return true;
  };

  const handlePreview = async () => {
    if (!validate()) return;
    setPreviewLoading(true);
    setPreviewResult(null);
    setApplyResult(null);
    setError('');
    try {
      const result = await adminService.syncPayOsTransactions(
        buildPayload({ dryRun: true, fromDate, toDate, onlyIncomplete, limit: PREVIEW_LIMIT })
      );
      setPreviewResult(result || { processed: 0, items: [] });
    } catch (err) {
      setError(err?.message || 'Không thể kiểm tra PayOS. Vui lòng thử lại.');
      dialog.error('Không thể kiểm tra PayOS', err?.message || 'Vui lòng thử lại sau.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleApply = async () => {
    if (!validate()) return;

    setApplyLoading(true);
    const confirmed = await dialog.confirm({
      title: 'Đồng bộ giao dịch từ PayOS',
      message: `Hệ thống sẽ gọi PayOS trực tiếp và cập nhật theo từng lô ${BATCH_SIZE} giao dịch. Bạn nên "Kiểm tra trước" để xem các thay đổi dự kiến.`,
      confirmLabel: 'Đồng bộ ngay',
      cancelLabel: 'Hủy',
      danger: false,
    });
    if (!confirmed) {
      setApplyLoading(false);
      return;
    }

    setApplyResult(null);
    setError('');
    const totals = {
      batches: 0,
      processed: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      conflicts: 0,
      items: [],
    };
    setProgress({ ...totals });

    let offset = 0;

    try {
      for (let batch = 0; batch < MAX_BATCHES; batch += 1) {
        const result = await adminService.syncPayOsTransactions(
          buildPayload({
            dryRun: false,
            fromDate,
            toDate,
            onlyIncomplete,
            limit: BATCH_SIZE,
            // Rows updated by a normal batch leave the candidate set, so offset
            // is only needed when re-syncing already-complete rows (force mode).
            offset: onlyIncomplete ? 0 : offset,
          })
        );
        const items = Array.isArray(result?.items) ? result.items : [];
        const processed = numberValue(result?.processed) || items.length;

        totals.batches += 1;
        totals.processed += processed;
        totals.updated += numberValue(result?.updated);
        totals.skipped += numberValue(result?.skipped);
        totals.failed += numberValue(result?.failed);
        totals.conflicts += numberValue(result?.conflicts);
        if (totals.items.length < 500) {
          totals.items.push(...items.slice(0, 500 - totals.items.length));
        }
        setProgress({ ...totals, items: [...totals.items] });

        if (!onlyIncomplete) offset += processed;
        if (processed === 0) break;
        if (processed < BATCH_SIZE) break;
        if (numberValue(result?.updated) === 0) break;
        if (items.length === 0) break;
      }

      setApplyResult({ ...totals });
      dialog.success(
        'Đồng bộ hoàn tất',
        `Đã xử lý ${totals.processed} giao dịch qua ${totals.batches} lô. Cập nhật ${totals.updated}, bỏ qua ${totals.skipped}, lỗi ${totals.failed}.`
      );
      if (onSynced) onSynced();
    } catch (err) {
      setError(err?.message || 'Đồng bộ thất bại giữa chừng. Vui lòng kiểm tra lại.');
      dialog.error('Đồng bộ thất bại', err?.message || 'Vui lòng thử lại sau.');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget && !busy) onClose();
  };

  const activeResult = applyResult || previewResult;
  const resultLabel = applyResult ? 'Kết quả đồng bộ' : 'Kết quả kiểm tra trước';

  return (
    <div className="modal-overlay txn-sync-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="txn-sync-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="txn-sync-title"
      >
        <header className="txn-sync-header">
          <div>
            <h2 id="txn-sync-title">
              <FiRefreshCw aria-hidden="true" /> Đồng bộ từ PayOS
            </h2>
            <p>Đối chiếu trạng thái thanh toán và bổ sung bằng chứng giao dịch.</p>
          </div>
          <button
            type="button"
            className="txn-drawer-close"
            onClick={() => { if (!busy) onClose(); }}
            ref={closeBtnRef}
            aria-label="Đóng hộp thoại đồng bộ"
            disabled={busy}
          >
            <FiX size={20} />
          </button>
        </header>

        <div className="txn-sync-body">
          <div className="txn-inline-warning">
            <FiAlertTriangle aria-hidden="true" />
            <span>
              Chỉ giao dịch từ <strong>19/11/2026</strong> (giờ Việt Nam) được xử lý mặc định.
              Giao dịch trước đó là dữ liệu thử nghiệm và bị loại trừ. Thao tác này gọi PayOS trực tiếp.
            </span>
          </div>

          <div className="txn-sync-fields">
            <label className="txn-field" htmlFor="txn-sync-from">
              <span className="txn-field-label">Từ ngày</span>
              <input
                id="txn-sync-from"
                type="date"
                className="txn-input"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                disabled={busy}
              />
            </label>
            <label className="txn-field" htmlFor="txn-sync-to">
              <span className="txn-field-label">Đến ngày</span>
              <input
                id="txn-sync-to"
                type="date"
                className="txn-input"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                disabled={busy}
              />
            </label>
            <label className="txn-sync-checkbox" htmlFor="txn-sync-incomplete">
              <input
                id="txn-sync-incomplete"
                type="checkbox"
                checked={onlyIncomplete}
                onChange={(event) => setOnlyIncomplete(event.target.checked)}
                disabled={busy}
              />
              <span>Chỉ đồng bộ đơn chưa đủ bằng chứng</span>
            </label>
          </div>

          {earlyDateWarning && (
            <p className="txn-sync-hint">
              Bạn đang chọn ngày trước 19/11/2026. Máy chủ sẽ bỏ qua mọi giao dịch trước mốc này
              (dữ liệu thử nghiệm không bao giờ được đồng bộ).
            </p>
          )}
          {dateRangeInvalid && (
            <p className="txn-sync-hint is-danger">Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.</p>
          )}

          <p className="txn-sync-hint">
            Đồng bộ thực tế chạy theo từng lô {BATCH_SIZE} giao dịch và dừng khi không còn dữ liệu
            cần cập nhật (tối đa {MAX_BATCHES} lô mỗi lần).
          </p>

          {error && (
            <div className="txn-inline-error" role="alert">
              <FiAlertTriangle aria-hidden="true" />
              <div>
                <strong>Đã xảy ra lỗi</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {applyLoading && progress && (
            <div className="txn-sync-progress" aria-live="polite">
              <div className="txn-sync-progress-head">
                <span>Đang đồng bộ lô {progress.batches}...</span>
                <span>{progress.processed} giao dịch đã xử lý</span>
              </div>
              <div className="txn-progress-track">
                <div className="txn-progress-bar" />
              </div>
              <SummaryGrid result={progress} />
            </div>
          )}

          {activeResult && !applyLoading && (
            <div className="txn-sync-result">
              <h3 className="txn-sync-result-title">
                {applyResult && <FiCheckCircle aria-hidden="true" />}
                {resultLabel}
              </h3>
              <SummaryGrid result={activeResult} />
              {applyResult && (
                <p className="txn-sync-hint">Đã làm mới danh sách giao dịch sau khi đồng bộ.</p>
              )}
              <SyncItemsTable items={activeResult.items} />
            </div>
          )}
        </div>

        <footer className="txn-sync-footer">
          <button
            type="button"
            className="txn-btn txn-btn-secondary"
            onClick={onClose}
            disabled={busy}
          >
            Đóng
          </button>
          <button
            type="button"
            className="txn-btn txn-btn-secondary"
            onClick={handlePreview}
            disabled={busy || dateRangeInvalid}
          >
            <FiRefreshCw className={previewLoading ? 'txn-spin' : ''} aria-hidden="true" />
            {previewLoading ? 'Đang kiểm tra...' : 'Kiểm tra trước'}
          </button>
          <button
            type="button"
            className="txn-btn txn-btn-primary"
            onClick={handleApply}
            disabled={busy || dateRangeInvalid}
          >
            {applyLoading ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
          </button>
        </footer>
      </div>
    </div>
  );
}
