import React, { useEffect, useRef } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import RootNavigators from './src/navigators/RootNavigators';
import Toast from 'react-native-toast-message';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import {
  getMessaging,
  onTokenRefresh,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import { getFirestore, collection, doc, setDoc } from '@react-native-firebase/firestore';
import notifee, { EventType } from '@notifee/react-native';
import {
  syncPushNotificationsIfPermitted,
  hasNotificationPermission,
  createSosChannel,
  setupForegroundSosHandler,
} from './src/services/pushNotifications';
import { View, Text, StyleSheet, Linking, AppState, Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────
// SOS map opening
// ─────────────────────────────────────────────────────────────
const isGoogleMapsUrl = (u: unknown): u is string =>
  typeof u === 'string' && u.startsWith('https://www.google.com/maps/');

const getCoords = (data: any) => {
  const lat = parseFloat(String(data?.latitude));
  const lng = parseFloat(String(data?.longitude));
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
    ? { lat, lng }
    : null;
};

const openSosMap = async (data: any) => {
  const c = getCoords(data);
  // Only trust Google Maps links so a spoofed push can't open another site.
  const url = isGoogleMapsUrl(data?.mapsUrl)
    ? data.mapsUrl
    : c
      ? `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`
      : null;
  if (!url) return;

  try {
    await Linking.openURL(url);
  } catch (err) {
    if (!c) return console.warn('Open map failed:', err);
    // Fallback: native geo intent (Android) / Apple Maps (iOS)
    const fallback =
      Platform.OS === 'android'
        ? `geo:${c.lat},${c.lng}?q=${c.lat},${c.lng}`
        : `http://maps.apple.com/?ll=${c.lat},${c.lng}&q=SOS`;
    Linking.openURL(fallback).catch((e) => console.warn('Open map fallback failed:', e));
  }
};

// Module-level so a remount can't reopen the same notification twice.
let lastHandledKey: string | undefined;

// Single entry point for every tap source: dedupes, waits until the app is
// really in front, then opens Maps.
const handleSosTap = (n?: { id?: string; data?: any }) => {
  if (!n?.data || n.data.type !== 'SOS') return;
  const key = n.id ?? JSON.stringify(n.data);
  if (key === lastHandledKey) return;
  lastHandledKey = key;

  const run = () => setTimeout(() => openSosMap(n.data), 600);
  if (AppState.currentState === 'active') {
    run();
  } else {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        sub.remove();
        run();
      }
    });
  }
};

const consumePendingTap = () => {
  const g = globalThis as any;
  const pending = g.__pendingSos;
  if (pending) {
    g.__pendingSos = undefined;
    handleSosTap(pending);
  }
};

// Catches any uncaught render error below it and shows a recoverable screen
// instead of letting the whole app go down to a native crash/red screen.
class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  { hasError: boolean }
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Uncaught render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSubtitle}>
            Please restart the app. If this keeps happening, contact support.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const unsubscribeRefreshRef = useRef<(() => void) | null>(null);

  // Runs once, regardless of auth state — the notification CHANNEL and the
  // FOREGROUND listener both need to exist before any SOS push can arrive,
  // not just after a specific user logs in.
  useEffect(() => {
    createSosChannel();
    const unsubscribeForegroundSos = setupForegroundSosHandler();

    return () => {
      unsubscribeForegroundSos();
    };
  }, []);

  // NEW: opens the SOS location when a notification is tapped, in every state
  // (app open, backgrounded, killed). Runs once at the root, not login-gated.
  useEffect(() => {
    // 1) Killed → launched by tapping the notification (Android / notifee)
    notifee
      .getInitialNotification()
      .then((i) => handleSosTap(i?.notification as any))
      .catch((e) => console.warn('getInitialNotification failed:', e));

    // 2) App open
    const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        handleSosTap(detail.notification as any);
      }
    });

    // 3) Backgrounded → tap recorded by index.js, consumed when app is active
    consumePendingTap();
    const appStateSub = AppState.addEventListener('change', (s) => {
      if (s === 'active') consumePendingTap();
    });

    // 4) iOS: system-displayed alert (aps.alert) bypasses notifee
    let unsubIosOpened: (() => void) | undefined;
    if (Platform.OS === 'ios') {
      try {
        const messaging = getMessaging();
        getInitialNotification(messaging)
          .then((rm) => {
            if (rm?.data?.type === 'SOS') {
              handleSosTap({ id: rm.messageId, data: rm.data });
            }
          })
          .catch((e) => console.warn('iOS getInitialNotification failed:', e));
        unsubIosOpened = onNotificationOpenedApp(messaging, (rm) => {
          if (rm?.data?.type === 'SOS') {
            handleSosTap({ id: rm.messageId, data: rm.data });
          }
        });
      } catch (e) {
        console.warn('iOS notification-open setup failed:', e);
      }
    }

    return () => {
      unsubNotifee();
      appStateSub.remove();
      unsubIosOpened?.();
    };
  }, []);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;

    try {
      const auth = getAuth();
      const messaging = getMessaging();
      const firestore = getFirestore();

      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        // Always tear down the previous refresh listener before attaching a
        // new one, otherwise switching accounts stacks up stale listeners
        // writing to the wrong user's doc.
        unsubscribeRefreshRef.current?.();
        unsubscribeRefreshRef.current = null;

        // Skip unverified users — they get signed back out moments later by
        // the login flow, so there's nothing worth syncing here.
        if (!user || !user.emailVerified) return;

        // Session restore / app relaunch: sync silently, never prompt.
        // The one-time permission ask happens explicitly in the login flow.
        // (Already internally try/caught — never throws.)
        syncPushNotificationsIfPermitted(user.uid);

        try {
          unsubscribeRefreshRef.current = onTokenRefresh(messaging, async (newToken) => {
            try {
              if (!newToken) return;

              // Only write if permission is still actually granted — a token
              // can still rotate even after the user revokes permission in
              // system settings, and we don't want to keep a dead token fresh.
              const granted = await hasNotificationPermission();
              if (!granted) return;

              const userDocRef = doc(collection(firestore, 'users'), user.uid);
              await setDoc(userDocRef, { fcmToken: newToken }, { merge: true });
            } catch (err) {
              console.error('Token refresh update failed:', err);
            }
          });
        } catch (err) {
          console.error('Failed to attach onTokenRefresh listener:', err);
        }
      });
    } catch (err) {
      // Firebase not ready / native module missing — don't let it take the
      // whole app down on mount. Push sync just silently won't run.
      console.error('Firebase push-notification setup failed:', err);
    }

    return () => {
      unsubscribeAuth?.();
      unsubscribeRefreshRef.current?.();
    };
  }, []);

  return (
    <ErrorBoundary>
      <KeyboardProvider>
        <RootNavigators />
        <Toast />
      </KeyboardProvider>
    </ErrorBoundary>
  );
};

export default App;

const styles = StyleSheet.create({
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  errorSubtitle: { fontSize: 14, textAlign: 'center', color: '#666' },
});