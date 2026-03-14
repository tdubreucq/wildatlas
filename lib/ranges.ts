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
  rect: { minX: number; minY: number; maxX: number; maxY: number }
): Promise<RangeSpecies[]> {
  const url = await presignedUrl(key)
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
  } catch (err) {
    console.warn(`[ranges] Failed to query ${group}:`, err)
  }

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
    groupsToQuery.map((g) => queryGroup(GROUP_KEYS[g]!, g, rect))
  )

  return results.flat()
}
