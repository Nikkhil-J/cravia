import { NextResponse } from 'next/server'
import { listDishes } from '@/lib/services/catalog'
import { getRequestAuth } from '@/lib/services/request-auth'
import { dishSearchParamsSchema } from '@/lib/validation/dish.schema'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'
import { SORT_OPTIONS } from '@/lib/constants'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const auth = await getRequestAuth(req)
  const userCity = auth?.userCity ?? null

  const raw = {
    q: searchParams.get('q'),
    city: searchParams.get('city'),
    area: searchParams.get('area'),
    cuisine: searchParams.get('cuisine'),
    dietary: searchParams.get('dietary'),
    priceRange: searchParams.get('priceRange'),
    sortBy: searchParams.get('sortBy') ?? SORT_OPTIONS.HIGHEST_RATED,
    maxReviewCount: searchParams.get('maxReviewCount'),
    cursor: searchParams.get('cursor'),
  }

  const parsed = dishSearchParamsSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { message: API_ERRORS.INVALID_QUERY_PARAMS, errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const params = parsed.data

  try {
    const result = await listDishes({
      query: params.q,
      city: params.city,
      userCity,
      area: params.area,
      cuisine: params.cuisine,
      dietary: params.dietary,
      priceRange: params.priceRange,
      sortBy: params.sortBy,
      maxReviewCount: params.maxReviewCount,
      cursorId: params.cursor,
    })

    return NextResponse.json(result)
  } catch (error) {
    captureError(error, { route: '/api/dishes' })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_FETCH_DATA }, { status: 500 })
  }
}
