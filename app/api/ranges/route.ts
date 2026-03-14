import { NextRequest, NextResponse } from 'next/server'
import { fetchSpeciesInRange } from '@/lib/ranges'
import { TaxonGroup } from '@/types/species'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')
  const radiusKm = parseFloat(searchParams.get('radius') ?? '10')
  const groups = searchParams.getAll('groups') as TaxonGroup[]

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  const species = await fetchSpeciesInRange(lat, lng, radiusKm, groups)
  return NextResponse.json(species, {
    headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  })
}
