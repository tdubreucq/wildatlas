export interface Observation {
  id: number
  taxon: Taxon
  location: [number, number] // [lat, lng]
  observed_on: string
  quality_grade: 'research' | 'needs_id' | 'casual'
  photos: Photo[]
}

export interface SpeciesCount {
  count: number
  taxon: Taxon
  /** Origin of the record — observed locally or predicted from range map */
  source?: 'observed' | 'range'
}

/** Minimal species info returned by a FlatGeobuf range query */
export interface RangeSpecies {
  taxon_id: number
  scientific_name: string
  iconic_taxon_name: TaxonGroup
}

export interface Taxon {
  id: number
  name: string
  preferred_common_name?: string
  iconic_taxon_name: TaxonGroup
  conservation_status?: string
  default_photo?: Photo
  wikipedia_url?: string
  ancestry: string
}

export interface Photo {
  url: string
  attribution: string
}

export type TaxonGroup =
  | 'Mammalia'
  | 'Aves'
  | 'Reptilia'
  | 'Amphibia'
  | 'Actinopterygii'
  | 'Insecta'
  | 'Arachnida'
  | 'Mollusca'
  | 'Plantae'
  | 'Fungi'
  | 'Animalia'

/** Groups shown as filter chips (excludes catch-all Animalia) */
export const TAXON_GROUPS: TaxonGroup[] = [
  'Mammalia',
  'Aves',
  'Reptilia',
  'Amphibia',
  'Actinopterygii',
  'Insecta',
  'Arachnida',
  'Mollusca',
  'Plantae',
  'Fungi',
]

export const TAXON_CONFIG: Record<
  TaxonGroup,
  { abbr: string; color: string; bgColor: string }
> = {
  Mammalia:      { abbr: 'MAM', color: '#1b4332', bgColor: '#d8f3dc' },
  Aves:          { abbr: 'OIS', color: '#0a4a7a', bgColor: '#d6eeff' },
  Reptilia:      { abbr: 'REP', color: '#5a3d00', bgColor: '#fff3cd' },
  Amphibia:      { abbr: 'AMP', color: '#1a5c2e', bgColor: '#c7f9cc' },
  Actinopterygii:{ abbr: 'POI', color: '#0d3b69', bgColor: '#caf0f8' },
  Insecta:       { abbr: 'INS', color: '#4a1942', bgColor: '#f3d6f0' },
  Arachnida:     { abbr: 'ARA', color: '#5c1a00', bgColor: '#ffe4d6' },
  Mollusca:      { abbr: 'MOL', color: '#3d0a5c', bgColor: '#ead6f5' },
  Plantae:       { abbr: 'PLA', color: '#1a3d00', bgColor: '#d4edda' },
  Fungi:         { abbr: 'FUN', color: '#5c3a00', bgColor: '#f5e6d0' },
  Animalia:      { abbr: 'ANI', color: '#3d3d3d', bgColor: '#e8e8e8' },
}
