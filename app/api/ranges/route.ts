import { NextRequest, NextResponse } from 'next/server'
import { fetchSpeciesInRange } from '@/lib/ranges'
import { fetchTaxonBatch } from '@/lib/inaturalist'
import { SpeciesCount, TaxonGroup } from '@/types/species'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')
  const radiusKm = parseFloat(searchParams.get('radius') ?? '10')
  const groups = searchParams.getAll('groups') as TaxonGroup[]
  const locale = searchParams.get('locale') ?? 'en'

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  const rangeSpecies = await fetchSpeciesInRange(lat, lng, radiusKm, groups)

  // Enrich with photos + common names via iNat batch call
  const taxa = await fetchTaxonBatch(rangeSpecies.map((r) => r.taxon_id), locale)
  const taxonMap = new Map(taxa.map((t) => [t.id, t]))

  const enriched: SpeciesCount[] = rangeSpecies.map((r) => ({
    count: 0,
    source: 'range',
    taxon: taxonMap.get(r.taxon_id) ?? {
      id: r.taxon_id,
      name: r.scientific_name,
      preferred_common_name: undefined,
      iconic_taxon_name: r.iconic_taxon_name,
      conservation_status: undefined,
      default_photo: undefined,
      wikipedia_url: undefined,
      ancestry: '',
    },
  }))

  return NextResponse.json(enriched, {
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  })
}
