import { Platform, PermissionsAndroid } from 'react-native';
import {
    requestNotifications,
    checkNotifications,
    RESULTS,
    request as requestOsPermission,
    check as checkOsPermission,
    PERMISSIONS,
} from 'react-native-permissions';
import { getAuth, getIdToken } from '@react-native-firebase/auth';
import { getMessaging, getToken, onMessage, registerDeviceForRemoteMessages } from '@react-native-firebase/messaging';
import {
    getFirestore,
    collection,
    doc,
    setDoc,
} from '@react-native-firebase/firestore';
import notifee, { AndroidImportance, AndroidCategory } from '@notifee/react-native';
import { IMAGES } from '../assets/images';

export const SOS_CHANNEL_ID = 'sos-alerts';

// Runtime POST_NOTIFICATIONS permission only exists from Android 13 (API 33).
// On older Android, this must NOT be treated as "denied" — notifications
// are allowed by default there.
const ANDROID_NOTIF_PERMISSION_MIN_SDK = 33;

function isAndroidPreNotificationPermissionEra(): boolean {
    return Platform.OS === 'android' && Number(Platform.Version) < ANDROID_NOTIF_PERMISSION_MIN_SDK;
}

/**
 * Checks current notification permission status WITHOUT prompting the user.
 * Safe to call on every app launch (e.g. to silently refresh a token).
 * Never throws — resolves false on any unexpected native/module error.
 */
export async function hasNotificationPermission(): Promise<boolean> {
    try {
        if (Platform.OS === 'android') {
            if (isAndroidPreNotificationPermissionEra()) return true;
            return await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
        }

        if (Platform.OS === 'ios') {
            const { status } = await checkNotifications();
            return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
        }

        return false;
    } catch (err) {
        console.error('hasNotificationPermission failed:', err);
        return false;
    }
}

/**
 * Prompts the user for notification permission. Only call this from a
 * deliberate, user-initiated moment (e.g. right after login) — never
 * automatically on app boot, since both platforms only let you show the
 * native prompt once.
 * Never throws — resolves false on any unexpected native/module error.
 */
export async function requestNotificationPermission(): Promise<boolean> {
    try {
        if (Platform.OS === 'android') {
            if (isAndroidPreNotificationPermissionEra()) return true;
            const result = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            return result === PermissionsAndroid.RESULTS.GRANTED;
        }

        if (Platform.OS === 'ios') {
            const { status } = await requestNotifications(['alert', 'sound', 'badge']);
            const granted = status === RESULTS.GRANTED || status === RESULTS.LIMITED;

            // On iOS, granting the OS permission does not by itself guarantee
            // the app is registered for remote (push) messages — without this,
            // getToken() can hang or reject on some iOS versions/app states.
            if (granted) {
                try {
                    await registerDeviceForRemoteMessages(getMessaging());
                } catch (err) {
                    console.error('registerDeviceForRemoteMessages failed:', err);
                }
            }

            return granted;
        }

        return false;
    } catch (err) {
        console.error('requestNotificationPermission failed:', err);
        return false;
    }
}

/**
 * Requests Android's fine-location runtime permission. Must be called
 * before any Geolocation.getCurrentPosition() call — without it, location
 * fetches silently fail on Android, and on iOS can crash the app if
 * NSLocationWhenInUseUsageDescription isn't set in Info.plist (a native
 * config step you still need to do separately — this call alone won't
 * prevent that crash if the Info.plist entry is missing).
 * Never throws — resolves false on any unexpected native/module error.
 */
export async function requestLocationPermission(): Promise<boolean> {
    try {
        if (Platform.OS === 'android') {
            const result = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            return result === PermissionsAndroid.RESULTS.GRANTED;
        }

        if (Platform.OS === 'ios') {
            const permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
            const existing = await checkOsPermission(permission);
            if (existing === RESULTS.GRANTED) return true;
            const result = await requestOsPermission(permission);
            return result === RESULTS.GRANTED;
        }

        return false;
    } catch (err) {
        console.error('requestLocationPermission failed:', err);
        return false;
    }
}

