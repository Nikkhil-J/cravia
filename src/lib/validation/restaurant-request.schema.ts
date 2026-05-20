import { z } from 'zod'

export const createRestaurantRequestSchema = z.object({
  restaurantName: z.string().trim().min(2, 'Restaurant name is required').max(120),
  location: z.string().trim().max(160).optional().transform((value) => value || null),
  note: z.string().trim().max(500).optional().transform((value) => value || null),
}).strip()

export type CreateRestaurantRequestInput = z.infer<typeof createRestaurantRequestSchema>
