'use client'

import { GeoJSON } from 'react-leaflet'
import { useTaxonRange } from '@/hooks/useTaxonRange'
import { useAppStore } from '@/store/useAppStore'
import { TAXON_CONFIG, TaxonGroup } from '@/types/species'

export function RangeLayer() {
  const { selectedTaxonId } = useAppStore()
  const { data: feature } = useTaxonRange(selectedTaxonId)

  if (!feature) return null

  const group = (feature.properties?.iconic_taxon_name ?? 'Animalia') as TaxonGroup
  const cfg = TAXON_CONFIG[group] ?? TAXON_CONFIG['Animalia']

  return (
    <GeoJSON
      key={selectedTaxonId}
      data={feature}
      style={{
        color: cfg.color,
        fillColor: cfg.color,
        fillOpacity: 0.15,
        weight: 1.5,
        opacity: 0.6,
      }}
    />
  )
}
