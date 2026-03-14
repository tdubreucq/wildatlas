'use client'

import { useTranslations } from 'next-intl'
import { SpeciesCount } from '@/types/species'
import { Environment } from '@/lib/overpass'
import { useAppStore } from '@/store/useAppStore'
import { SpeciesCard } from './SpeciesCard'
import { EnvironmentBadge } from '@/components/environment/EnvironmentBadge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import styles from './SpeciesPanel.module.css'

interface Props {
  species: SpeciesCount[]
  loading: boolean
  error?: Error | null
  environment: Environment | undefined
  environmentLoading?: boolean
}

export function SpeciesPanel({
  species,
  loading,
  error,
  environment,
  environmentLoading,
}: Props) {
  const t = useTranslations('panel')
  const { selectedTaxonId, setSelectedTaxonId } = useAppStore()

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.title}>{t('title')}</span>
          {!loading && (
            <span className={styles.count}>
              {t('speciesCount', { count: species.length })}
            </span>
          )}
        </div>

        <EnvironmentBadge
          environment={environment}
          loading={environmentLoading}
        />

        {!loading && !error && species.length > 0 && (
          <p className={styles.subtitle}>{t('subtitle')}</p>
        )}
      </div>

      <div className={styles.list}>
        {loading && <LoadingSpinner label={t('title')} />}

        {error && (
          <p className={styles.emptyState} style={{ color: 'crimson' }}>
            {t('error')}
          </p>
        )}

        {!loading && !error && species.length === 0 && (
          <p className={styles.emptyState}>{t('empty')}</p>
        )}

        {species.map((s) => (
          <SpeciesCard
            key={s.taxon.id}
            speciesCount={s}
            selected={selectedTaxonId === s.taxon.id}
            onClick={() =>
              setSelectedTaxonId(selectedTaxonId === s.taxon.id ? null : s.taxon.id)
            }
          />
        ))}
      </div>
    </aside>
  )
}
