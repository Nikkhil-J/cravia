import { NextResponse } from 'next/server'
import { listRestaurants } from '@/lib/services/catalog'
import { getRequestAuth } from '@/lib/services/request-auth'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city')
  const area = searchParams.get('area')
  const limitParam = Number(searchParams.get('limit'))
  const auth = await getRequestAuth(req)
  const userCity = auth?.userCity ?? null

  try {
    const result = await listRestaurants({
      city,
      userCity,
      area,
      limit: Number.isFinite(limitParam) ? limitParam : undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    captureError(error, { route: '/api/restaurants' })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_FETCH_DATA }, { status: 500 })
  }
}

