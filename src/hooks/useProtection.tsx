import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, ImageSourcePropType, Platform } from 'react-native'
import { IMAGES } from '../assets/images'
import { AccidentDetection, ProtectionStatus } from '../native/AccidentDetection'
import {
    ensureProtectionPermissions,
    hasProtectionPermissions,
    showPermissionAlert,
} from '../services/protectionPermissions'

export interface ProtectionCard {
    id: number
    title: string
    info: string
    icon: ImageSourcePropType
    ok: boolean
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

// After start(), confirm the service is really alive and sensor data is flowing.
const waitUntilHealthy = async (): Promise<boolean> => {
    for (let i = 0; i < 8; i++) {
        await sleep(700)
        const s = await AccidentDetection.getStatus()
        if (s.running && s.sensorsFlowing) return true
    }
    return false
}

const askBatteryExemption = () =>
    new Promise<void>(resolve => {
        Alert.alert(
            'Keep protection running',
            'To keep working when the app is closed, set Guardieyen to "Unrestricted" / "Don\'t optimize" in battery settings. Some phones (Xiaomi, Oppo, Vivo, Samsung) also need Auto-start enabled.',
            [
                { text: 'Later', style: 'cancel', onPress: () => resolve() },
                {
                    text: 'Open settings',
                    onPress: () => {
                        AccidentDetection.openBatterySettings()
                        resolve()
                    },
                },
            ],
            { cancelable: false }
        )
    })

export const useProtection = (contactsCount: number, contactsLoading: boolean) => {
    const [isOn, setIsOn] = useState(false)
    const [busy, setBusy] = useState(false)
    const [status, setStatus] = useState<ProtectionStatus | null>(null)

    const refresh = useCallback(async () => {
        const s = await AccidentDetection.getStatus()
        setStatus(s)
        setIsOn(s.running)
        return s
    }, [])

    // Poll status so the cards stay truthful.
    useEffect(() => {
        refresh()
        const id = setInterval(refresh, 3000)
        return () => clearInterval(id)
    }, [refresh])

    // On launch: self-heal if the OS killed the service, or shut it down if permissions were revoked.
    useEffect(() => {
        ; (async () => {
            const s = await refresh()
            if (!s.enabled) return
            const permsOk = await hasProtectionPermissions()
            if (!permsOk) {
                await AccidentDetection.stop()
                await refresh()
            } else if (!s.running) {
                await AccidentDetection.start().catch(() => { })
                await refresh()
            }
        })()
    }, [refresh])

    // Contacts removed while protection is on -> turn it off.
    useEffect(() => {
        if (!contactsLoading && contactsCount === 0 && isOn && !busy) {
            AccidentDetection.stop().then(refresh)
            Alert.alert('Protection turned off', 'Please enter at least one contact to continue.')
        }
    }, [contactsLoading, contactsCount, isOn, busy, refresh])

    const toggle = useCallback(async () => {
        if (busy) return
        setBusy(true)
        try {
            if (isOn) {
                await AccidentDetection.stop()
                return
            }

            if (Platform.OS !== 'android' || !AccidentDetection.isSupported) {
                Alert.alert('Not supported', 'Accident detection is currently available on Android only.')
                return
            }
            if (contactsLoading) return
            if (contactsCount === 0) {
                Alert.alert('Please enter at least one contact to continue.')
                return
            }

            const initial = await AccidentDetection.getStatus()
            if (!initial.hasAccelerometer) {
                Alert.alert('Sensor missing', "This phone has no accelerometer, so accidents can't be detected.")
                return
            }

            const perms = await ensureProtectionPermissions()
            if (!perms.granted) {
                showPermissionAlert(perms)
                return
            }

            const afterPerms = await AccidentDetection.getStatus()
            if (!afterPerms.locationEnabled) {
                Alert.alert('Turn on GPS', 'Location services are off. Turn them on, then switch protection on again.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open settings', onPress: () => AccidentDetection.openLocationSettings() },
                ])
                return
            }

            if (!afterPerms.batteryOptimizationIgnored) await askBatteryExemption()

            await AccidentDetection.start()
            if (!(await waitUntilHealthy())) {
                await AccidentDetection.stop()
                Alert.alert('Could not start protection', "Sensors didn't respond. Please try again.")
            }
        } catch (e: any) {
            Alert.alert('Could not change protection', String(e?.message ?? e))
        } finally {
            await refresh()
            setBusy(false)
        }
    }, [busy, isOn, contactsCount, contactsLoading, refresh])

    const cards: ProtectionCard[] = useMemo(() => {
        const s = status
        const on = isOn && !!s
        const gpsInfo = !on
            ? 'Off'
            : !s!.locationEnabled
                ? 'Turn on GPS'
                : s!.standby
                    ? 'Standby'
                    : s!.gpsFix
                        ? 'Connected'
                        : 'Searching…'
        return [
            {
                id: 1,
                title: 'Sensors',
                info: !on ? 'Off' : s!.sensorsFlowing ? (s!.standby ? 'Standby' : 'Active') : 'No data',
                icon: IMAGES.SENSORS,
                ok: on && !!s!.sensorsFlowing,
            },
            {
                id: 2,
                title: 'GPS',
                info: gpsInfo,
                icon: IMAGES.GPS,
                ok: on && s!.locationEnabled && (s!.gpsFix || s!.standby),
            },
            {
                id: 3,
                title: 'Background',
                info: !on ? 'Off' : s!.batteryOptimizationIgnored ? 'Running' : 'Limited',
                icon: IMAGES.BACKGROUND,
                ok: on && s!.batteryOptimizationIgnored,
            },
            {
                id: 4,
                title: 'Contacts',
                info: contactsCount > 0 ? `${contactsCount} Ready` : 'Add contact',
                icon: IMAGES.CONTACTS,
                ok: contactsCount > 0,
            },
        ]
    }, [status, isOn, contactsCount])

    const lastUpdated = isOn && status?.sensorsFlowing ? 'Just now' : '—'

    return { isOn, busy, status, cards, lastUpdated, toggle }
}