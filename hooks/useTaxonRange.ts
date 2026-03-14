import { useQuery } from '@tanstack/react-query'
import { fetchTaxonRangeGeoJSON } from '@/lib/taxonRange'

export function useTaxonRange(taxonId: number | null) {
  return useQuery<GeoJSON.Feature | null>({
    queryKey: ['taxonRange', taxonId],
    queryFn: () => fetchTaxonRangeGeoJSON(taxonId!),
    enabled: taxonId !== null,
    staleTime: 24 * 60 * 60 * 1000, // 24h — un polygone change très rarement
    gcTime: 48 * 60 * 60 * 1000,
  })
}
