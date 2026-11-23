import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiDownload,
  FiEye,
  FiInbox,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi';
import { adminService } from '../../../services/adminService';
import { useDialog } from '../../../context/DialogContext';
import {
  CopyButton,
  EvidenceBadge,
  TransactionSourceBadge,
  TransactionStatusBadge,
} from './TransactionBadges';
import TransactionDetailDrawer from './TransactionDetailDrawer';
import PayOsSyncModal from './PayOsSyncModal';
import {
  filenameStamp,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDuration,
  todayInputValue,
  TRANSACTION_DEFAULT_FROM,
} from './transactionFormat';
import './transactions.css';

const PAGE_SIZES = [20, 50, 100];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'superseded', label: 'Đã thay thế' },
];

const SOURCE_OPTIONS = [
  { value: 'payos', label: 'PayOS' },
  { value: 'admin_grant', label: 'Admin cấp' },
];

const SKELETON_WIDTHS = ['70%', '55%', '80%', '65%', '50%', '60%', '45%', '55%', '50%', '45%', '60%', '55%'];

function createInitialFilters(from, to) {
  return {
    search: '',
    status: '',
    source: '',
    planId: '',
    fromDate: from === null || from === undefined ? TRANSACTION_DEFAULT_FROM : from,
    toDate: to === null || to === undefined ? todayInputValue() : to,
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortDir: 'desc',
  };
}

function buildParams(filters, { includePaging = true } = {}) {
  const params = {};
  const add = (key, value) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    params[key] = value;
  };
  add('search', filters.search?.trim());
  add('status', filters.status);
  add('source', filters.source);
  add('planId', filters.planId);
  add('fromDate', filters.fromDate);
  add('toDate', filters.toDate);
  add('sortBy', filters.sortBy);
  add('sortDir', filters.sortDir);
  if (includePaging) {
    add('page', filters.page);
    add('pageSize', filters.pageSize);
  }
  return params;
}

function normalizeListResponse(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const pageSize = Number(payload?.pageSize) || 20;
  const total = Number(payload?.total) || 0;
  const page = Number(payload?.page) || 1;
  const totalPages = Number(payload?.totalPages) || (total > 0 ? Math.ceil(total / pageSize) : 0);
  return {
    items,
    page,
    pageSize,
    total,
    totalPages,
    summary: payload?.summary || {},
  };
}

function SummaryCard({ label, value, sub, tone = 'slate' }) {
  return (
    <div className={`txn-summary-card tone-${tone}`}>
      <span className="txn-summary-label">{label}</span>
      <strong className="txn-summary-value">{value}</strong>
      {sub && <span className="txn-summary-sub">{sub}</span>}
    </div>
  );
}

function getPlanId(plan) {
  return plan?.planId ?? plan?.plan_id ?? plan?.id ?? '';
}

function getPlanName(plan) {
  return plan?.name ?? plan?.planName ?? plan?.plan_name ?? 'Gói không tên';
}

