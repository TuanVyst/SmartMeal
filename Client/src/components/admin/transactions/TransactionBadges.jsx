import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';
import { copyToClipboard } from './transactionFormat';

const STATUS_META = {
  pending: { label: 'Chờ thanh toán', tone: 'amber' },
  active: { label: 'Đang hoạt động', tone: 'emerald' },
  expired: { label: 'Hết hạn', tone: 'slate' },
  cancelled: { label: 'Đã hủy', tone: 'red' },
  canceled: { label: 'Đã hủy', tone: 'red' },
  superseded: { label: 'Đã thay thế', tone: 'violet' },
  failed: { label: 'Thất bại', tone: 'red' },
  refunded: { label: 'Đã hoàn tiền', tone: 'blue' },
};

const EVIDENCE_META = {
  full: {
    label: 'Đủ',
    tone: 'emerald',
    tip: 'Đủ: có mã link, mã GD ngân hàng và thời điểm thanh toán',
  },
  partial: {
    label: 'Một phần',
    tone: 'amber',
    tip: 'Một phần: thiếu một trong các mã hoặc thời điểm thanh toán',
  },
  internal: {
    label: 'Nội bộ',
    tone: 'blue',
    tip: 'Nội bộ: giao dịch được ghi nhận thủ công trong hệ thống',
  },
  none: {
    label: 'Thiếu',
    tone: 'red',
    tip: 'Thiếu: chưa có bằng chứng thanh toán nào',
  },
};

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase();
}

function humanize(value) {
  if (!value) return '—';
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function TransactionStatusBadge({ status }) {
  const key = normalizeKey(status);
  const meta = STATUS_META[key];
  if (!meta) {
    return <span className="txn-badge txn-badge-slate">{humanize(status)}</span>;
  }
  return <span className={`txn-badge txn-badge-${meta.tone}`}>{meta.label}</span>;
}

export function TransactionSourceBadge({ source, isAdminGrant = false }) {
  const key = normalizeKey(source).replace(/[^a-z]/g, '');
  const granted = isAdminGrant || ['admin', 'admingrant', 'manual', 'grant', 'internal'].includes(key);

  if (key === 'payos' || key === 'payoswebhook') {
    return <span className="txn-badge txn-badge-blue">PayOS</span>;
  }
  if (granted) {
    return <span className="txn-badge txn-badge-violet">Admin cấp</span>;
  }
  return <span className="txn-badge txn-badge-slate">{humanize(source)}</span>;
}

export function EvidenceBadge({ level }) {
  const key = normalizeKey(level) || 'none';
  const meta = EVIDENCE_META[key] || EVIDENCE_META.none;
  return (
    <span
      className={`txn-badge txn-badge-${meta.tone} txn-badge-evidence`}
      title={meta.tip}
      aria-label={`${meta.label}. ${meta.tip}`}
    >
      {meta.label}
    </span>
  );
}

export function CopyButton({ value, label = 'Sao chép', className = '' }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const handleCopy = async (event) => {
    event.stopPropagation();
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopied(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      className={`txn-copy-btn ${className}`.trim()}
      onClick={handleCopy}
      title={copied ? 'Đã sao chép' : label}
      aria-label={copied ? 'Đã sao chép' : label}
      disabled={!value}
    >
      {copied ? <FiCheck size={13} aria-hidden="true" /> : <FiCopy size={13} aria-hidden="true" />}
    </button>
  );
}
