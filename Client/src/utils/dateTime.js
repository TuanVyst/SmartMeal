const VIETNAM_LOCALE = 'vi-VN';
const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

function toDateObject(value) {
  if (value == null || value === '') {
    return new Date(NaN);
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  return new Date(value);
}

function formatDateKeyParts(value) {
  const date = toDateObject(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: VIETNAM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;

  return { year, month, day };
}

export function toDateKey(value) {
  const parts = formatDateKeyParts(value);
  if (!parts) {
    return '';
  }

  const { year, month, day } = parts;
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey() {
  return toDateKey(new Date());
}

export function formatDateVi(value, options = {}) {
  const date = toDateObject(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(VIETNAM_LOCALE, {
    timeZone: VIETNAM_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatDatePartsVi(value, options = {}) {
  const date = toDateObject(value);
  if (Number.isNaN(date.getTime())) {
    return [];
  }

  return new Intl.DateTimeFormat(VIETNAM_LOCALE, {
    timeZone: VIETNAM_TIME_ZONE,
    ...options,
  }).formatToParts(date);
}

export function formatDateTimeVi(value, options = {}) {
  const date = toDateObject(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(VIETNAM_LOCALE, {
    timeZone: VIETNAM_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(date);
}
