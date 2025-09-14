/**
 * 將日期格式化為本地時間字符串
 * @param time - Date 對象
 * @returns 格式化後的時間字符串 (YYYY-MM-DD HH:mm:ss)
 */

export const formatTime = (time: Date): string => {
  return time.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

/**
 * 格式化日期時間為 YYYY-MM-DD HH:mm:ss 格式
 * @param date - 日期字串或 Date 物件
 * @returns 格式化後的日期時間字串
 */
export const formatDateTimeWithSeconds = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

/**
 * 格式化日期時間為 YYYY-MM-DD HH:mm 格式
 * @param date - 日期字串或 Date 物件
 * @returns 格式化後的日期時間字串
 */
export const formatDateTimeWithMinutes = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 格式化日期時間為 YYYY-MM-DD 格式
 * @param date - 日期字串或 Date 物件
 * @returns 格式化後的日期時間字串
 */
export const formatDateTimeWithDay = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
};

// t: (key: string, values?: Record<string, unknown>) => string
export const formatRelativeTime = (
  rawTimestamp: string | null,
  t: (key: string, values?: Record<string, unknown>) => string
) => {
  if (!rawTimestamp) return '';
  const now = new Date().getTime();
  const ts = parseInt(rawTimestamp, 10);
  const diffMs = now - ts;
  if (isNaN(ts) || diffMs < 0) return '';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return t('common.relative.second', { count: diffSec });
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return t('common.relative.minute', { count: diffMin });
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return t('common.relative.hour', { count: diffHr });
  const diffDay = Math.floor(diffHr / 24);
  return t('common.relative.day', { count: diffDay });
};

// 調整時區，將數據庫時間轉換為正確的本地時間
export const adjustTimeZone = (dateString?: string): Date => {
  if (!dateString) return new Date();

  // 判斷數據庫時間是否已包含時區信息
  const hasTimezone = dateString.includes('Z') || dateString.includes('+');

  if (hasTimezone) {
    // 如果時間字符串已包含時區信息，直接解析
    return new Date(dateString);
  } else {
    // 假設數據庫時間是 UTC 時間，手動添加時區偏移
    const utcDate = new Date(dateString);

    // 取得用戶所在時區的偏移量（分鐘）
    const timezoneOffset = new Date().getTimezoneOffset();

    // 調整時間（注意 timezoneOffset 是負數表示東部時區）
    const localDate = new Date(utcDate.getTime() - timezoneOffset * 60 * 1000);

    return localDate;
  }
};
