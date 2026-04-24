import { NextResponse } from 'next/server'
import { AdminAuthError, assertAdmin } from '@/lib/auth/assert-admin'
import { couponRepository } from '@/lib/repositories/server'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    await assertAdmin(req)
    const { id } = await context.params

    const ok = await couponRepository.deactivate(id)
    if (!ok) return NextResponse.json({ message: API_ERRORS.FAILED_TO_DEACTIVATE_COUPON }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }
    captureError(error, { route: '/api/admin/coupons/[id]' })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_DEACTIVATE_COUPON }, { status: 500 })
  }
}
