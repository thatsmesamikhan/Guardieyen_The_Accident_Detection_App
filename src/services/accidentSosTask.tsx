import { getAuth, getIdToken, onAuthStateChanged } from '@react-native-firebase/auth'
import type { User } from '@react-native-firebase/auth'
import Geolocation from '@react-native-community/geolocation'
import notifee, { AndroidImportance } from '@notifee/react-native'

const SOS_ENDPOINT = 'https://sos-notify-api.vercel.app/api/send-sos'
const MAX_ATTEMPTS = 4
const RETRY_DELAY_MS = 5000
const REQUEST_TIMEOUT_MS = 15000

interface TaskData {
    kind: string
    detectedAt: number
    hasLocation: boolean
    latitude?: number
    longitude?: number
    fixAgeMs?: number
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

const notify = async (title: string, body: string) => {
    const channelId = await notifee.createChannel({
        id: 'sos_result',
        name: 'SOS status',
        importance: AndroidImportance.HIGH,
    })
    await notifee.displayNotification({ title, body, android: { channelId, pressAction: { id: 'default' } } })
}

// After a cold start the Firebase session can take a moment to restore.
const waitForUser = (): Promise<User | null> =>
    new Promise(resolve => {
        const auth = getAuth()
        if (auth.currentUser) return resolve(auth.currentUser)
        const timer = setTimeout(() => {
            unsub()
            resolve(null)
        }, 8000)
        const unsub = onAuthStateChanged(auth, u => {
            if (u) {
                clearTimeout(timer)
                unsub()
                resolve(u)
            }
        })
    })

const getFreshPosition = (): Promise<{ latitude: number; longitude: number } | null> =>
    new Promise(resolve =>
        Geolocation.getCurrentPosition(
            p => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
        )
    )

const postSos = async (body: object, idToken: string) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
        const res = await fetch(SOS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
            body: JSON.stringify(body),
            signal: controller.signal,
        })
        if (!res.ok) throw new Error(`SOS request failed (${res.status})`)
    } finally {
        clearTimeout(timer)
    }
}

const accidentSosTask = async (data: TaskData) => {
    const user = await waitForUser()
    if (!user) {
        await notify('SOS not sent', "You're signed out. Contact emergency services directly if you need help.")
        return
    }

    let latitude: number | null = data.hasLocation && data.latitude != null ? data.latitude : null
    let longitude: number | null = data.hasLocation && data.longitude != null ? data.longitude : null
    let locationAgeSec = data.fixAgeMs != null ? Math.round(data.fixAgeMs / 1000) : null

    // Try a fresh fix if we have nothing, or the last one is older than 30 s.
    if (latitude == null || (locationAgeSec ?? 0) > 30) {
        const fresh = await getFreshPosition()
        if (fresh) {
            latitude = fresh.latitude
            longitude = fresh.longitude
            locationAgeSec = 0
        }
    }

    const body = {
        kind: data.kind ?? 'accident',
        senderName: user.displayName ?? 'Emergency Contact',
        latitude,
        longitude,
        locationAgeSec,
        detectedAt: data.detectedAt,
    }

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const idToken = await getIdToken(user, attempt > 1) // force refresh on retries
            await postSos(body, idToken)
            await notify('SOS sent', 'Your emergency contacts were notified of a possible accident.')
            return
        } catch (e) {
            console.warn(`Accident SOS attempt ${attempt} failed`, e)
            if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS)
        }
    }
    await notify('SOS could not be sent', 'No connection. Please contact your emergency contacts directly.')
}

export default accidentSosTask