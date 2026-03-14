import { useQuery } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { fetchSpeciesCounts } from '@/lib/inaturalist'
import { useAppStore } from '@/store/useAppStore'
import { SpeciesCount } from '@/types/species'
import { INAT_LOCALE_MAP, Locale } from '@/i18n/routing'

// Arrondi à 2 décimales ≈ 1 km — évite les refetch sur chaque update GPS
const round = (n: number) => Math.round(n * 100) / 100

export function useNearbySpecies(lat: number | null, lng: number | null) {
  const { radiusKm, activeTaxonGroups, filterByCurrentMonth } = useAppStore()
  const locale = useLocale() as Locale
  const inatLocale = INAT_LOCALE_MAP[locale] ?? 'en'
  const month = filterByCurrentMonth ? new Date().getMonth() + 1 : undefined

  const rLat = lat !== null ? round(lat) : null
  const rLng = lng !== null ? round(lng) : null

  return useQuery<SpeciesCount[]>({
    queryKey: ['speciesCounts', rLat, rLng, radiusKm, activeTaxonGroups, month, inatLocale],
    queryFn: () =>
      fetchSpeciesCounts({
        lat: rLat!,
        lng: rLng!,
        radiusKm,
        taxonGroups: activeTaxonGroups,
        month,
        locale: inatLocale,
      }),
    enabled: lat !== null && lng !== null,
    staleTime: 5 * 60 * 1000,
  })
}
