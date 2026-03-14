const OTOL_BASE = 'https://api.opentreeoflife.org/v3'

export interface PhyloTreeResult {
  newick: string
  supporting_studies: string[]
  // … other fields from the API
}

/**
 * Fetch the minimal phylogenetic subtree linking a set of Open Tree of Life
 * taxon IDs. Returns the Newick-format tree string.
 */
export async function fetchInducedSubtree(ottIds: number[]): Promise<PhyloTreeResult> {
  const res = await fetch(`${OTOL_BASE}/tree_of_life/induced_subtree`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ott_ids: ottIds }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(`Open Tree of Life error ${res.status}: ${err}`)
  }

  return res.json()
}

/**
 * Map iNaturalist taxon IDs to Open Tree of Life OTT IDs via the TNRS API.
 * Returns a map of { inatName → ottId }.
 */
export async function matchNamesToOtl(
  names: string[]
): Promise<Record<string, number>> {
  const res = await fetch(`${OTOL_BASE}/tnrs/match_names`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ names, do_approximate_matching: false }),
  })

  if (!res.ok) throw new Error(`TNRS error: ${res.status}`)
  const data = await res.json()

  const result: Record<string, number> = {}
  for (const match of data.results ?? []) {
    const best = match.matches?.[0]
    if (best?.taxon?.ott_id) {
      result[match.name] = best.taxon.ott_id
    }
  }
  return result
}
