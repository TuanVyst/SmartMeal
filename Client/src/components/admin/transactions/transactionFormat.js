const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const EMPTY = '—';

export const TRANSACTION_DEFAULT_FROM = '2026-11-19';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: VN_TIME_ZONE,
  hour12: false,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: VN_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const isoDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: VN_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function toDate(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** yyyy-MM-dd for today in Vietnam time (safe for <input type="date">). */
export function todayInputValue(date = new Date()) {
  const parsed = toDate(date) || new Date();
  try {
    return isoDateFormatter.format(parsed);
  } catch {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

export function formatCurrency(value, fallback = EMPTY) {
  if (value === null || value === undefined || value === '') return fallback;
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return `${currencyFormatter.format(num)} đ`;
}

export function formatDateTime(value, fallback = EMPTY) {
  const date = toDate(value);
  if (!date) return fallback;
  try {
    return dateTimeFormatter.format(date);
  } catch {
    return fallback;
  }
}

export function formatDate(value, fallback = EMPTY) {
  const date = toDate(value);
  if (!date) return fallback;
  try {
    return dateFormatter.format(date);
  } catch {
    return fallback;
  }
}

export function formatDuration(days) {
  const num = Number(days);
  if (!Number.isFinite(num) || num < 0) return EMPTY;
  if (num === 0) return 'Không giới hạn';
  return `${num} ngày`;
}

export function maskAccountNumber(value, visibleDigits = 4) {
  if (value === null || value === undefined) return EMPTY;
  const text = String(value).trim();
  if (!text) return EMPTY;
  if (text.length <= visibleDigits) return text;
  const tail = text.slice(-visibleDigits);
  return `${'•'.repeat(Math.min(text.length - visibleDigits, 6))} ${tail}`;
}

export function shortenMiddle(value, maxLength = 24) {
  if (value === null || value === undefined) return EMPTY;
  const text = String(value);
  if (text.length <= maxLength) return text;
  const half = Math.floor((maxLength - 1) / 2);
  return `${text.slice(0, half)}…${text.slice(-half)}`;
}

export async function copyToClipboard(value) {
  if (value === null || value === undefined) return false;
  const text = String(value);
  if (!text) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy approach below.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

/** YYYYMMDD-HHmm suffix used for CSV downloads. */
export function filenameStamp(date = new Date()) {
  const parsed = toDate(date) || new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${parsed.getFullYear()}${pad(parsed.getMonth() + 1)}${pad(parsed.getDate())}-${pad(parsed.getHours())}${pad(parsed.getMinutes())}`;
}
