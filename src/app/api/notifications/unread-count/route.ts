import { NextResponse } from 'next/server'
import { getRequestAuth } from '@/lib/services/request-auth'
import { getUnreadCount } from '@/lib/services/notifications-server'
import { API_ERRORS } from '@/lib/constants/errors'

export async function GET(req: Request) {
  const auth = await getRequestAuth(req)
  if (!auth) {
    return NextResponse.json({ message: API_ERRORS.UNAUTHORIZED }, { status: 401 })
  }

  const count = await getUnreadCount(auth.userId)
  return NextResponse.json({ count })
}
