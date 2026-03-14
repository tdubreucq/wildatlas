'use client'

import { useEffect, useRef } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Observation, TAXON_CONFIG } from '@/types/species'
import { useAppStore } from '@/store/useAppStore'
import { thumbUrl } from '@/lib/inaturalist'

interface Props {
  observation: Observation
}

function buildIcon(obs: Observation): L.DivIcon {
  const cfg = TAXON_CONFIG[obs.taxon.iconic_taxon_name] ?? TAXON_CONFIG['Animalia']
  const photo = thumbUrl(obs.taxon.default_photo?.url, 'square')

  const inner = photo
    ? `<img src="${photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<span style="font-size:0.7rem;font-weight:700;color:${cfg.color}">${cfg.abbr}</span>`

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:40px;height:40px;
        border-radius:50%;
        border:2.5px solid ${cfg.color};
        background:${cfg.bgColor};
        display:flex;align-items:center;justify-content:center;
        overflow:hidden;
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
        cursor:pointer;
      ">${inner}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  })
}

export function SpeciesMarker({ observation }: Props) {
  const { setSelectedTaxonId } = useAppStore()
  const markerRef = useRef<L.Marker>(null)
  const map = useMap()

  // Rebuild icon only when observation changes
  const icon = buildIcon(observation)

  const handleClick = () => {
    setSelectedTaxonId(observation.taxon.id)
    map.panTo(observation.location, { animate: true })
  }

  return (
    <Marker
      ref={markerRef}
      position={observation.location}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    >
      <Popup>
        <strong>
          {observation.taxon.preferred_common_name ?? observation.taxon.name}
        </strong>
        <br />
        <em style={{ fontSize: '0.8rem', color: '#555' }}>{observation.taxon.name}</em>
      </Popup>
    </Marker>
  )
}
