'use client'

import { useTranslations } from 'next-intl'
import { TAXON_GROUPS, TAXON_CONFIG, TaxonGroup } from '@/types/species'
import { useAppStore } from '@/store/useAppStore'
import styles from './TaxonFilter.module.css'

export function TaxonFilter() {
  const t = useTranslations('filters')
  const { activeTaxonGroups, toggleTaxonGroup, filterByCurrentMonth, toggleMonthFilter } =
    useAppStore()

  return (
    <div className={styles.bar}>
      {TAXON_GROUPS.map((group: TaxonGroup) => {
        const cfg = TAXON_CONFIG[group]
        const isActive = activeTaxonGroups.includes(group)
        return (
          <button
            key={group}
            className={`${styles.chip} ${isActive ? styles.active : ''}`}
            style={
              isActive
                ? { background: cfg.bgColor, color: cfg.color, borderColor: cfg.color }
                : { color: 'var(--color-text-muted)' }
            }
            onClick={() => toggleTaxonGroup(group)}
            aria-pressed={isActive}
          >
            {t(`groups.${group}`)}
          </button>
        )
      })}

      <button
        className={`${styles.chip} ${filterByCurrentMonth ? styles.active : ''}`}
        style={
          filterByCurrentMonth
            ? { background: '#fff3cd', color: '#5a3d00', borderColor: '#5a3d00' }
            : { color: 'var(--color-text-muted)' }
        }
        onClick={toggleMonthFilter}
        aria-pressed={filterByCurrentMonth}
      >
        {t('thisMonth')}
      </button>
    </div>
  )
}
