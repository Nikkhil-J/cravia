import { NextResponse } from 'next/server'
import { getRequestAuth } from '@/lib/services/request-auth'
import { getUserStreak } from '@/lib/services/rewards'
import { captureError } from '@/lib/monitoring/sentry'

export async function GET(req: Request) {
  const auth = await getRequestAuth(req)
  if (!auth?.userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await getUserStreak(auth.userId)
    return NextResponse.json(result)
  } catch (error) {
    captureError(error, { route: '/api/user/streak' })
    return NextResponse.json({ message: 'Failed to fetch streak' }, { status: 500 })
  }
}
