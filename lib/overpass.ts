const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

/** Internal key — used as translation key via t(`environment.${type}`) */
export type EnvironmentType =
  | 'Forest'
  | 'Urban'
  | 'Wetland'
  | 'Park'
  | 'Countryside'
  | 'Coastal'
  | 'Mixed'

export interface Environment {
  type: EnvironmentType
  dominantTag: string | null
}

export const ENVIRONMENT_CONFIG: Record<
  EnvironmentType,
  { color: string; bgColor: string }
> = {
  Forest:      { color: '#1b4332', bgColor: '#d8f3dc' },
  Urban:       { color: '#374151', bgColor: '#e5e7eb' },
  Wetland:     { color: '#0d5c63', bgColor: '#c7f9f9' },
  Park:        { color: '#3a5c00', bgColor: '#d9f0b0' },
  Countryside: { color: '#5a3d00', bgColor: '#fff3cd' },
  Coastal:     { color: '#0a4a7a', bgColor: '#d6eeff' },
  Mixed:       { color: '#4b5563', bgColor: '#f3f4f6' },
}

export async function detectEnvironment(
  lat: number,
  lng: number,
  radiusM = 600
): Promise<Environment> {
  const query = `[out:json][timeout:10];
(
  way["landuse"](around:${radiusM},${lat},${lng});
  way["natural"](around:${radiusM},${lat},${lng});
  way["leisure"](around:${radiusM},${lat},${lng});
);
out tags;`

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  })

  if (!res.ok) throw new Error(`Overpass error: ${res.status}`)
  const data = await res.json()
  return classifyEnvironment(data.elements ?? [])
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

const RULES: Array<{ pattern: RegExp; type: EnvironmentType }> = [
  { pattern: /^natural=wood$|^landuse=forest$/,                                        type: 'Forest' },
  { pattern: /^natural=wetland$|^natural=water$|^landuse=reservoir$/,                  type: 'Wetland' },
  { pattern: /^natural=beach$|^natural=coastline$|^natural=sand$/,                     type: 'Coastal' },
  { pattern: /^landuse=residential$|^landuse=commercial$|^landuse=industrial$|^landuse=retail$/, type: 'Urban' },
  { pattern: /^leisure=park$|^natural=grassland$|^landuse=grass$|^landuse=meadow$/,    type: 'Park' },
  { pattern: /^landuse=farmland$|^landuse=orchard$|^landuse=vineyard$/,                type: 'Countryside' },
]

function classifyEnvironment(elements: unknown[]): Environment {
  const scores = new Map<EnvironmentType, number>()
  const tagFreq = new Map<string, number>()

  for (const el of elements) {
    const tags = (el as { tags?: Record<string, string> }).tags ?? {}
    for (const [key, value] of Object.entries(tags)) {
      if (!['landuse', 'natural', 'leisure'].includes(key)) continue
      const tag = `${key}=${value}`
      tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1)
      for (const rule of RULES) {
        if (rule.pattern.test(tag)) {
          scores.set(rule.type, (scores.get(rule.type) ?? 0) + 1)
        }
      }
    }
  }

  const best = [...scores.entries()].sort((a, b) => b[1] - a[1])[0]
  const dominantTag =
    [...tagFreq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return {
    type: best ? best[0] : 'Mixed',
    dominantTag,
  }
}
