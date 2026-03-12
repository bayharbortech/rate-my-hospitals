import { create } from 'zustand';

interface EmployerFiltersState {
  searchQuery: string;
  sortBy: string;
  showFilters: boolean;
  selectedSpecialties: string[];
  magnetOnly: boolean;
  unionOnly: boolean;
  newGradOnly: boolean;
  selectedShifts: string[];
  minPay: number;

  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  setShowFilters: (show: boolean) => void;
  toggleSpecialty: (specialty: string) => void;
  setMagnetOnly: (val: boolean) => void;
  setUnionOnly: (val: boolean) => void;
  setNewGradOnly: (val: boolean) => void;
  toggleShift: (shift: string) => void;
  setMinPay: (val: number) => void;
  clearAll: () => void;
  hasActiveFilters: () => boolean;
}

export const useEmployerFiltersStore = create<EmployerFiltersState>((set, get) => ({
  searchQuery: '',
  sortBy: 'rating',
  showFilters: false,
  selectedSpecialties: [],
  magnetOnly: false,
  unionOnly: false,
  newGradOnly: false,
  selectedShifts: [],
  minPay: 0,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setShowFilters: (show) => set({ showFilters: show }),

  toggleSpecialty: (specialty) => {
    const { selectedSpecialties } = get();
    set({
      selectedSpecialties: selectedSpecialties.includes(specialty)
        ? selectedSpecialties.filter(s => s !== specialty)
        : [...selectedSpecialties, specialty],
    });
  },

  setMagnetOnly: (val) => set({ magnetOnly: val }),
  setUnionOnly: (val) => set({ unionOnly: val }),
  setNewGradOnly: (val) => set({ newGradOnly: val }),

  toggleShift: (shift) => {
    const { selectedShifts } = get();
    set({
      selectedShifts: selectedShifts.includes(shift)
        ? selectedShifts.filter(s => s !== shift)
        : [...selectedShifts, shift],
    });
  },

  setMinPay: (val) => set({ minPay: val }),

  clearAll: () => set({
    selectedSpecialties: [],
    magnetOnly: false,
    unionOnly: false,
    newGradOnly: false,
    selectedShifts: [],
    minPay: 0,
    searchQuery: '',
  }),

  hasActiveFilters: () => {
    const s = get();
    return s.selectedSpecialties.length > 0 || s.magnetOnly || s.unionOnly ||
      s.newGradOnly || s.selectedShifts.length > 0 || s.minPay > 0;
  },
}));