/**
 * Fetches the current FCM token and upserts it onto the user's Firestore doc.
 * Assumes permission has already been granted — call after
 * requestNotificationPermission()/hasNotificationPermission() returns true.
 * Throws on failure — callers below all wrap this in try/catch.
 */
export async function syncFcmToken(uid: string): Promise<void> {
    if (!uid) return;

    const messaging = getMessaging();
    const firestore = getFirestore();

    const token = await getToken(messaging);
    if (!token) return;

    const userDocRef = doc(collection(firestore, 'users'), uid);
    await setDoc(userDocRef, { fcmToken: token }, { merge: true });
}

/**
 * One-shot helper for a fresh, successful login: requests permission
 * (prompting if not already decided) and syncs the token if granted.
 * Never throws.
 */
export async function setupPushNotificationsAfterLogin(uid: string): Promise<void> {
    try {
        const granted = await requestNotificationPermission();
        if (!granted) return;
        await syncFcmToken(uid);
    } catch (err) {
        console.error('Push notification setup failed:', err);
    }
}

/**
 * Silent variant for app-launch/session-restore: only syncs the token if
 * permission was already granted in a previous session. Never prompts.
 */
export async function syncPushNotificationsIfPermitted(uid: string): Promise<void> {
    try {
        const granted = await hasNotificationPermission();
        if (!granted) return;
        await syncFcmToken(uid);
    } catch (err) {
        console.error('Push notification sync failed:', err);
    }
}

/**
 * Returns the current user's Firebase ID token, or null if no user is
 * signed in. Used to authenticate calls to the SOS backend endpoint.
 * Never throws.
 */
export async function getCurrentUserIdToken(forceRefresh = false): Promise<string | null> {
    try {
        const user = getAuth().currentUser;
        if (!user) return null;
        return await getIdToken(user, forceRefresh);
    } catch (err) {
        console.error('getCurrentUserIdToken failed:', err);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────
// SOS-specific helpers below.
// ─────────────────────────────────────────────────────────────────────────

/**
 * Creates the SOS Android notification channel. Safe to call multiple
 * times (idempotent). Call this once at app startup (App.tsx) so the
 * channel is guaranteed to exist before a foreground SOS push ever needs
 * to display through it — the background handler in index.js also creates
 * it defensively, but that only covers the background/killed path.
 */
export async function createSosChannel(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
        await notifee.createChannel({
            id: SOS_CHANNEL_ID,
            name: 'SOS Alerts',
            importance: AndroidImportance.HIGH,
            vibration: true,
            vibrationPattern: [300, 500, 300, 500, 300, 500],
        });
    } catch (err) {
        console.error('createSosChannel failed:', err);
    }
}

/**
 * Registers the FOREGROUND handler for incoming SOS pushes — i.e. what
 * happens when a message arrives while the app is open and visible.
 * The background/killed-state equivalent lives in index.js and must stay
 * in sync with this (same channel id, same data shape expected from the
 * server). Returns an unsubscribe function; call it from a useEffect
 * cleanup in App.tsx.
 */
export function setupForegroundSosHandler(): () => void {
    const messaging = getMessaging();

    return onMessage(messaging, async (remoteMessage) => {
        if (remoteMessage.data?.type !== 'SOS') return;

        try {
            await notifee.displayNotification({
                title: (remoteMessage.data?.title as string) ?? '🚨 SOS Alert',
                body: (remoteMessage.data?.body as string) ?? 'Check on your contact now.',
                data: remoteMessage.data,
                android: {
                    channelId: SOS_CHANNEL_ID,
                    smallIcon: 'ic_stat_sos',
                    largeIcon: IMAGES.APP_ICON,          // new: the big picture in the notification shade
                    circularLargeIcon: true,
                    color: '#E53935',
                    importance: AndroidImportance.HIGH,
                    pressAction: { id: 'default' },
                    category: AndroidCategory.CALL,
                },
            });
        } catch (err) {
            console.error('Failed to display foreground SOS notification:', err);
        }
    });
}