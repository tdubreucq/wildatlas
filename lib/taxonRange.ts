/**
 * Fetch the range polygon for a single taxon from iNaturalist's public S3.
 * URL pattern: .../geomodel/geojsons/latest/{taxon_id}.geojson
 *
 * Called client-side (browser) — no auth required, the bucket is public.
 */

const INAT_GEOJSON_BASE =
  'https://inaturalist-open-data.s3.us-east-1.amazonaws.com/geomodel/geojsons/latest'

export async function fetchTaxonRangeGeoJSON(
  taxonId: number
): Promise<GeoJSON.Feature | null> {
  const res = await fetch(`${INAT_GEOJSON_BASE}/${taxonId}.geojson`)
  if (!res.ok) return null
  return res.json()
}
