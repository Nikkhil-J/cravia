import { NextResponse } from 'next/server'
import { getRequestAuth } from '@/lib/services/request-auth'
import { getUserClaims } from '@/lib/services/coupon'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

export async function GET(req: Request) {
  const auth = await getRequestAuth(req)
  if (!auth) return NextResponse.json({ message: API_ERRORS.UNAUTHORIZED }, { status: 401 })

  try {
    const claims = await getUserClaims(auth.userId)
    return NextResponse.json({ items: claims })
  } catch (error) {
    captureError(error, { route: '/api/rewards/claims', userId: auth.userId })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_FETCH_CLAIMS }, { status: 500 })
  }
}
