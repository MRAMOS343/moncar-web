/**
 * Sanitiza strings para prevenir XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitiza strings para URLs
 */
export function sanitizeUrl(input: string): string {
  try {
    const url = new URL(input);
    // Solo permitir http y https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '#';
    }
    return url.toString();
  } catch {
    return '#';
  }
}

/**
 * Sanitiza números de teléfono
 */
export function sanitizePhone(input: string): string {
  return input.replace(/[^\d\s\-\+\(\)]/g, '');
}
