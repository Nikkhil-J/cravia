'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateDishPage(dishId: string) {
  revalidatePath(`/dish/${dishId}`)
}

export async function revalidateRestaurantPage(restaurantId: string) {
  revalidatePath(`/restaurant/${restaurantId}`)
}

export async function revalidateProfilePage(userId: string) {
  revalidatePath(`/profile/${userId}`)
}

export async function revalidateExplorePage() {
  revalidatePath('/explore')
}
