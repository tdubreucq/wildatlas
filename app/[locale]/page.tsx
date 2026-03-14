import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { MapPage } from '@/components/MapPage'
import { fetchSpeciesCounts } from '@/lib/inaturalist'
import { INAT_LOCALE_MAP, Locale } from '@/i18n/routing'

// Coordonnées Paris arrondies à 2 décimales (même arrondi que le client)
const FALLBACK_LAT = 48.86
const FALLBACK_LNG = 2.35

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const inatLocale = INAT_LOCALE_MAP[locale as Locale] ?? 'en'
  const month = new Date().getMonth() + 1

  const queryClient = new QueryClient()

  // Précharge la liste d'espèces avec les coords Paris par défaut.
  // La clé doit correspondre exactement à celle de useNearbySpecies :
  // ['speciesCounts', rLat, rLng, radiusKm, activeTaxonGroups, month, inatLocale]
  await queryClient.prefetchQuery({
    queryKey: ['speciesCounts', FALLBACK_LAT, FALLBACK_LNG, 10, [], month, inatLocale],
    queryFn: () =>
      fetchSpeciesCounts({
        lat: FALLBACK_LAT,
        lng: FALLBACK_LNG,
        radiusKm: 10,
        taxonGroups: [],
        month,
        locale: inatLocale,
      }),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MapPage />
    </HydrationBoundary>
  )
}
