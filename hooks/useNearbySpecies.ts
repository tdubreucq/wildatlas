import { useQuery } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { fetchSpeciesCounts } from '@/lib/inaturalist'
import { useAppStore } from '@/store/useAppStore'
import { SpeciesCount } from '@/types/species'
import { INAT_LOCALE_MAP, Locale } from '@/i18n/routing'

export function useNearbySpecies(lat: number | null, lng: number | null) {
  const { radiusKm, activeTaxonGroups, filterByCurrentMonth } = useAppStore()
  const locale = useLocale() as Locale
  const inatLocale = INAT_LOCALE_MAP[locale] ?? 'en'
  const month = filterByCurrentMonth ? new Date().getMonth() + 1 : undefined

  return useQuery<SpeciesCount[]>({
    queryKey: ['speciesCounts', lat, lng, radiusKm, activeTaxonGroups, month, inatLocale],
    queryFn: () =>
      fetchSpeciesCounts({
        lat: lat!,
        lng: lng!,
        radiusKm,
        taxonGroups: activeTaxonGroups,
        month,
        locale: inatLocale,
      }),
    enabled: lat !== null && lng !== null,
    staleTime: 5 * 60 * 1000,
  })
}
