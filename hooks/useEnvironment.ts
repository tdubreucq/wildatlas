import { useQuery } from '@tanstack/react-query'
import { detectEnvironment, Environment } from '@/lib/overpass'

export function useEnvironment(lat: number | null, lng: number | null) {
  return useQuery<Environment>({
    queryKey: ['environment', Math.round((lat ?? 0) * 1000), Math.round((lng ?? 0) * 1000)],
    queryFn: () => detectEnvironment(lat!, lng!),
    enabled: lat !== null && lng !== null,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}
