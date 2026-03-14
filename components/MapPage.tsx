'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useAppStore } from '@/store/useAppStore'
import { useNearbySpecies } from '@/hooks/useNearbySpecies'
import { useRangeSpecies } from '@/hooks/useRangeSpecies'
import { SpeciesCount } from '@/types/species'
import { useEnvironment } from '@/hooks/useEnvironment'
import { TaxonFilter } from '@/components/filters/TaxonFilter'
import { SpeciesPanel } from '@/components/species/SpeciesPanel'
import { SpeciesDetail } from '@/components/species/SpeciesDetail'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { DebugPanel } from '@/components/map/DebugPanel'
import styles from '@/app/page.module.css'

const IS_DEBUG = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'

const MapView = dynamic(
  () => import('@/components/map/MapView').then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className={styles.centerLoader}>
        <LoadingSpinner />
      </div>
    ),
  }
)

export function MapPage() {
  const t = useTranslations()
  const geo = useGeolocation()
  const { debugPosition } = useAppStore()

  const effectiveLat = IS_DEBUG && debugPosition ? debugPosition.lat : geo.lat
  const effectiveLng = IS_DEBUG && debugPosition ? debugPosition.lng : geo.lng

  const { data: observed = [], isLoading, error } = useNearbySpecies(effectiveLat, effectiveLng)
  const { data: ranges = [] } = useRangeSpecies(effectiveLat, effectiveLng)

  const observedIds = new Set(observed.map((s) => s.taxon.id))
  const species: SpeciesCount[] = [
    ...observed.map((s) => ({ ...s, source: 'observed' as const })),
    ...ranges.filter((r) => !observedIds.has(r.taxon.id)),
  ]
  const { data: environment, isLoading: envLoading } = useEnvironment(effectiveLat, effectiveLng)

  return (
    <div className={styles.root}>
      <header className={styles.topBar}>
        <div className={styles.topBarRow}>
          <span className={styles.appName}>{t('app.name')}</span>
          <LanguageSelector />
        </div>
        <TaxonFilter />
      </header>

      <div className={styles.mainArea}>
        <main className={styles.mapArea}>
          {geo.loading && (
            <div className={styles.centerLoader}>
              <LoadingSpinner label={t('loading.location')} />
            </div>
          )}

          {!geo.loading && effectiveLat !== null && effectiveLng !== null && (
            <MapView lat={effectiveLat} lng={effectiveLng} accuracy={geo.accuracy} />
          )}

          {IS_DEBUG && (
            <DebugPanel realLat={geo.lat} realLng={geo.lng} />
          )}

          {geo.error && (
            <p className={styles.geoError}>{geo.error}</p>
          )}

          <SpeciesDetail />
        </main>

        <SpeciesPanel
          species={species}
          loading={isLoading}
          error={error}
          environment={environment}
          environmentLoading={envLoading}
        />
      </div>
    </div>
  )
}
