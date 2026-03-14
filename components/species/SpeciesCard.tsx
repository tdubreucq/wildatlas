'use client'

import { useTranslations } from 'next-intl'
import { SpeciesCount, TAXON_CONFIG } from '@/types/species'
import { useGroupLabel } from '@/hooks/useGroupLabel'
import { thumbUrl } from '@/lib/inaturalist'
import styles from './SpeciesCard.module.css'

interface Props {
  speciesCount: SpeciesCount
  selected?: boolean
  onClick: () => void
}

export function SpeciesCard({ speciesCount, selected, onClick }: Props) {
  const t = useTranslations('panel')
  const groupLabel = useGroupLabel()
  const { taxon, count } = speciesCount
  const cfg = TAXON_CONFIG[taxon.iconic_taxon_name] ?? TAXON_CONFIG['Animalia']
  const photo = thumbUrl(taxon.default_photo?.url, 'square')

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={taxon.name} className={styles.thumb} />
      ) : (
        <div
          className={styles.thumbPlaceholder}
          style={{ background: cfg.bgColor, color: cfg.color }}
        >
          {cfg.abbr}
        </div>
      )}

      <div className={styles.info}>
        <div className={styles.commonName}>
          {taxon.preferred_common_name ?? taxon.name}
        </div>
        <div className={styles.sciName}>{taxon.name}</div>
        <div className={styles.meta}>
          <span
            className={styles.groupBadge}
            style={{ background: cfg.bgColor, color: cfg.color }}
          >
            {groupLabel(taxon.iconic_taxon_name)}
          </span>
          <span className={styles.count}>{t('observations', { count })}</span>
        </div>
      </div>

      <svg className={styles.chevron} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
