import { adminRepository, reviewRepository, userRepository } from '@/lib/repositories'
import { API_ENDPOINTS } from '@/lib/constants/api'
import { HTTP_HEADERS } from '@/lib/constants'

export function getAdminStats() {
  return adminRepository.getStats()
}

export function getFlaggedReviews(limit?: number) {
  return reviewRepository.getFlagged(limit)
}

export function getUsers(limit?: number) {
  return userRepository.list(limit)
}

async function adminPatch(url: string, token: string, body: Record<string, unknown>): Promise<boolean> {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${token}`,
      [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON,
    },
    body: JSON.stringify(body),
  })
  return response.ok
}

export function toggleAdmin(userId: string, isAdmin: boolean, token: string) {
  return adminPatch(API_ENDPOINTS.adminUserRole(encodeURIComponent(userId)), token, { isAdmin })
}

export function togglePremium(userId: string, isPremium: boolean, token: string) {
  return adminPatch(API_ENDPOINTS.adminUserPremium(encodeURIComponent(userId)), token, { isPremium })
}

export function unflagReview(reviewId: string, token: string) {
  return adminPatch(API_ENDPOINTS.adminReview(encodeURIComponent(reviewId)), token, {})
}

