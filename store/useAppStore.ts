import { create } from 'zustand'
import { TaxonGroup } from '@/types/species'

interface AppStore {
  radiusKm: number
  setRadiusKm: (r: number) => void

  activeTaxonGroups: TaxonGroup[]
  toggleTaxonGroup: (group: TaxonGroup) => void

  selectedTaxonId: number | null
  setSelectedTaxonId: (id: number | null) => void

  filterByCurrentMonth: boolean
  toggleMonthFilter: () => void

  debugPosition: { lat: number; lng: number } | null
  setDebugPosition: (pos: { lat: number; lng: number } | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
  radiusKm: 10,
  setRadiusKm: (r) => set({ radiusKm: r }),

  activeTaxonGroups: [],
  toggleTaxonGroup: (group) =>
    set((s) => ({
      activeTaxonGroups: s.activeTaxonGroups.includes(group)
        ? s.activeTaxonGroups.filter((g) => g !== group)
        : [...s.activeTaxonGroups, group],
    })),

  selectedTaxonId: null,
  setSelectedTaxonId: (id) => set({ selectedTaxonId: id }),

  filterByCurrentMonth: true,
  toggleMonthFilter: () =>
    set((s) => ({ filterByCurrentMonth: !s.filterByCurrentMonth })),

  debugPosition: null,
  setDebugPosition: (pos) => set({ debugPosition: pos }),
}))
