import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedHospital {
  id: string;
  name: string;
  city?: string;
  state?: string;
  rating_overall?: number;
}

interface SavedState {
  savedReviewIds: string[];
  savedHospitals: SavedHospital[];
  toggleReview: (reviewId: string) => void;
  isReviewSaved: (reviewId: string) => boolean;
  addHospital: (hospital: SavedHospital) => void;
  removeHospital: (hospitalId: string) => void;
  isHospitalSaved: (hospitalId: string) => boolean;
  clearAll: () => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedReviewIds: [],
      savedHospitals: [],

      toggleReview: (reviewId: string) => {
        const { savedReviewIds } = get();
        if (savedReviewIds.includes(reviewId)) {
          set({ savedReviewIds: savedReviewIds.filter(id => id !== reviewId) });
        } else {
          set({ savedReviewIds: [...savedReviewIds, reviewId] });
        }
      },

      isReviewSaved: (reviewId: string) => get().savedReviewIds.includes(reviewId),

      addHospital: (hospital: SavedHospital) => {
        const { savedHospitals } = get();
        if (!savedHospitals.some(h => h.id === hospital.id)) {
          set({ savedHospitals: [...savedHospitals, hospital] });
        }
      },

      removeHospital: (hospitalId: string) => {
        set({ savedHospitals: get().savedHospitals.filter(h => h.id !== hospitalId) });
      },

      isHospitalSaved: (hospitalId: string) =>
        get().savedHospitals.some(h => h.id === hospitalId),

      clearAll: () => set({ savedReviewIds: [], savedHospitals: [] }),
    }),
    {
      name: 'rate-my-hospitals-saved',
      partialize: (state) => ({
        savedReviewIds: state.savedReviewIds,
        savedHospitals: state.savedHospitals,
      }),
    }
  )
);
