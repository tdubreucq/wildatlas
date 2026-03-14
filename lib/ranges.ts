/**
 * FlatGeobuf range query for iNaturalist range maps.
 *
 * iNaturalist distributes species range maps as static files:
 *   https://www.inaturalist.org/pages/range_maps
 *
 * The CI workflow (.github/workflows/update-ranges.yml) downloads the source
 * GPKG files weekly, merges multi-part groups (e.g. Insects × 8 files),
 * converts each to FlatGeobuf, and uploads to Cloudflare R2.
 *
 * One .fgb per taxon group → the client only fetches bytes for active groups.
 *
 * Env vars (set in .env.local and your hosting platform):
 *   NEXT_PUBLIC_RANGES_AVES
 *   NEXT_PUBLIC_RANGES_MAMMALIA
 *   NEXT_PUBLIC_RANGES_REPTILIA
 *   NEXT_PUBLIC_RANGES_AMPHIBIA
 *   NEXT_PUBLIC_RANGES_ACTINOPTERYGII
 *   NEXT_PUBLIC_RANGES_INSECTA
 *   NEXT_PUBLIC_RANGES_ARACHNIDA
 *   NEXT_PUBLIC_RANGES_MOLLUSCA
 */
import { geojson } from 'flatgeobuf'
import { TaxonGroup } from '@/types/species'

/** Maps TaxonGroup to its R2-hosted .fgb URL (via env vars) */
const RANGES_URLS: Partial<Record<TaxonGroup, string>> = {
  Aves:            process.env.NEXT_PUBLIC_RANGES_AVES            ?? '',
  Mammalia:        process.env.NEXT_PUBLIC_RANGES_MAMMALIA         ?? '',
  Reptilia:        process.env.NEXT_PUBLIC_RANGES_REPTILIA         ?? '',
  Amphibia:        process.env.NEXT_PUBLIC_RANGES_AMPHIBIA         ?? '',
  Actinopterygii:  process.env.NEXT_PUBLIC_RANGES_ACTINOPTERYGII   ?? '',
  Insecta:         process.env.NEXT_PUBLIC_RANGES_INSECTA          ?? '',
  Arachnida:       process.env.NEXT_PUBLIC_RANGES_ARACHNIDA        ?? '',
  Mollusca:        process.env.NEXT_PUBLIC_RANGES_MOLLUSCA         ?? '',
}

export interface RangeSpecies {
  taxon_id: number
  scientific_name: string
  iconic_taxon_name: TaxonGroup
}

/**
 * Queries FlatGeobuf files for the given taxon groups (or all configured
 * groups if none specified) and returns species whose range intersects
 * the bounding box around the given point.
 *
 * Each group file is queried in parallel; only the bytes covering the
 * bbox are fetched via HTTP Range requests.
 */
export async function fetchSpeciesInRange(
  lat: number,
  lng: number,
  radiusKm = 10,
  taxonGroups: TaxonGroup[] = []
): Promise<RangeSpecies[]> {
  const deg = radiusKm / 111
  const rect = {
    minX: lng - deg,
    minY: lat - deg,
    maxX: lng + deg,
    maxY: lat + deg,
  }

  // Determine which groups to query
  const groupsToQuery = (
    taxonGroups.length > 0 ? taxonGroups : Object.keys(RANGES_URLS) as TaxonGroup[]
  ).filter((g) => !!RANGES_URLS[g])

  if (groupsToQuery.length === 0) return []

  const results = await Promise.all(
    groupsToQuery.map((group) => queryGroup(RANGES_URLS[group]!, group, rect))
  )

  return results.flat()
}

async function queryGroup(
  url: string,
  group: TaxonGroup,
  rect: { minX: number; minY: number; maxX: number; maxY: number }
): Promise<RangeSpecies[]> {
  const results: RangeSpecies[] = []
  const seen = new Set<number>()

  try {
    for await (const feature of geojson.deserialize(url, rect)) {
      const p = feature.properties as Record<string, unknown>
      const taxon_id = p.taxon_id as number
      if (!taxon_id || seen.has(taxon_id)) continue
      seen.add(taxon_id)
      results.push({
        taxon_id,
        scientific_name: (p.name ?? '') as string,
        iconic_taxon_name: group,
      })
    }
  } catch {
    // Group file unavailable — degrade gracefully
    console.warn(`[ranges] Failed to query ${group}:`, url)
  }

  return results
}
