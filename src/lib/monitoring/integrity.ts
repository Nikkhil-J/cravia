import * as Sentry from '@sentry/nextjs'

type IntegrityEventType = 'same_restaurant_burst' | 'duplicate_ip' | 'similar_text'

export function logIntegrityEvent(
  type: IntegrityEventType,
  metadata: Record<string, unknown>,
): void {
  Sentry.addBreadcrumb({
    category: 'integrity',
    message: type,
    data: metadata,
    level: 'warning',
  })
  if (process.env.NODE_ENV === 'development') {
    console.warn('[integrity]', type, metadata)
  }
}
