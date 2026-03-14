import { Observation, SpeciesCount, Taxon, TaxonGroup } from '@/types/species'

const INAT_BASE = 'https://api.inaturalist.org/v1'
const HEADERS = { 'User-Agent': 'WildAtlas/0.1' }

export interface NearbySpeciesParams {
  lat: number
  lng: number
  radiusKm?: number
  taxonGroups?: string[]
  month?: number
  perPage?: number
  locale?: string
}

export async function fetchSpeciesCounts(
  params: NearbySpeciesParams
): Promise<SpeciesCount[]> {
  const { lat, lng, radiusKm = 10, taxonGroups = [], month, perPage = 50, locale = 'en' } =
    params

  const searchParams = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radius: radiusKm.toString(),
    taxon_id: '1',
    quality_grade: 'research',
    per_page: perPage.toString(),
    locale,
  })

  if (taxonGroups.length > 0) {
    taxonGroups.forEach((g) => searchParams.append('iconic_taxa[]', g))
  }
  if (month) searchParams.set('month', month.toString())

  const res = await fetch(
    `${INAT_BASE}/observations/species_counts?${searchParams}`,
    { headers: HEADERS }
  )
  if (!res.ok) throw new Error(`iNaturalist species_counts error: ${res.status}`)
  const data = await res.json()

  return (data.results as unknown[]).map((r) => {
    const result = r as { count: number; taxon: Record<string, unknown> }
    return { count: result.count, taxon: transformTaxon(result.taxon) }
  })
}

export async function fetchTaxonDetail(taxonId: number, locale = 'en'): Promise<Taxon> {
  const res = await fetch(
    `${INAT_BASE}/taxa/${taxonId}?locale=${locale}`,
    { headers: HEADERS }
  )
  if (!res.ok) throw new Error(`iNaturalist taxa error: ${res.status}`)
  const data = await res.json()
  return transformTaxon(data.results[0])
}

export async function fetchNearbySpecies(
  params: NearbySpeciesParams
): Promise<Observation[]> {
  const { lat, lng, radiusKm = 10, taxonGroups = [], month, perPage = 50, locale = 'en' } =
    params

  const searchParams = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radius: radiusKm.toString(),
    taxon_id: '1',
    quality_grade: 'research',
    per_page: perPage.toString(),
    order: 'desc',
    order_by: 'observed_on',
    locale,
  })

  if (taxonGroups.length > 0) {
    taxonGroups.forEach((g) => searchParams.append('iconic_taxa[]', g))
  }
  if (month) searchParams.set('month', month.toString())

  const res = await fetch(`${INAT_BASE}/observations?${searchParams}`, {
    headers: HEADERS,
  })
  if (!res.ok) throw new Error(`iNaturalist API error: ${res.status}`)
  const data = await res.json()
  return (data.results as unknown[]).flatMap(transformObservation)
}

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

function transformObservation(raw: unknown): Observation[] {
  const r = raw as Record<string, unknown>
  if (!r.taxon || !r.location) return []
  const parts = (r.location as string).split(',').map(Number)
  if (parts.length < 2 || parts.some(isNaN)) return []
  const [lat, lng] = parts
  return [
    {
      id: r.id as number,
      taxon: transformTaxon(r.taxon as Record<string, unknown>),
      location: [lat, lng],
      observed_on: r.observed_on as string,
      quality_grade: r.quality_grade as Observation['quality_grade'],
      photos: ((r.photos as unknown[]) ?? []).map(transformPhoto),
    },
  ]
}

function transformTaxon(raw: Record<string, unknown>): Taxon {
  const photo = raw.default_photo as Record<string, unknown> | undefined
  const status = raw.conservation_status as Record<string, unknown> | undefined
  return {
    id: raw.id as number,
    name: raw.name as string,
    preferred_common_name: raw.preferred_common_name as string | undefined,
    iconic_taxon_name: (raw.iconic_taxon_name as TaxonGroup) ?? 'Animalia',
    conservation_status: status?.status_name as string | undefined,
    default_photo: photo ? transformPhoto(photo) : undefined,
    wikipedia_url: raw.wikipedia_url as string | undefined,
    ancestry: (raw.ancestry as string) ?? '',
  }
}

function transformPhoto(raw: unknown): { url: string; attribution: string } {
  const p = raw as Record<string, unknown>
  return { url: p.url as string, attribution: (p.attribution as string) ?? '' }
}

export function thumbUrl(
  url: string | undefined,
  size: 'square' | 'small' | 'medium' = 'small'
): string | undefined {
  if (!url) return undefined
  return url.replace(/\/(square|small|medium|large|original)\./, `/${size}.`)
}
