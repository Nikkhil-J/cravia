import { NextResponse } from 'next/server'
import { assertAdmin, AdminAuthError } from '@/lib/auth/assert-admin'
import { invalidateAnalyticsCache } from '@/lib/services/analytics-cache'
import { API_ERRORS } from '@/lib/constants/errors'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: Request, context: RouteContext) {
  try {
    await assertAdmin(req)
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }
    return NextResponse.json({ message: API_ERRORS.UNAUTHORIZED }, { status: 401 })
  }

  const { id: restaurantId } = await context.params
  await invalidateAnalyticsCache(restaurantId)

  return NextResponse.json({ success: true, restaurantId })
}
