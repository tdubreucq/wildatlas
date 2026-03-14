import { useTranslations } from 'next-intl'
import { TAXON_CONFIG, TaxonGroup } from '@/types/species'

const KNOWN_GROUPS = new Set(Object.keys(TAXON_CONFIG))

/**
 * Returns a translated label for a taxon group.
 * Falls back to the raw group name if the key is not in messages
 * (handles unexpected iNaturalist iconic taxa like Chromista, Protozoa, etc.)
 */
export function useGroupLabel() {
  const t = useTranslations('filters.groups')

  return (group: string): string => {
    if (KNOWN_GROUPS.has(group)) {
      return t(group as TaxonGroup)
    }
    // Unknown group — return as-is (scientific name is readable)
    return group
  }
}
