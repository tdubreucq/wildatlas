/**
 * Server-only — ne pas importer côté client.
 *
 * Interroge les fichiers FlatGeobuf hébergés sur Cloudflare R2 (bucket privé)
 * via des presigned URLs S3 générées à la volée. Le client ne voit jamais
 * les credentials ni les URLs R2.
 *
 * Env vars requises (server-side, sans NEXT_PUBLIC_) :
 *   CF_ACCOUNT_ID
 *   CF_R2_ACCESS_KEY_ID
 *   CF_R2_SECRET_ACCESS_KEY
 */
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { geojson } from 'flatgeobuf'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'
import rewind from '@turf/rewind'
import { RangeSpecies, TaxonGroup } from '@/types/species'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = 'wildatlas-ranges'

/** Clé R2 pour chaque groupe taxonomique */
const GROUP_KEYS: Partial<Record<TaxonGroup, string>> = {
  Aves:           'Aves.fgb',
  Mammalia:       'Mammalia.fgb',
  Reptilia:       'Reptilia.fgb',
  Amphibia:       'Amphibia.fgb',
  Actinopterygii: 'Actinopterygii.fgb',
  Insecta:        'Insecta.fgb',
  Arachnida:      'Arachnida.fgb',
  Mollusca:       'Mollusca.fgb',
  Plantae:        'Plantae.fgb',
  Fungi:          'Fungi.fgb',
}

async function presignedUrl(key: string): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: 60 } // 60s suffisent pour la query serveur
  )
}

async function queryGroup(
  key: string,
  group: TaxonGroup,
  lat: number,
  lng: number,
  rect: { minX: number; minY: number; maxX: number; maxY: number }
): Promise<RangeSpecies[]> {
  const url = await presignedUrl(key)
  const userPoint = point([lng, lat]) // turf : [lon, lat]
  const results: RangeSpecies[] = []
  const seen = new Set<number>()

  let candidateCount = 0
  let firstFeatureLogged = false
  try {
    for await (const feature of geojson.deserialize(url, rect)) {
      candidateCount++
      if (!firstFeatureLogged) {
        firstFeatureLogged = true
        console.log(`[ranges] ${group} SCHEMA props=`, JSON.stringify(feature.properties), 'geom=', feature.geometry?.type)
      }
      if (!feature.geometry) continue
      // Ignorer les géométries non-polygonales
      const gType = feature.geometry.type
      if (gType !== 'Polygon' && gType !== 'MultiPolygon') continue
      // Normaliser l'ordre d'enroulement (RFC 7946) avant le test pip.
      const featurePoly = feature as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>
      const normalised = rewind(featurePoly, { reverse: false, mutate: false })
      const beforeRewind = booleanPointInPolygon(userPoint, featurePoly)
      const afterRewind = booleanPointInPolygon(userPoint, normalised)
      if (beforeRewind !== afterRewind) {
        const p2 = feature.properties as Record<string, unknown>
        console.log(`[ranges] rewind changed pip for taxon_id=${p2.taxon_id}: ${beforeRewind}→${afterRewind}`)
      }
      if (!afterRewind) continue
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
  } catch (err) {
    console.warn(`[ranges] Failed to query ${group}:`, err)
  }
  console.log(
    `[ranges] ${group}: ${candidateCount} candidats FGB → ${results.length} après pip`,
    results.length > 0 ? `[taxon_ids: ${results.map(r => r.taxon_id).join(', ')}]` : ''
  )

  return results
}

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

  const groupsToQuery = (
    taxonGroups.length > 0 ? taxonGroups : Object.keys(GROUP_KEYS) as TaxonGroup[]
  ).filter((g) => GROUP_KEYS[g])

  const results = await Promise.all(
    groupsToQuery.map((g) => queryGroup(GROUP_KEYS[g]!, g, lat, lng, rect))
  )

  return results.flat()
}
