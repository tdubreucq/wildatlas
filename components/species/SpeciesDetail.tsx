'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useSpeciesDetail } from '@/hooks/useSpeciesDetail'
import { useAppStore } from '@/store/useAppStore'
import { useGroupLabel } from '@/hooks/useGroupLabel'
import { TAXON_CONFIG } from '@/types/species'
import { thumbUrl } from '@/lib/inaturalist'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import styles from './SpeciesDetail.module.css'

export function SpeciesDetail() {
  const t = useTranslations('detail')
  const groupLabel = useGroupLabel()
  const locale = useLocale()
  const { selectedTaxonId, setSelectedTaxonId } = useAppStore()
  const { data: taxon, isLoading, error } = useSpeciesDetail(selectedTaxonId)

  if (selectedTaxonId === null) return null

  const cfg = taxon
    ? TAXON_CONFIG[taxon.iconic_taxon_name] ?? TAXON_CONFIG['Animalia']
    : null

  const photo = thumbUrl(taxon?.default_photo?.url, 'medium')

  return (
    <div className={styles.overlay} onClick={() => setSelectedTaxonId(null)}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>
            {taxon?.preferred_common_name ?? taxon?.name ?? '…'}
          </span>
          <button
            className={styles.closeBtn}
            onClick={() => setSelectedTaxonId(null)}
            aria-label={t('close')}
          >
            ×
          </button>
        </div>

        {isLoading && (
          <div className={styles.loading}>
            <LoadingSpinner label={t('close')} />
          </div>
        )}

        {error && (
          <div className={styles.body}>
            <p style={{ color: 'crimson' }}>{t('error', { message: String(error) })}</p>
          </div>
        )}

        {taxon && cfg && (
          <>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={taxon.name} className={styles.hero} />
            ) : (
              <div
                className={styles.heroPlaceholder}
                style={{ background: cfg.bgColor, color: cfg.color }}
              >
                {groupLabel(taxon.iconic_taxon_name)}
              </div>
            )}

            <div className={styles.body}>
              <div className={styles.names}>
                <h2 className={styles.commonName}>
                  {taxon.preferred_common_name ?? taxon.name}
                </h2>
                <p className={styles.sciName}>{taxon.name}</p>
              </div>

              <div className={styles.badges}>
                <span
                  className={styles.badge}
                  style={{ background: cfg.bgColor, color: cfg.color }}
                >
                  {groupLabel(taxon.iconic_taxon_name)}
                </span>
                {taxon.conservation_status && (
                  <span
                    className={styles.badge}
                    style={{ background: '#ffe4d6', color: '#5c1a00' }}
                  >
                    {taxon.conservation_status.toUpperCase()}
                  </span>
                )}
              </div>

              {taxon.wikipedia_url && (
                <div className={styles.section}>
                  <p className={styles.sectionTitle}>{t('learnMore')}</p>
                  <a
                    href={taxon.wikipedia_url}
                    className={styles.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('wikipedia')}
                  </a>
                </div>
              )}

              <div className={styles.section}>
                <Link
                  href={`/${locale}/species/${taxon.id}`}
                  className={styles.link}
                  onClick={() => setSelectedTaxonId(null)}
                >
                  {t('fullSheet')}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
