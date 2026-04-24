import { NextResponse } from 'next/server'
import { reviewRepository } from '@/lib/repositories/server'
import { getRequestAuth } from '@/lib/services/request-auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { API_ERRORS } from '@/lib/constants/errors'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(req: Request, context: RouteContext) {
  const auth = await getRequestAuth(req)
  if (!auth) return NextResponse.json({ message: API_ERRORS.UNAUTHORIZED }, { status: 401 })

  const rateLimited = await checkRateLimit(auth.userId, 'GENERAL')
  if (rateLimited) return rateLimited

  const { id } = await context.params
  const result = await reviewRepository.flag(id, auth.userId)
  if (result === 'already_flagged') {
    return NextResponse.json({ message: API_ERRORS.ALREADY_FLAGGED }, { status: 409 })
  }
  if (!result) return NextResponse.json({ message: API_ERRORS.FAILED_TO_FLAG_REVIEW }, { status: 400 })
  return NextResponse.json({ success: true })
}

