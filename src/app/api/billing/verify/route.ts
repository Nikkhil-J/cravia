import { NextResponse } from 'next/server'
import { getRequestAuth } from '@/lib/services/request-auth'
import { parseBody } from '@/lib/validation'
import { verifyPaymentSchema } from '@/lib/validation/billing.schema'
import { verifyPaymentSignature, activatePremium } from '@/lib/services/billing'
import { captureError } from '@/lib/monitoring/sentry'
import { createServerNotification } from '@/lib/services/notifications-server'
import { checkRateLimit } from '@/lib/rate-limit'
import { ROUTES } from '@/lib/constants/routes'
import { API_ERRORS } from '@/lib/constants/errors'

export async function POST(req: Request) {
  const auth = await getRequestAuth(req)
  if (!auth) return NextResponse.json({ message: API_ERRORS.UNAUTHORIZED }, { status: 401 })

  const rateLimited = await checkRateLimit(auth.userId, 'GENERAL')
  if (rateLimited) return rateLimited

  const parsed = parseBody(verifyPaymentSchema, await req.json())
  if (!parsed.success) return parsed.response

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = parsed.data

  const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  if (!isValid) {
    captureError(new Error('Invalid Razorpay payment signature'), {
      userId: auth.userId,
      route: '/api/billing/verify',
      extra: { razorpay_order_id },
    })
    return NextResponse.json({ message: API_ERRORS.PAYMENT_FAILED }, { status: 400 })
  }

  try {
    await activatePremium(auth.userId, razorpay_payment_id, razorpay_order_id, 'monthly')

    createServerNotification(
      auth.userId,
      'system',
      'Welcome to Premium!',
      'Your premium subscription is now active. Enjoy all premium features!',
      ROUTES.HOME
    ).catch((e) => captureError(e, { route: '/api/billing/verify', extra: { context: 'notification' } }))

    return NextResponse.json({ success: true })
  } catch (error) {
    captureError(error, {
      userId: auth.userId,
      route: '/api/billing/verify',
      extra: { razorpay_order_id, razorpay_payment_id },
    })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_ACTIVATE_PREMIUM }, { status: 500 })
  }
}
