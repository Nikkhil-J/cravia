import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin-server'
import { AdminAuthError, assertAdmin } from '@/lib/auth/assert-admin'
import { COLLECTIONS } from '@/lib/firebase/config'
import { computeLevel, computeEarnedBadges } from '@/lib/gamification'
import { computeOverall, computeTopTags } from '@/lib/utils/index'
import { captureError } from '@/lib/monitoring/sentry'
import { API_ERRORS } from '@/lib/constants/errors'
import { createServerNotification } from '@/lib/services/notifications-server'
import { syncRestaurantToTypesense } from '@/lib/services/typesense-restaurant-sync'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    await assertAdmin(req)
    const { id } = await context.params

    await adminDb.collection(COLLECTIONS.REVIEWS).doc(id).update({
      isFlagged: false,
      isApproved: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    captureError(error, { route: '/api/admin/reviews/[id]' })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_APPROVE_REVIEW }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    await assertAdmin(req)
    const { id } = await context.params

    let reason: string | undefined
    try {
      const body = await req.json()
      reason = typeof body?.reason === 'string' ? body.reason.trim() : undefined
    } catch {
      // no body is fine
    }

    const reviewRef = adminDb.collection(COLLECTIONS.REVIEWS).doc(id)

    const deletedReview = await adminDb.runTransaction(async (tx) => {
      const reviewSnap = await tx.get(reviewRef)
      if (!reviewSnap.exists) throw new Error('REVIEW_NOT_FOUND')

      const review = reviewSnap.data()
      const dishId = review?.dishId as string | undefined
      const authorId = review?.userId as string | undefined
      if (!dishId || !authorId) throw new Error('INVALID_REVIEW')

      const dishRef = adminDb.collection(COLLECTIONS.DISHES).doc(dishId)
      const userRef = adminDb.collection(COLLECTIONS.USERS).doc(authorId)

      const dishSnap = await tx.get(dishRef)
      if (!dishSnap.exists) throw new Error('DISH_NOT_FOUND')
      const userSnap = await tx.get(userRef)

      const dish = dishSnap.data()
      const prevCount = Number(dish?.reviewCount ?? 0)
      const newCount = Math.max(prevCount - 1, 0)

      let avgTaste = 0
      let avgPortion = 0
      let avgValue = 0
      let avgOverall = 0

      if (newCount > 0) {
        avgTaste = ((Number(dish?.avgTaste ?? 0) * prevCount) - Number(review?.tasteRating ?? 0)) / newCount
        avgPortion = ((Number(dish?.avgPortion ?? 0) * prevCount) - Number(review?.portionRating ?? 0)) / newCount
        avgValue = ((Number(dish?.avgValue ?? 0) * prevCount) - Number(review?.valueRating ?? 0)) / newCount
        avgOverall = computeOverall(avgTaste, avgPortion, avgValue)
      }

      tx.delete(reviewRef)
      tx.update(dishRef, {
        avgTaste,
        avgPortion,
        avgValue,
        avgOverall,
        reviewCount: newCount,
      })

      if (userSnap.exists) {
        const userData = userSnap.data()
        const newReviewCount = Math.max(Number(userData?.reviewCount ?? 0) - 1, 0)
        const helpfulVotes = Number(userData?.helpfulVotesReceived ?? 0)
        const level = computeLevel(newReviewCount)
        const badges = computeEarnedBadges(newReviewCount, helpfulVotes)
        tx.update(userRef, {
          reviewCount: newReviewCount,
          level,
          badges,
        })
      }

      return { dishId, authorId: authorId as string }
    })

    const tagsSnap = await adminDb
      .collection(COLLECTIONS.REVIEWS)
      .where('dishId', '==', deletedReview.dishId)
      .where('isApproved', '==', true)
      .get()
    const allTagArrays = tagsSnap.docs.map((doc) => (doc.data().tags as string[] | undefined) ?? [])
    const topTags = computeTopTags(allTagArrays)

    const dishRef = adminDb.collection(COLLECTIONS.DISHES).doc(deletedReview.dishId)
    await dishRef.update({ topTags })

    const dishSnap = await dishRef.get()
    const restaurantId = dishSnap.data()?.restaurantId as string | undefined
    if (restaurantId) {
      syncRestaurantToTypesense(restaurantId).catch((err) =>
        captureError(err, { route: 'DELETE /api/admin/reviews/[id]', extra: { phase: 'typesense-sync' } })
      )
    }

    const notificationMessage = reason
      ? `Your review was removed by a moderator. Reason: ${reason}`
      : 'Your review was removed by a moderator for violating community guidelines.'

    createServerNotification(
      deletedReview.authorId,
      'review_removed',
      'Your review was removed',
      notificationMessage,
      null
    ).catch((err) =>
      captureError(err, { route: 'DELETE /api/admin/reviews/[id]', extra: { phase: 'notification' } })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }

    if (error instanceof Error) {
      if (error.message === 'REVIEW_NOT_FOUND') {
        return NextResponse.json({ message: API_ERRORS.REVIEW_NOT_FOUND }, { status: 404 })
      }

      if (error.message === 'DISH_NOT_FOUND') {
        return NextResponse.json({ message: API_ERRORS.DISH_NOT_FOUND }, { status: 400 })
      }

      if (error.message === 'INVALID_REVIEW') {
        return NextResponse.json({ message: 'Review data is invalid' }, { status: 400 })
      }
    }

    captureError(error, { route: '/api/admin/reviews/[id]' })
    return NextResponse.json({ message: API_ERRORS.FAILED_TO_DELETE_REVIEW_ADMIN }, { status: 500 })
  }
}
