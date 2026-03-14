const GBIF_BASE = 'https://api.gbif.org/v1'

export interface GbifParams {
  lat: number
  lng: number
  radiusKm?: number
  limit?: number
}

/**
 * Fetch animal occurrences from GBIF within a bounding box derived from a
 * center point and radius. Used as a fallback for zones with sparse iNat data.
 */
export async function fetchGbifOccurrences(params: GbifParams) {
  const { lat, lng, radiusKm = 10, limit = 50 } = params

  // Approximate degree offset for bounding box (1° lat ≈ 111 km)
  const delta = radiusKm / 111

  const searchParams = new URLSearchParams({
    decimalLatitude: `${lat - delta},${lat + delta}`,
    decimalLongitude: `${lng - delta},${lng + delta}`,
    kingdom: 'Animalia',
    limit: limit.toString(),
    hasCoordinate: 'true',
    hasGeospatialIssue: 'false',
  })

  const res = await fetch(`${GBIF_BASE}/occurrence/search?${searchParams}`)
  if (!res.ok) throw new Error(`GBIF API error: ${res.status}`)
  return res.json()
}
