import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { RangeSpecies } from '@/types/species'

const round = (n: number) => Math.round(n * 100) / 100

export function useRangeSpecies(lat: number | null, lng: number | null) {
  const { radiusKm, activeTaxonGroups } = useAppStore()

  const rLat = lat !== null ? round(lat) : null
  const rLng = lng !== null ? round(lng) : null

  return useQuery<RangeSpecies[]>({
    queryKey: ['speciesRanges', rLat, rLng, radiusKm, activeTaxonGroups],
    queryFn: async () => {
      const params = new URLSearchParams({
        lat: rLat!.toString(),
        lng: rLng!.toString(),
        radius: radiusKm.toString(),
      })
      activeTaxonGroups.forEach((g) => params.append('groups', g))

      const res = await fetch(`/api/ranges?${params}`)
      if (!res.ok) throw new Error('Range query failed')
      return res.json()
    },
    enabled: lat !== null && lng !== null,
    staleTime: 60 * 60 * 1000,   // 1h — les aires bougent rarement
    gcTime: 2 * 60 * 60 * 1000,
  })
}
