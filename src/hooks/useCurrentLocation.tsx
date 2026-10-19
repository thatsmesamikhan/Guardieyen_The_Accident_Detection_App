import { useEffect, useRef, useState } from 'react'
import Geolocation from '@react-native-community/geolocation'
import { requestLocationPermission } from '../services/pushNotifications'

export interface Coords {
    latitude: number
    longitude: number
    accuracy: number | null
}

// Only watches while `enabled` (pass screen focus) so GPS isn't draining
// battery when the user is on another tab.
export const useCurrentLocation = (enabled: boolean = true) => {
    const [coords, setCoords] = useState<Coords | null>(null)
    const [error, setError] = useState(false)
    const coordsRef = useRef<Coords | null>(null) // last known fix, used as SOS fallback

    useEffect(() => {
        if (!enabled) return
        let cancelled = false
        let watchId: number | null = null

            ; (async () => {
                const granted = await requestLocationPermission()
                if (cancelled) return
                if (!granted) {
                    setError(true)
                    return
                }
                watchId = Geolocation.watchPosition(
                    (pos) => {
                        const next: Coords = {
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                            accuracy: pos.coords.accuracy ?? null,
                        }
                        coordsRef.current = next
                        setCoords(next)
                        setError(false)
                    },
                    (err) => {
                        console.warn('watchPosition error:', err)
                        if (!coordsRef.current) setError(true)
                    },
                    { enableHighAccuracy: true, distanceFilter: 10, interval: 15000, fastestInterval: 10000 }
                )
            })()

        return () => {
            cancelled = true
            if (watchId !== null) Geolocation.clearWatch(watchId)
        }
    }, [enabled])

    return { coords, coordsRef, error }
}