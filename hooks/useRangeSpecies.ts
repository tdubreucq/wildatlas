import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { fetchSpeciesInRange } from '@/lib/ranges'
import { RangeSpecies } from '@/types/species'

const RANGES_URL = process.env.NEXT_PUBLIC_INAT_RANGES_URL ?? ''

export function useRangeSpecies(lat: number | null, lng: number | null) {
  const { radiusKm, activeTaxonGroups } = useAppStore()

  return useQuery<RangeSpecies[]>({
    queryKey: ['speciesRanges', lat, lng, radiusKm, activeTaxonGroups],
    queryFn: () => fetchSpeciesInRange(lat!, lng!, radiusKm, activeTaxonGroups),
    enabled: lat !== null && lng !== null && !!RANGES_URL,
    staleTime: 60 * 60 * 1000, // 1h — range data changes rarely
    gcTime: 2 * 60 * 60 * 1000,
  })
}
