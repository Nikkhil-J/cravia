import { NextResponse } from 'next/server'
import { getRequestAuth } from '@/lib/services/request-auth'
import { getCouponCatalogue } from '@/lib/services/coupon'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

export async function GET(req: Request) {
  const auth = await getRequestAuth(req)
  if (!auth) return NextResponse.json({ message: API_ERRORS.UNAUTHORIZED }, { status: 401 })

  try {
    const coupons = await getCouponCatalogue()
    return NextResponse.json({ items: coupons })
  } catch (error) {
    captureError(error, { route: '/api/rewards/coupons', userId: auth.userId })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_FETCH_COUPONS }, { status: 500 })
  }
}
