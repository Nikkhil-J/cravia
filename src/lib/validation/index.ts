import { NextResponse } from 'next/server'
import { type ZodSchema, ZodError } from 'zod'
import { API_ERRORS } from '@/lib/constants/errors'

export function parseBody<T>(schema: ZodSchema<T>, data: unknown):
  | { success: true; data: T }
  | { success: false; response: NextResponse } {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return {
      success: false,
      response: NextResponse.json(
        { message: API_ERRORS.VALIDATION_FAILED, errors },
        { status: 400 }
      ),
    }
  }

  return { success: true, data: result.data }
}

export { ZodError }
