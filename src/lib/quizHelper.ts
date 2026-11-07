/**
 * Helper utilities for quiz answer comparison and device identification
 */

// Normalize full-width characters to half-width
function toHalfWidth(str: string): string {
  return str.replace(/[\uff01-\uff5e]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  ).replace(/\u3000/g, ' ');
}

// Normalize answer for fair, robust comparison
export function normalizeAnswer(input: string): string {
  if (!input) return '';
  return toHalfWidth(input)
    .trim()
    .toLowerCase()
    .replace(/[\s\-_,.:;!?，。！？、：；（）()「」『』"']/g, '');
}

// Check if user answer matches any of the acceptable answers
export function checkAnswerMatch(userAnswer: string, acceptableAnswers: string[]): boolean {
  const normalizedUser = normalizeAnswer(userAnswer);
  if (!normalizedUser) return false;

  return acceptableAnswers.some((acceptable) => {
    const normalizedAcceptable = normalizeAnswer(acceptable);
    return normalizedUser === normalizedAcceptable;
  });
}

// Get or create unique device ID
export function getOrCreateDeviceId(): string {
  const STORAGE_KEY = 'quiz_device_id_v2';
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'dev_' + Math.random().toString(36).substring(2, 10);
  }
}

// Friendly device label for admin submissions view
export function getDeviceLabel(): string {
  if (typeof navigator === 'undefined') return 'Web Client';
  const ua = navigator.userAgent;
  let browser = '瀏覽器';
  let os = '裝置';

  if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Macintosh|Mac OS X/.test(ua)) os = 'macOS';
  else if (/Windows/.test(ua)) os = 'Windows';
  else if (/Linux/.test(ua)) os = 'Linux';

  if (/Chrome|CriOS/.test(ua) && !/Edg/.test(ua)) browser = 'Chrome';
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
  else if (/Firefox|FxiOS/.test(ua)) browser = 'Firefox';
  else if (/Edg/.test(ua)) browser = 'Edge';

  return `${browser} (${os})`;
}