export default function AdminTransactionsPanel({
  defaultFrom,
  defaultTo,
  showHeader = true,
  compact = false,
}) {
  const dialog = useDialog();
  const [filters, setFilters] = useState(() => createInitialFilters(defaultFrom, defaultTo));
  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState([]);
  const [detailSubId, setDetailSubId] = useState(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const requestIdRef = useRef(0);

  useEffect(() => {
    let alive = true;
    adminService
      .getAllPlans()
      .then((list) => {
        if (alive) setPlans(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (alive) setPlans([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) => (prev.search === searchInput ? prev : { ...prev, search: searchInput, page: 1 }));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    await Promise.resolve();
    setLoading(true);
    setError('');
    try {
      const result = await adminService.getAdminTransactions(buildParams(filters));
      if (requestId !== requestIdRef.current) return;
      setData(normalizeListResponse(result));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setData(null);
      setError(err?.message || 'Không thể tải danh sách giao dịch.');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const updateFilter = (patch) => {
    setFilters((prev) => ({ ...prev, page: 1, ...patch }));
  };

  const handleReset = () => {
    setSearchInput('');
    setFilters(createInitialFilters(defaultFrom, defaultTo));
  };

  const handleClearDates = () => {
    setFilters((prev) => ({ ...prev, fromDate: '', toDate: '', page: 1 }));
  };

  const handleRestoreDates = () => {
    setFilters((prev) => ({
      ...prev,
      fromDate: TRANSACTION_DEFAULT_FROM,
      toDate: todayInputValue(),
      page: 1,
    }));
  };

  const handlePage = (nextPage) => {
    const maxPage = Math.max(1, data?.totalPages || 1);
    setFilters((prev) => ({
      ...prev,
      page: Math.min(Math.max(1, nextPage), maxPage),
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { blob, filename } = await adminService.exportAdminTransactions(
        buildParams(filters, { includePaging: false })
      );
      const downloadName = filename || `smartmeal-transactions-${filenameStamp()}.csv`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      dialog.success('Đã xuất CSV', `Tệp ${downloadName} đang được tải xuống với bộ lọc hiện tại.`);
    } catch (err) {
      dialog.error('Không thể xuất CSV', err?.message || 'Vui lòng thử lại sau.');
    } finally {
      setExporting(false);
    }
  };

  const handleCloseDrawer = useCallback(() => setDetailSubId(null), []);
  const handleSynced = useCallback(() => {
    load();
  }, [load]);

  const summary = data?.summary || {};
  const totalPages = Math.max(1, data?.totalPages || 1);
  const currentPage = data?.page || filters.page || 1;
  const totalRows = data?.total || 0;
  const pageSize = data?.pageSize || filters.pageSize;
  const fromRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toRow = totalRows === 0 ? 0 : Math.min(currentPage * pageSize, totalRows);
  const showSkeleton = loading && !data;
  const hasDateFilter = Boolean(filters.fromDate || filters.toDate);
  const hasAdminGrant = summary.adminGrantCount !== undefined && summary.adminGrantCount !== null;

  return (
    <div className={`txn-panel ${compact ? 'txn-panel-compact' : ''}`.trim()}>
      <div className={`txn-panel-header ${showHeader ? '' : 'txn-panel-header-actions-only'}`.trim()}>
        {showHeader && (
          <div className="txn-panel-heading">
            <h2>
              <FiCreditCard aria-hidden="true" /> Giao dịch &amp; thanh toán
            </h2>
            <p>
              Đối chiếu PayOS, theo dõi bằng chứng thanh toán và xuất báo cáo doanh thu.
            </p>
          </div>
        )}
        <div className="txn-panel-actions">
          <button
            type="button"
            className="txn-btn txn-btn-secondary"
            onClick={() => setSyncOpen(true)}
          >
            <FiRefreshCw aria-hidden="true" />
            Đồng bộ từ PayOS
          </button>
          <button
            type="button"
            className="txn-btn txn-btn-primary"
            onClick={handleExport}
            disabled={exporting}
          >
            <FiDownload aria-hidden="true" />
            {exporting ? 'Đang xuất...' : 'Xuất CSV'}
          </button>
        </div>
      </div>

      {!compact && (
        <div className="txn-summary-grid">
          <SummaryCard
            label="Tổng giao dịch"
            value={(summary.totalTransactions ?? 0).toLocaleString('vi-VN')}
            tone="blue"
          />
          <SummaryCard
            label="Doanh thu"
            value={formatCurrency(summary.totalRevenue ?? 0)}
            tone="emerald"
          />
          <SummaryCard
            label="Thành công"
            value={(summary.successfulCount ?? 0).toLocaleString('vi-VN')}
            tone="emerald"
          />
          <SummaryCard
            label="Đang chờ"
            value={(summary.pendingCount ?? 0).toLocaleString('vi-VN')}
            tone="amber"
          />
          <SummaryCard
            label="Đã hủy"
            value={(summary.cancelledCount ?? 0).toLocaleString('vi-VN')}
            tone="red"
          />
          <SummaryCard
            label="Giá trị TB/đơn"
            value={formatCurrency(summary.avgOrderValue ?? 0)}
            tone="slate"
          />
          {hasAdminGrant && (
            <SummaryCard
              label="Cấp tay"
              value={(summary.adminGrantCount ?? 0).toLocaleString('vi-VN')}
              sub={formatCurrency(summary.adminGrantValue ?? 0)}
              tone="violet"
            />
          )}
        </div>
      )}

      <div className="txn-filter-card">
        <div className="txn-filters">
          <label className="txn-field txn-field-search" htmlFor="txn-search">
            <span className="txn-field-label">Tìm kiếm</span>
            <span className="txn-search-wrap">
              <FiSearch aria-hidden="true" />
              <input
                id="txn-search"
                type="search"
                className="txn-input"
                placeholder="Mã đơn, mã GD, tên, email, SĐT..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </span>
          </label>

          <label className="txn-field" htmlFor="txn-status">
            <span className="txn-field-label">Trạng thái</span>
            <select
              id="txn-status"
              className="txn-input"
              value={filters.status}
              onChange={(event) => updateFilter({ status: event.target.value })}
            >
              <option value="">Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="txn-field" htmlFor="txn-source">
            <span className="txn-field-label">Nguồn</span>
            <select
              id="txn-source"
              className="txn-input"
              value={filters.source}
              onChange={(event) => updateFilter({ source: event.target.value })}
            >
              <option value="">Tất cả nguồn</option>
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="txn-field" htmlFor="txn-plan">
            <span className="txn-field-label">Gói</span>
            <select
              id="txn-plan"
              className="txn-input"
              value={filters.planId}
              onChange={(event) => updateFilter({ planId: event.target.value })}
            >
              <option value="">Tất cả gói</option>
              {plans.map((plan) => {
                const id = getPlanId(plan);
                return (
                  <option key={id || getPlanName(plan)} value={id}>
                    {getPlanName(plan)}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="txn-field" htmlFor="txn-from">
            <span className="txn-field-label">Từ ngày</span>
            <input
              id="txn-from"
              type="date"
              className="txn-input"
              value={filters.fromDate}
              onChange={(event) => updateFilter({ fromDate: event.target.value })}
            />
          </label>

          <label className="txn-field" htmlFor="txn-to">
            <span className="txn-field-label">Đến ngày</span>
            <input
              id="txn-to"
              type="date"
              className="txn-input"
              value={filters.toDate}
              onChange={(event) => updateFilter({ toDate: event.target.value })}
            />
          </label>

          <label className="txn-field txn-field-size" htmlFor="txn-page-size">
            <span className="txn-field-label">Số dòng</span>
            <select
              id="txn-page-size"
              className="txn-input"
              value={filters.pageSize}
              onChange={(event) => setFilters((prev) => ({
                ...prev,
                page: 1,
                pageSize: Number(event.target.value),
              }))}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>{size} / trang</option>
              ))}
            </select>
          </label>

          <div className="txn-field txn-field-actions">
            <button type="button" className="txn-btn txn-btn-secondary" onClick={handleReset}>
              Đặt lại
            </button>
          </div>
        </div>

        <div className="txn-filter-note">
          {hasDateFilter ? (
            <>
              <span>
                Đang lọc từ <strong>{formatDate(filters.fromDate, 'không giới hạn')}</strong> đến{' '}
                <strong>{formatDate(filters.toDate, 'không giới hạn')}</strong>.
              </span>
              <button type="button" className="txn-link-btn" onClick={handleClearDates}>
                Xóa lọc ngày
              </button>
            </>
          ) : (
            <>
              <span className="txn-warning-text">
                <FiAlertTriangle aria-hidden="true" /> Đang hiển thị tất cả giao dịch, gồm cả dữ liệu
                thử nghiệm trước 19/11/2026.
              </span>
              <button type="button" className="txn-link-btn" onClick={handleRestoreDates}>
                Dùng lại mốc 19/11/2026
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`txn-table-container ${loading && data ? 'txn-table-loading' : ''}`.trim()}>
        <div className="txn-table-scroll">
          <table className="admin-table txn-table">
            <colgroup>
              <col style={{ width: '98px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '124px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '94px' }} />
              <col style={{ width: '104px' }} />
              <col style={{ width: '68px' }} />
              <col style={{ width: '110px' }} />
              <col style={{ width: '76px' }} />
              <col style={{ width: '76px' }} />
              <col style={{ width: '76px' }} />
              <col style={{ width: '104px' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Mã đơn</th>
                <th scope="col">Mã GD ngân hàng</th>
                <th scope="col">Người mua</th>
                <th scope="col">Gói</th>
                <th scope="col">Số tiền</th>
                <th scope="col">Trạng thái</th>
                <th scope="col">Nguồn</th>
                <th scope="col">Thanh toán</th>
                <th scope="col">Bắt đầu</th>
                <th scope="col">Kết thúc</th>
                <th scope="col">Bằng chứng</th>
                <th scope="col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {showSkeleton &&
                Array.from({ length: Math.min(filters.pageSize, 8) }).map((_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`} aria-hidden="true">
                    {SKELETON_WIDTHS.map((width, cellIndex) => (
                      <td key={`skeleton-cell-${cellIndex}`}>
                        <span className="txn-skeleton" style={{ width }} />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading && error && (
                <tr>
                  <td colSpan={12}>
                    <div className="txn-state-box" role="alert">
                      <FiAlertTriangle size={28} aria-hidden="true" />
                      <strong>Không thể tải danh sách giao dịch</strong>
                      <p>{error}</p>
                      <button type="button" className="txn-btn txn-btn-primary" onClick={load}>
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && data && data.items.length === 0 && (
                <tr>
                  <td colSpan={12}>
                    <div className="txn-state-box">
                      <FiInbox size={28} aria-hidden="true" />
                      <strong>Chưa có giao dịch nào</strong>
                      <p>Thử nới rộng khoảng ngày hoặc bỏ một vài bộ lọc để xem thêm kết quả.</p>
                      <button type="button" className="txn-btn txn-btn-secondary" onClick={handleReset}>
                        Xóa bộ lọc
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {data && !error && data.items.map((item) => (
                <tr
                  key={item.subId}
                  className="txn-row-click"
                  onClick={() => setDetailSubId(item.subId)}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setDetailSubId(item.subId);
                    }
                  }}
                  aria-label={`Xem chi tiết giao dịch ${item.orderCode || item.subId}`}
                >
                  <td>
                    <div className="txn-code-cell">
                      <span className="txn-cell-main txn-mono" title={item.orderCode || item.subId || ''}>
                        {item.orderCode || item.subId || '—'}
                      </span>
                      {item.orderCode && <CopyButton value={item.orderCode} label="Sao chép mã đơn" />}
                    </div>
                    <span className="txn-cell-sub">{formatDateTime(item.createdAt)}</span>
                  </td>
                  <td>
                    <div className="txn-code-cell">
                      <span className="txn-cell-main txn-mono" title={item.bankReference || ''}>
                        {item.bankReference || '—'}
                      </span>
                      {item.bankReference && (
                        <CopyButton value={item.bankReference} label="Sao chép mã GD ngân hàng" />
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className="txn-cell-main"
                      title={[item.accountName, item.accountUsername, item.accountEmail, item.accountPhone]
                        .filter(Boolean)
                        .join(' • ')}
                    >
                      {item.accountName || item.accountUsername || '—'}
                    </span>
                    <span
                      className="txn-cell-sub"
                      title={[item.accountEmail, item.accountPhone].filter(Boolean).join(' • ')}
                    >
                      {item.accountEmail || item.accountPhone || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="txn-cell-main" title={item.planName || ''}>
                      {item.planName || '—'}
                    </span>
                    <span className="txn-cell-sub">
                      {formatCurrency(item.planPrice)} · {formatDuration(item.planDurationDays)}
                    </span>
                  </td>
                  <td>
                    <span className="txn-amount" title={formatCurrency(item.pricePaid)}>
                      {formatCurrency(item.pricePaid)}
                    </span>
                    {item.planPrice !== undefined && Number(item.planPrice) !== Number(item.pricePaid) && (
                      <span className="txn-cell-sub">Giá gói: {formatCurrency(item.planPrice)}</span>
                    )}
                  </td>
                  <td>
                    <TransactionStatusBadge status={item.status} />
                    {item.providerStatus && (
                      <span className="txn-cell-sub">{item.providerStatus}</span>
                    )}
                  </td>
                  <td>
                    <TransactionSourceBadge source={item.source} isAdminGrant={item.isAdminGrant} />
                  </td>
                  <td>
                    <span className="txn-cell-main txn-nowrap">{formatDateTime(item.paidAt)}</span>
                  </td>
                  <td>
                    <span className="txn-cell-main txn-nowrap">{formatDate(item.startDate)}</span>
                  </td>
                  <td>
                    <span className="txn-cell-main txn-nowrap">{formatDate(item.endDate)}</span>
                  </td>
                  <td>
                    <EvidenceBadge level={item.evidenceLevel} />
                    <span className="txn-cell-sub" title={formatDateTime(item.evidenceSyncedAt)}>
                      {item.evidenceSyncedAt ? formatDate(item.evidenceSyncedAt) : '—'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="txn-row-action"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDetailSubId(item.subId);
                      }}
                      title="Xem & đối chiếu"
                      aria-label={`Xem và đối chiếu giao dịch ${item.orderCode || item.subId}`}
                    >
                      <FiEye aria-hidden="true" />
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="txn-pagination">
          <span className="txn-pagination-info">
            {totalRows > 0
              ? `Hiển thị ${fromRow.toLocaleString('vi-VN')}–${toRow.toLocaleString('vi-VN')} trong ${totalRows.toLocaleString('vi-VN')} giao dịch`
              : 'Không có giao dịch'}
          </span>
          <div className="txn-pagination-controls">
            <button
              type="button"
              className="txn-page-btn"
              onClick={() => handlePage(currentPage - 1)}
              disabled={loading || currentPage <= 1}
              aria-label="Trang trước"
            >
              <FiChevronLeft aria-hidden="true" />
              Trước
            </button>
            <span className="txn-page-indicator">
              Trang <strong>{currentPage}</strong> / {totalPages}
            </span>
            <button
              type="button"
              className="txn-page-btn"
              onClick={() => handlePage(currentPage + 1)}
              disabled={loading || currentPage >= totalPages}
              aria-label="Trang sau"
            >
              Sau
              <FiChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {detailSubId !== null && (
        <TransactionDetailDrawer
          key={detailSubId}
          subId={detailSubId}
          onClose={handleCloseDrawer}
        />
      )}

      {syncOpen && (
        <PayOsSyncModal
          open
          onClose={() => setSyncOpen(false)}
          onSynced={handleSynced}
          defaultFrom={filters.fromDate || TRANSACTION_DEFAULT_FROM}
          defaultTo={filters.toDate || todayInputValue()}
        />
      )}
    </div>
  );
}
