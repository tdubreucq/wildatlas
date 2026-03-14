import { useQuery } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { SpeciesCount } from '@/types/species'
import { INAT_LOCALE_MAP, Locale } from '@/i18n/routing'

const round = (n: number) => Math.round(n * 100) / 100

export function useRangeSpecies(lat: number | null, lng: number | null) {
  const { radiusKm, activeTaxonGroups } = useAppStore()
  const locale = useLocale() as Locale
  const inatLocale = INAT_LOCALE_MAP[locale] ?? 'en'

  const rLat = lat !== null ? round(lat) : null
  const rLng = lng !== null ? round(lng) : null

  return useQuery<SpeciesCount[]>({
    queryKey: ['speciesRanges', rLat, rLng, radiusKm, activeTaxonGroups, inatLocale],
    queryFn: async () => {
      const params = new URLSearchParams({
        lat: rLat!.toString(),
        lng: rLng!.toString(),
        radius: radiusKm.toString(),
        locale: inatLocale,
      })
      activeTaxonGroups.forEach((g) => params.append('groups', g))

      const res = await fetch(`/api/ranges?${params}`)
      if (!res.ok) throw new Error('Range query failed')
      return res.json()
    },
    enabled: rLat !== null && rLng !== null,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  })
}
