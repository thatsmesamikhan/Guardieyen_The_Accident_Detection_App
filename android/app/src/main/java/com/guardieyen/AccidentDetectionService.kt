package com.guardieyen

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.BitmapFactory
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.hardware.TriggerEvent
import android.hardware.TriggerEventListener
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.media.AudioAttributes
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import android.os.PowerManager
import android.os.SystemClock
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * Foreground service (type "location") that keeps accident detection alive when the app is closed.
 *
 *  ACTIVE  : partial wake lock + accelerometer/gyro @ ~50 Hz + GPS (5 s slow / 1 s when moving)
 *  STANDBY : after 5 min with no movement -> everything released, waiting on the low-power
 *            SIGNIFICANT_MOTION sensor, which wakes us back to ACTIVE.
 *
 * Everything (sensors, GPS callbacks, countdown) runs on ONE background HandlerThread,
 * so no locking is needed.
 */
class AccidentDetectionService : Service(), SensorEventListener, LocationListener {

    companion object {
        const val TAG = "Guardieyen"
        const val ACTION_START = "com.guardieyen.action.START"
        const val ACTION_STOP = "com.guardieyen.action.STOP"
        const val ACTION_CANCEL_ALERT = "com.guardieyen.action.CANCEL_ALERT"
        const val ACTION_SEND_NOW = "com.guardieyen.action.SEND_NOW"
        const val ACTION_DEBUG_ALERT = "com.guardieyen.action.DEBUG_ALERT"
        const val PREFS = "guardieyen_protection"
        const val KEY_ENABLED = "enabled"

        private const val CH_STATUS = "protection_status"
        private const val CH_ALERT = "accident_alert"
        private const val ID_STATUS = 1001
        private const val ID_ALERT = 1002
        private const val COUNTDOWN_SECONDS = 30
        private const val STANDBY_AFTER_NS = 5L * 60L * 1_000_000_000L
        private const val GPS_SLOW_MS = 5_000L
        private const val GPS_FAST_MS = 1_000L

        // Read by AccidentDetectionModule to report status to JS.
        @Volatile var running = false
        @Volatile var alerting = false
        @Volatile var standby = false
        @Volatile var lastSensorMs = 0L
        @Volatile var lastFixMs = 0L
    }

    private lateinit var thread: HandlerThread
    private lateinit var handler: Handler
    private lateinit var sensors: SensorManager
    private lateinit var locationManager: LocationManager
    private lateinit var notifications: NotificationManager

    private var wakeLock: PowerManager.WakeLock? = null
    private var accel: Sensor? = null
    private var gyro: Sensor? = null
    private var sigMotion: Sensor? = null
    private var ringtone: Ringtone? = null

    private var active = false
    private var gpsIntervalMs = 0L
    private var slowSinceNs = 0L
    private var countdownLeft = 0
    private var lastLocation: Location? = null

    private val detector = AccidentDetector(
        onCrash = { ev -> handler.post { beginAlert(ev) } },
        log = { Log.i(TAG, it) },
    )

    // ------------------------------------------------------------------ lifecycle

    override fun onCreate() {
        super.onCreate()
        sensors = getSystemService(SENSOR_SERVICE) as SensorManager
        locationManager = getSystemService(LOCATION_SERVICE) as LocationManager
        notifications = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        accel = sensors.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        gyro = sensors.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
        sigMotion = sensors.getDefaultSensor(Sensor.TYPE_SIGNIFICANT_MOTION)
        createChannels()
        thread = HandlerThread("guardieyen-detector").also { it.start() }
        handler = Handler(thread.looper)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                prefs().edit().putBoolean(KEY_ENABLED, false).apply()
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_CANCEL_ALERT -> {
                handler.post { if (alerting) finishAlert(send = false) }
                return START_STICKY
            }
            ACTION_SEND_NOW -> {
                handler.post { if (alerting) finishAlert(send = true) }
                return START_STICKY
            }
            ACTION_DEBUG_ALERT -> {
                handler.post { beginAlert(null) }
                return START_STICKY
            }
        }

        // ACTION_START, or a sticky restart by the system (intent == null)
        if (!enterForeground()) {
            stopSelf()
            return START_NOT_STICKY
        }
        prefs().edit().putBoolean(KEY_ENABLED, true).apply()
        if (!running) {
            running = true
            lastSensorMs = 0L
            lastFixMs = 0L
            handler.post { enterActive() }
            handler.postDelayed(tick, 1000)
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        running = false
        alerting = false
        standby = false
        active = false
        handler.removeCallbacksAndMessages(null)
        sensors.unregisterListener(this)
        sigMotion?.let { sensors.cancelTriggerSensor(sigListener, it) }
        try { locationManager.removeUpdates(this) } catch (_: Exception) {}
        stopAlarm()
        wakeLock?.let { if (it.isHeld) it.release() }
        notifications.cancel(ID_ALERT)
        thread.quitSafely()
        super.onDestroy()
    }

