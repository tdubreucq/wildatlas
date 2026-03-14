import { useQuery } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { fetchTaxonDetail } from '@/lib/inaturalist'
import { Taxon } from '@/types/species'
import { INAT_LOCALE_MAP, Locale } from '@/i18n/routing'

export function useSpeciesDetail(taxonId: number | null) {
  const locale = useLocale() as Locale
  const inatLocale = INAT_LOCALE_MAP[locale] ?? 'en'

  return useQuery<Taxon>({
    queryKey: ['speciesDetail', taxonId, inatLocale],
    queryFn: () => fetchTaxonDetail(taxonId!, inatLocale),
    enabled: taxonId !== null,
    staleTime: 10 * 60 * 1000,
  })
}
