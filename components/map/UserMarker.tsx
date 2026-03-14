'use client'

import { Circle, CircleMarker } from 'react-leaflet'

interface Props {
  lat: number
  lng: number
  accuracy?: number | null
}

export function UserMarker({ lat, lng, accuracy }: Props) {
  return (
    <>
      {/* Accuracy circle */}
      {accuracy && (
        <Circle
          center={[lat, lng]}
          radius={accuracy}
          pathOptions={{
            color: '#2d6a4f',
            fillColor: '#52b788',
            fillOpacity: 0.08,
            weight: 1,
            dashArray: '4 4',
          }}
        />
      )}

      {/* Position dot */}
      <CircleMarker
        center={[lat, lng]}
        radius={8}
        pathOptions={{
          color: '#ffffff',
          fillColor: '#2d6a4f',
          fillOpacity: 1,
          weight: 2.5,
        }}
      />
    </>
  )
}
