import { AppRegistry } from 'react-native'
import { getApp } from '@react-native-firebase/app'
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging'
import notifee, { AndroidImportance, AndroidCategory, AndroidVisibility, EventType } from '@notifee/react-native'
import App from './App'
import { name as appName } from './app.json'
import accidentSosTask from './src/services/accidentSosTask'
const SOS_CHANNEL_ID = 'sos-alerts'

const messagingInstance = getMessaging(getApp())

setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
  if (remoteMessage.data?.type === 'SOS') {
    const channelId = await notifee.createChannel({
      id: SOS_CHANNEL_ID,
      name: 'SOS Alerts',
      importance: AndroidImportance.HIGH,
      vibration: true,
      vibrationPattern: [300, 500, 300, 500, 300, 500],
    })

    await notifee.displayNotification({
      title: remoteMessage.data?.title ?? '🚨 SOS Alert',
      body: remoteMessage.data?.body ?? 'Check on your contact now.',
      data: remoteMessage.data,
      android: {
        channelId,
        smallIcon: 'ic_stat_sos',
        color: '#E53935',
        largeIcon: IMAGES.APP_ICON,          
        circularLargeIcon: true,
        importance: AndroidImportance.HIGH,
        category: AndroidCategory.CALL,
        visibility: AndroidVisibility.PUBLIC,
        pressAction: { id: 'open-map', launchActivity: 'default' },
        actions: [
          { title: '📍 Open map', pressAction: { id: 'open-map', launchActivity: 'default' } },
        ],
      },
    })
  }
})

// The tap must launch the app; Maps is opened by App.tsx once the app is in
// front (Android often blocks activity launches from a headless handler).
// Here we only leave a note so App.tsx can pick the tap up.
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    const n = detail.notification
    if (n?.data?.type === 'SOS') {
      globalThis.__pendingSos = { id: n.id, data: n.data }
    }
  }
})

AppRegistry.registerComponent(appName, () => App)
AppRegistry.registerHeadlessTask('AccidentSosTask', () => accidentSosTask)