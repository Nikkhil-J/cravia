import { NextResponse } from 'next/server'
import { getRequestAuth } from '@/lib/services/request-auth'
import { getPointsHistory } from '@/lib/services/rewards'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

export async function GET(req: Request) {
  const auth = await getRequestAuth(req)
  if (!auth) return NextResponse.json({ message: API_ERRORS.UNAUTHORIZED }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 50)
  const cursor = searchParams.get('cursor') ?? undefined

  try {
    const result = await getPointsHistory(auth.userId, limit, cursor)
    return NextResponse.json(result)
  } catch (error) {
    captureError(error, { route: '/api/rewards/transactions', userId: auth.userId })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_FETCH_TRANSACTIONS }, { status: 500 })
  }
}
