import { NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin-server'
import { dishRepository } from '@/lib/repositories'
import { getRequestAuth } from '@/lib/services/request-auth'
import { COLLECTIONS, SUBCOLLECTIONS } from '@/lib/firebase/config'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'

interface RouteContext {
  params: Promise<{ userId: string; dishId: string }>
}

export async function POST(req: Request, context: RouteContext) {
  const { userId, dishId } = await context.params
  const auth = await getRequestAuth(req)
  if (!auth || auth.userId !== userId) {
    return NextResponse.json({ message: API_ERRORS.FORBIDDEN }, { status: 403 })
  }

  const dish = await dishRepository.getById(dishId)
  if (!dish) {
    return NextResponse.json({ message: API_ERRORS.DISH_NOT_FOUND }, { status: 404 })
  }

  try {
    await adminDb
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(SUBCOLLECTIONS.WISHLIST)
      .doc(dishId)
      .set({
        dishId: dish.id,
        dishName: dish.name,
        restaurantId: dish.restaurantId,
        restaurantName: dish.restaurantName,
        coverImage: dish.coverImage,
        avgOverall: dish.avgOverall,
        savedAt: Timestamp.now(),
      })
    return NextResponse.json({ success: true })
  } catch (error) {
    captureError(error, { route: 'POST /api/users/[userId]/wishlist/[dishId]', userId })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_SAVE_DISH }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  const { userId, dishId } = await context.params
  const auth = await getRequestAuth(req)
  if (!auth || auth.userId !== userId) {
    return NextResponse.json({ message: API_ERRORS.FORBIDDEN }, { status: 403 })
  }

  try {
    await adminDb
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(SUBCOLLECTIONS.WISHLIST)
      .doc(dishId)
      .delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    captureError(error, { route: 'DELETE /api/users/[userId]/wishlist/[dishId]', userId })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_REMOVE_DISH }, { status: 500 })
  }
}

