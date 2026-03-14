'use client'

import { useMapEvents } from 'react-leaflet'
import { useAppStore } from '@/store/useAppStore'

/** Captures map clicks to override user position in debug mode. */
export function DebugMapLayer() {
  const { setDebugPosition } = useAppStore()

  useMapEvents({
    click(e) {
      setDebugPosition({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })

  return null
}
