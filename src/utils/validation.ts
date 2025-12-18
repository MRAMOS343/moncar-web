// Funciones de parsing seguro
export function safeParseInt(value: string | number, defaultValue: number = 0): number {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function safeParseFloat(value: string | number, defaultValue: number = 0): number {
  if (typeof value === 'number') {
    return isFinite(value) ? value : defaultValue;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Validación de rangos
export function validateInRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): { valid: boolean; error?: string } {
  if (value < min) {
    return { valid: false, error: `${fieldName} debe ser mayor o igual a ${min}` };
  }
  if (value > max) {
    return { valid: false, error: `${fieldName} debe ser menor o igual a ${max}` };
  }
  return { valid: true };
}

// Validación de enteros
export function validateInteger(
  value: number,
  fieldName: string
): { valid: boolean; error?: string } {
  if (!Number.isInteger(value)) {
    return { valid: false, error: `${fieldName} debe ser un número entero` };
  }
  return { valid: true };
}

// Validación de arrays no vacíos
export function validateNonEmptyArray<T>(
  array: T[],
  fieldName: string
): { valid: boolean; error?: string } {
  if (!Array.isArray(array) || array.length === 0) {
    return { valid: false, error: `${fieldName} no puede estar vacío` };
  }
  return { valid: true };
}

// Sanitización de strings
export function sanitizeString(value: string, maxLength?: number): string {
  let sanitized = value.trim();
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  return sanitized;
}
