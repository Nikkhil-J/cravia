import { captureError } from '@/lib/monitoring/sentry'

/**
 * Centralized error logger. All Firebase and service errors flow through here.
 */
export function logError(context: string, error: unknown): void {
  captureError(error, { route: context })
}
