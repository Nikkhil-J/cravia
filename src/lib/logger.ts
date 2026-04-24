/**
 * Centralized error logger. All Firebase and service errors flow through here.
 * Replace the console.error call with Sentry/LogRocket when ready for production.
 */
export function logError(context: string, error: unknown): void {
  console.error(`[Cravia] ${context}:`, error)
}
