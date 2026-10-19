import { Alert, Linking, Platform, PermissionsAndroid, Permission } from 'react-native'

const API = Platform.OS === 'android' ? Number(Platform.Version) : 0

// Runtime POST_NOTIFICATIONS only exists from Android 13 (API 33).
// Background location is a separate runtime permission from Android 10 (API 29).
const NEEDS_NOTIFICATION = API >= 33
const NEEDS_BACKGROUND_LOCATION = API >= 29

const R = PermissionsAndroid.RESULTS
const isGranted = (r: string) => r === R.GRANTED

// Some RN typings don't expose these constants; fall back to the raw strings.
const FINE_LOCATION = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
const BACKGROUND_LOCATION = (PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION ??
    'android.permission.ACCESS_BACKGROUND_LOCATION') as Permission
const POST_NOTIFICATIONS = (PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS ??
    'android.permission.POST_NOTIFICATIONS') as Permission

export interface PermissionOutcome {
    granted: boolean
    missing: string[]
    needsSettings: boolean
}

/**
 * Checks (never prompts) whether all protection permissions are granted.
 * Never throws — resolves false on any unexpected native error.
 */
export const hasProtectionPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false
    try {
        const checks: Promise<boolean>[] = [PermissionsAndroid.check(FINE_LOCATION)]
        if (NEEDS_BACKGROUND_LOCATION) checks.push(PermissionsAndroid.check(BACKGROUND_LOCATION))
        if (NEEDS_NOTIFICATION) checks.push(PermissionsAndroid.check(POST_NOTIFICATIONS))
        return (await Promise.all(checks)).every(Boolean)
    } catch (err) {
        console.error('hasProtectionPermissions failed:', err)
        return false
    }
}

// Google Play requires a prominent in-app disclosure BEFORE the background-location prompt.
// Edit the wording so it matches your privacy policy exactly.
const showDisclosure = () =>
    new Promise<boolean>(resolve => {
        Alert.alert(
            'Location & motion in the background',
            'Guardieyen uses your location and motion-sensor data in the background, even when the app is closed or not in use, to detect a possible accident and send your live location to your emergency contacts.',
            [
                { text: 'Not now', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Continue', onPress: () => resolve(true) },
            ],
            { cancelable: false }
        )
    })

/**
 * Requests one permission via PermissionsAndroid.
 * Returns the raw result so callers can distinguish NEVER_ASK_AGAIN (blocked).
 */
const ask = async (permission: Permission): Promise<string> => {
    if (await PermissionsAndroid.check(permission)) return R.GRANTED
    return PermissionsAndroid.request(permission)
}

/**
 * Prompts for everything protection needs. Call from a deliberate,
 * user-initiated moment (e.g. toggling the protection switch).
 * Never throws.
 */
export const ensureProtectionPermissions = async (): Promise<PermissionOutcome> => {
    if (Platform.OS !== 'android') {
        return { granted: false, missing: ['Unsupported platform'], needsSettings: false }
    }

    try {
        if (await hasProtectionPermissions()) {
            return { granted: true, missing: [], needsSettings: false }
        }

        if (!(await showDisclosure())) {
            return { granted: false, missing: ['Location (you chose "Not now")'], needsSettings: false }
        }

        const missing: string[] = []
        let needsSettings = false

        // 1. Notifications (Android 13+) - without them the "I'm OK" countdown is invisible.
        if (NEEDS_NOTIFICATION) {
            const res = await ask(POST_NOTIFICATIONS)
            if (!isGranted(res)) {
                missing.push('Notifications')
                if (res === R.NEVER_ASK_AGAIN) needsSettings = true
            }
        }

        // 2. Precise location
        const fine = await ask(FINE_LOCATION)
        if (!isGranted(fine)) {
            missing.push('Location')
            if (fine === R.NEVER_ASK_AGAIN) needsSettings = true
        }

        // 3. Background location ("Allow all the time") - only asked once fine location is granted.
        //    On Android 11+ the system sends the user to Settings; we re-check when they return.
        if (NEEDS_BACKGROUND_LOCATION && isGranted(fine)) {
            let granted = await PermissionsAndroid.check(BACKGROUND_LOCATION)
            if (!granted) {
                await PermissionsAndroid.request(BACKGROUND_LOCATION)
                granted = await PermissionsAndroid.check(BACKGROUND_LOCATION)
            }
            if (!granted) {
                missing.push('Location: "Allow all the time"')
                needsSettings = true
            }
        }

        return { granted: missing.length === 0, missing, needsSettings }
    } catch (err) {
        console.error('ensureProtectionPermissions failed:', err)
        return { granted: false, missing: ['Permissions (unexpected error)'], needsSettings: false }
    }
}

export const showPermissionAlert = (outcome: PermissionOutcome) => {
    const buttons: any[] = [{ text: 'Cancel', style: 'cancel' }]
    if (outcome.needsSettings) {
        buttons.push({ text: 'Open settings', onPress: () => Linking.openSettings() })
    }
    Alert.alert(
        'Permission required',
        `Protection can't be turned on without:\n\n• ${outcome.missing.join('\n• ')}\n\nTurn the switch on again after allowing them.`,
        buttons
    )
}