    private fun prefs() = getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    // ------------------------------------------------------------------ power states

    @SuppressLint("WakelockTimeout")
    private fun enterActive() {
        if (active) return
        active = true
        standby = false
        sigMotion?.let { sensors.cancelTriggerSensor(sigListener, it) }

        val pm = getSystemService(POWER_SERVICE) as PowerManager
        val wl = wakeLock ?: pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Guardieyen:Detection")
            .apply { setReferenceCounted(false) }
            .also { wakeLock = it }
        wl.acquire()

        accel?.let { sensors.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME, handler) }
        gyro?.let { sensors.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME, handler) }
        detector.markActivity(SystemClock.elapsedRealtimeNanos())
        requestGps(GPS_SLOW_MS)
    }

    private fun enterStandby() {
        val sm = sigMotion ?: return
        if (!sensors.requestTriggerSensor(sigListener, sm)) return // can't wake later -> stay active
        active = false
        standby = true
        sensors.unregisterListener(this)
        try { locationManager.removeUpdates(this) } catch (_: Exception) {}
        gpsIntervalMs = 0L
        wakeLock?.let { if (it.isHeld) it.release() }
    }

    private val sigListener = object : TriggerEventListener() {
        override fun onTrigger(event: TriggerEvent?) {
            handler.post { enterActive() }
        }
    }

    private val tick = object : Runnable {
        override fun run() {
            if (!running) return
            if (active && !alerting && detector.isIdle && sigMotion != null) {
                val idle = SystemClock.elapsedRealtimeNanos() - detector.lastActivityNs
                if (idle > STANDBY_AFTER_NS) enterStandby()
            }
            handler.postDelayed(this, 1000)
        }
    }

    // ------------------------------------------------------------------ sensors

    override fun onSensorChanged(e: SensorEvent) {
        val v = e.values
        when (e.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> {
                lastSensorMs = SystemClock.elapsedRealtime()
                detector.onAccel(e.timestamp, v[0], v[1], v[2])
            }
            Sensor.TYPE_GYROSCOPE -> detector.onGyro(e.timestamp, v[0], v[1], v[2])
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    // ------------------------------------------------------------------ GPS

    @SuppressLint("MissingPermission")
    private fun requestGps(intervalMs: Long) {
        try {
            locationManager.removeUpdates(this)
            locationManager.requestLocationUpdates(
                LocationManager.GPS_PROVIDER, intervalMs, 0f, this, handler.looper
            )
            gpsIntervalMs = intervalMs
        } catch (e: Exception) {
            Log.w(TAG, "GPS request failed: ${e.message}")
        }
    }

    override fun onLocationChanged(loc: Location) {
        lastLocation = loc
        lastFixMs = SystemClock.elapsedRealtime()
        if (!loc.hasSpeed()) return
        val t = loc.elapsedRealtimeNanos
        detector.onSpeed(t, loc.speed)
        adaptGpsRate(loc.speed, t)
    }

    /** 1 s fixes while moving fast (needed to measure a sudden stop), 5 s otherwise (saves battery). */
    private fun adaptGpsRate(speed: Float, t: Long) {
        if (speed >= 3f) {
            slowSinceNs = 0L
            if (gpsIntervalMs != GPS_FAST_MS) requestGps(GPS_FAST_MS)
        } else if (speed < 2f && gpsIntervalMs != GPS_SLOW_MS) {
            if (slowSinceNs == 0L) slowSinceNs = t
            else if (t - slowSinceNs > 30_000_000_000L) {
                requestGps(GPS_SLOW_MS)
                slowSinceNs = 0L
            }
        } else {
            slowSinceNs = 0L
        }
    }

    override fun onProviderEnabled(provider: String) {}
    override fun onProviderDisabled(provider: String) {}

    @Deprecated("Deprecated in Java")
    override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}

    // ------------------------------------------------------------------ alert + countdown

    private fun beginAlert(ev: AccidentDetector.CrashEvidence?) {
        if (alerting) return
        Log.w(TAG, "Accident suspected: $ev")
        alerting = true
        countdownLeft = COUNTDOWN_SECONDS
        startAlarm()
        handler.post(countdown)
    }

    private val countdown = object : Runnable {
        override fun run() {
            if (!alerting) return
            if (countdownLeft <= 0) {
                finishAlert(send = true)
                return
            }
            notifications.notify(ID_ALERT, alertNotification(countdownLeft))
            countdownLeft--
            handler.postDelayed(this, 1000)
        }
    }

    private fun finishAlert(send: Boolean) {
        alerting = false
        handler.removeCallbacks(countdown)
        stopAlarm()
        notifications.cancel(ID_ALERT)
        if (send) dispatchSos()
    }

    /** Hands the actual network call to JS (Firebase token + HTTPS) via a Headless JS task. */
    private fun dispatchSos() {
        val loc = lastLocation
        val i = Intent(this, AccidentSosTaskService::class.java).apply {
            putExtra("kind", "accident")
            putExtra("detectedAt", System.currentTimeMillis().toDouble())
            putExtra("hasLocation", loc != null)
            if (loc != null) {
                putExtra("latitude", loc.latitude)
                putExtra("longitude", loc.longitude)
                putExtra("fixAgeMs", (SystemClock.elapsedRealtime() - lastFixMs).toDouble())
            }
        }
        try {
            startService(i)
        } catch (e: Exception) {
            Log.e(TAG, "Could not start SOS task: ${e.message}")
        }
    }

    private fun startAlarm() {
        try {
            val uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            ringtone = RingtoneManager.getRingtone(this, uri)?.apply {
                audioAttributes = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
                if (Build.VERSION.SDK_INT >= 28) isLooping = true
                play()
            }
        } catch (e: Exception) {
            Log.w(TAG, "alarm failed: ${e.message}")
        }
        vibrator()?.let {
            if (Build.VERSION.SDK_INT >= 26) {
                it.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 600, 400), 0))
            } else {
                @Suppress("DEPRECATION") it.vibrate(longArrayOf(0, 600, 400), 0)
            }
        }
    }

    private fun stopAlarm() {
        try { ringtone?.stop() } catch (_: Exception) {}
        ringtone = null
        vibrator()?.cancel()
    }

    private fun vibrator(): Vibrator? =
        if (Build.VERSION.SDK_INT >= 31) {
            (getSystemService(VIBRATOR_MANAGER_SERVICE) as? VibratorManager)?.defaultVibrator
        } else {
            @Suppress("DEPRECATION") getSystemService(VIBRATOR_SERVICE) as? Vibrator
        }

    // ------------------------------------------------------------------ notifications

    private fun createChannels() {
        if (Build.VERSION.SDK_INT < 26) return
        notifications.createNotificationChannel(
            NotificationChannel(CH_STATUS, "Protection status", NotificationManager.IMPORTANCE_LOW)
        )
        notifications.createNotificationChannel(
            NotificationChannel(CH_ALERT, "Accident alerts", NotificationManager.IMPORTANCE_HIGH).apply {
                enableVibration(false) // vibration is handled by startAlarm()
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
        )
    }

    private fun openAppIntent(): PendingIntent {
        val launch = packageManager.getLaunchIntentForPackage(packageName) ?: Intent()
        return PendingIntent.getActivity(this, 0, launch, PendingIntent.FLAG_IMMUTABLE)
    }

    private fun serviceAction(code: Int, action: String): PendingIntent =
        PendingIntent.getService(
            this, code,
            Intent(this, AccidentDetectionService::class.java).setAction(action),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

    // Big picture shown in the notification shade (decoded once, reused by both notifications).
    // File: android/app/src/main/res/drawable-nodpi/ic_notification_large.png
    private val largeIconBitmap by lazy {
        BitmapFactory.decodeResource(resources, R.drawable.ic_notification_large)
    }

    // Status-bar icon + tint colour. If your ic_stat_sos file lives in a mipmap-* folder,
    // change R.drawable.ic_stat_sos to R.mipmap.ic_stat_sos in both notifications.
    private fun statusNotification(): Notification =
        NotificationCompat.Builder(this, CH_STATUS)
            .setSmallIcon(R.drawable.ic_stat_sos)
            .setLargeIcon(largeIconBitmap)
            .setColor(0xFFE53935.toInt())
            .setContentTitle("Protection is on")
            .setContentText("Guardieyen is watching for accidents")
            .setOngoing(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(openAppIntent())
            .addAction(0, "Turn off", serviceAction(1, ACTION_STOP))
            .build()

    private fun alertNotification(secondsLeft: Int): Notification =
        NotificationCompat.Builder(this, CH_ALERT)
            .setSmallIcon(R.drawable.ic_stat_sos)
            .setLargeIcon(largeIconBitmap)
            .setColor(0xFFE53935.toInt())
            .setContentTitle("Possible accident detected")
            .setContentText("Alerting your contacts in ${secondsLeft}s. Tap \"I'm OK\" to cancel.")
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(openAppIntent())
            .addAction(0, "I'M OK - CANCEL", serviceAction(2, ACTION_CANCEL_ALERT))
            .addAction(0, "SEND NOW", serviceAction(3, ACTION_SEND_NOW))
            .build()

    private fun enterForeground(): Boolean = try {
        if (Build.VERSION.SDK_INT >= 29) {
            startForeground(ID_STATUS, statusNotification(), ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION)
        } else {
            startForeground(ID_STATUS, statusNotification())
        }
        true
    } catch (e: Exception) {
        Log.e(TAG, "startForeground failed: ${e.message}")
        false
    }
}