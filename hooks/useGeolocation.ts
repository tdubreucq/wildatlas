import { useState, useEffect } from 'react'

export interface GeoState {
  lat: number | null
  lng: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
}

const DEFAULT_POSITION = { lat: 48.8566, lng: 2.3522 } // Paris fallback

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        ...DEFAULT_POSITION,
        accuracy: null,
        error: 'Géolocalisation non supportée — position par défaut utilisée.',
        loading: false,
      })
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) =>
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          error: null,
          loading: false,
        }),
      (err) =>
        setState({
          ...DEFAULT_POSITION,
          accuracy: null,
          error: `${err.message} — position par défaut utilisée.`,
          loading: false,
        }),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return state
}
