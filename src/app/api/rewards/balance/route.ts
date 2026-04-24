import { NextResponse } from 'next/server'
import { getRequestAuth } from '@/lib/services/request-auth'
import { getPointsBalance } from '@/lib/services/rewards'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

export async function GET(req: Request) {
  const auth = await getRequestAuth(req)
  if (!auth) return NextResponse.json({ message: API_ERRORS.UNAUTHORIZED }, { status: 401 })

  try {
    const balance = await getPointsBalance(auth.userId)
    return NextResponse.json(balance)
  } catch (error) {
    captureError(error, { route: '/api/rewards/balance', userId: auth.userId })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_FETCH_BALANCE }, { status: 500 })
  }
}
