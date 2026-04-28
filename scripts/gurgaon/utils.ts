import * as path from 'path'

export const DATA_DIR = path.resolve(__dirname, 'data')

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function log(msg: string): void {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

export function logError(msg: string, err?: unknown): void {
  console.error(`[${new Date().toISOString()}] ❌ ${msg}`, err ?? '')
}
