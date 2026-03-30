/**
 * Sanitizes sensitive data from logs for debugging
 * Masks: emails, tokens, passwords, API keys, health info previews
 */

const SENSITIVE_PATTERNS = {
  email: /[\w\.-]+@[\w\.-]+\.\w+/g,
  jwt: /Bearer\s+[A-Za-z0-9\-_.]+/g,
  apiKey: /(api[_-]?key|secret|token)[:=\s]+["']?[A-Za-z0-9\-_.]+["']?/gi,
  password: /(password|passwd|pwd)[:=\s]+["']?[^"',\s]+["']?/gi,
  uuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
}

export function sanitize(value: any): any {
  if (typeof value === 'string') {
    let sanitized = value
    // Mask emails
    sanitized = sanitized.replace(SENSITIVE_PATTERNS.email, '[EMAIL]')
    // Mask JWT tokens
    sanitized = sanitized.replace(SENSITIVE_PATTERNS.jwt, 'Bearer [REDACTED_TOKEN]')
    // Mask API keys
    sanitized = sanitized.replace(SENSITIVE_PATTERNS.apiKey, '$1: [REDACTED]')
    // Mask passwords
    sanitized = sanitized.replace(SENSITIVE_PATTERNS.password, '$1: [REDACTED]')
    return sanitized
  }

  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map(sanitize)
    }

    const sanitized: any = {}
    for (const [key, val] of Object.entries(value)) {
      // Skip sensitive field names entirely
      if (isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitize(val)
      }
    }
    return sanitized
  }

  return value
}

function isSensitiveField(fieldName: string): boolean {
  const sensitiveFields = [
    'password',
    'passwd',
    'pwd',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'api_key',
    'secret',
    'authorization',
    'auth',
    'email',
    'ssn',
    'social_security',
    'creditCard',
    'credit_card',
    'cvv',
    'apiSecret',
  ]

  const lower = fieldName.toLowerCase()
  return sensitiveFields.some(field => lower.includes(field))
}


/**
 * Redact health info from transcripts/notes for privacy
 * Keeps structure but hides patient details
 */
export function redactHealthInfo(text: string): string {
  if (!text) return text
  // Just mask email addresses that might be in health records
  return text.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '[EMAIL]')
}
