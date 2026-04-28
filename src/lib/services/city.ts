import { CITY_AREAS, GURUGRAM, SUPPORTED_CITIES, type City } from '@/lib/constants'

export { GURUGRAM }

export function isSupportedCity(value: string | null | undefined): value is City {
  return (SUPPORTED_CITIES as readonly string[]).includes(value ?? '')
}

export function resolveCity(_options?: {
  requestedCity?: string | null
  userCity?: string | null
  fallbackCity?: City
}): City {
  return GURUGRAM
}

export function listCityAreas(city: City): readonly string[] {
  return CITY_AREAS[city] ?? []
}
