import { z } from 'zod'

export const toggleAdminSchema = z.object({
  isAdmin: z.boolean(),
}).strip()

export type ToggleAdminInput = z.infer<typeof toggleAdminSchema>

export const togglePremiumSchema = z.object({
  isPremium: z.boolean(),
}).strip()

export type TogglePremiumInput = z.infer<typeof togglePremiumSchema>

export const restaurantRequestActionSchema = z.object({
  action: z.literal('done'),
  note: z.string().max(500).optional(),
}).strip()

export type RestaurantRequestActionInput = z.infer<typeof restaurantRequestActionSchema>
