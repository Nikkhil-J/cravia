import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ReviewFormData } from '@/lib/types'

interface ReviewFormState {
  data: ReviewFormData
  activeDishId: string | null
  updateField: <K extends keyof ReviewFormData>(key: K, value: ReviewFormData[K]) => void
  setActiveDishId: (dishId: string | null) => void
  reset: () => void
}

const defaultData: ReviewFormData = {
  dishId: '',
  restaurantId: '',
  photoFile: null,
  photoPreviewUrl: null,
  billFile: null,
  billPreviewUrl: null,
  billUrl: null,
  tasteRating: null,
  portionRating: null,
  valueRating: null,
  tags: [],
  text: '',
}

export const useReviewFormStore = create<ReviewFormState>()(
  persist(
    (set) => ({
      data: defaultData,
      activeDishId: null,
      updateField: (key, value) =>
        set((s) => ({ data: { ...s.data, [key]: value } })),
      setActiveDishId: (dishId: string | null) => set({ activeDishId: dishId }),
      reset: () => set({ data: defaultData, activeDishId: null }),
    }),
    {
      name: 'cravia-review-draft',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        data: {
          dishId: state.data.dishId,
          restaurantId: state.data.restaurantId,
          tasteRating: state.data.tasteRating,
          portionRating: state.data.portionRating,
          valueRating: state.data.valueRating,
          tags: state.data.tags,
          text: state.data.text,
          // photoFile, billFile, photoPreviewUrl, billPreviewUrl, billUrl excluded — File objects cannot be serialized
        },
        activeDishId: state.activeDishId,
      }),
    },
  ),
)
