'use client'

import { useAppStore } from '@/store/useAppStore'
import styles from './DebugPanel.module.css'

interface Props {
  realLat: number | null
  realLng: number | null
}

export function DebugPanel({ realLat, realLng }: Props) {
  const { debugPosition, setDebugPosition } = useAppStore()

  const lat = debugPosition?.lat ?? realLat
  const lng = debugPosition?.lng ?? realLng

  return (
    <div className={styles.panel}>
      <span className={styles.badge}>
        <span className={styles.dot} />
        Debug mode
      </span>

      <div className={styles.coords}>
        <div className={styles.coordRow}>
          <span className={styles.coordLabel}>lat</span>
          <span>{lat?.toFixed(6) ?? '—'}</span>
        </div>
        <div className={styles.coordRow}>
          <span className={styles.coordLabel}>lng</span>
          <span>{lng?.toFixed(6) ?? '—'}</span>
        </div>
      </div>

      <p className={styles.hint}>Cliquez sur la carte pour déplacer la position</p>

      {debugPosition && (
        <button
          className={styles.reset}
          onClick={() => setDebugPosition(null)}
        >
          Réinitialiser la position réelle
        </button>
      )}
    </div>
  )
}
