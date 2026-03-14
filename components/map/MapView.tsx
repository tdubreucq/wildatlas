'use client'

import 'leaflet/dist/leaflet.css'
import { useTranslations } from 'next-intl'
import { MapContainer, TileLayer } from 'react-leaflet'
import { UserMarker } from './UserMarker'
import { RangeLayer } from './RangeLayer'
import { DebugMapLayer } from './DebugMapLayer'
import { useAppStore } from '@/store/useAppStore'
import styles from './MapView.module.css'

const IS_DEBUG = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'

interface Props {
  lat: number
  lng: number
  accuracy?: number | null
}

export function MapView({ lat, lng, accuracy }: Props) {
  const t = useTranslations('radius')
  const { radiusKm, setRadiusKm } = useAppStore()

  return (
    <div className={styles.container}>
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <UserMarker lat={lat} lng={lng} accuracy={IS_DEBUG ? undefined : accuracy} />
        <RangeLayer />
        {IS_DEBUG && <DebugMapLayer />}
      </MapContainer>

      <div className={styles.radiusControl}>
        <span className={styles.radiusLabel}>{t('label')}</span>
        <span className={styles.radiusValue}>{radiusKm} {t('unit')}</span>
        <input
          type="range"
          min={1}
          max={50}
          step={1}
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          className={styles.radiusSlider}
          aria-label={`${t('label')} ${radiusKm} ${t('unit')}`}
        />
      </div>
    </div>
  )
}
