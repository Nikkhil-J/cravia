import { NextResponse } from 'next/server'
import { getRestaurantDetails } from '@/lib/services/catalog'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params

  try {
    const restaurant = await getRestaurantDetails(id)
    if (!restaurant) {
      return NextResponse.json({ message: API_ERRORS.RESTAURANT_NOT_FOUND }, { status: 404 })
    }
    return NextResponse.json({ item: restaurant })
  } catch (error) {
    captureError(error, { route: '/api/restaurants/[id]' })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_FETCH_DATA }, { status: 500 })
  }
}

