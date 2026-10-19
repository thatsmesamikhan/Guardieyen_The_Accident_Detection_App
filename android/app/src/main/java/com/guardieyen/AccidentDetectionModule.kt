package com.guardieyen

import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorManager
import android.location.LocationManager
import android.os.PowerManager
import android.os.SystemClock
import android.provider.Settings
import android.util.Log
import androidx.core.content.ContextCompat
import androidx.core.location.LocationManagerCompat
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager

class AccidentDetectionModule(private val rc: ReactApplicationContext) :
    ReactContextBaseJavaModule(rc) {

    override fun getName() = "AccidentDetection"

    @ReactMethod
    fun start(promise: Promise) {
        try {
            val i = Intent(rc, AccidentDetectionService::class.java)
                .setAction(AccidentDetectionService.ACTION_START)
            ContextCompat.startForegroundService(rc, i)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("START_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        rc.getSharedPreferences(AccidentDetectionService.PREFS, Context.MODE_PRIVATE)
            .edit().putBoolean(AccidentDetectionService.KEY_ENABLED, false).apply()
        rc.stopService(Intent(rc, AccidentDetectionService::class.java))
        promise.resolve(true)
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        try {
            val sm = rc.getSystemService(Context.SENSOR_SERVICE) as SensorManager
            val lm = rc.getSystemService(Context.LOCATION_SERVICE) as LocationManager
            val pm = rc.getSystemService(Context.POWER_SERVICE) as PowerManager
            val now = SystemClock.elapsedRealtime()
            val running = AccidentDetectionService.running
            val standby = AccidentDetectionService.standby

            val map = Arguments.createMap()
            map.putBoolean(
                "enabled",
                rc.getSharedPreferences(AccidentDetectionService.PREFS, Context.MODE_PRIVATE)
                    .getBoolean(AccidentDetectionService.KEY_ENABLED, false)
            )
            map.putBoolean("running", running)
            map.putBoolean("standby", standby)
            map.putBoolean("alerting", AccidentDetectionService.alerting)
            map.putBoolean("hasAccelerometer", sm.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) != null)
            map.putBoolean("hasGyroscope", sm.getDefaultSensor(Sensor.TYPE_GYROSCOPE) != null)
            map.putBoolean(
                "sensorsFlowing",
                running && (standby || now - AccidentDetectionService.lastSensorMs < 5_000)
            )
            map.putBoolean("locationEnabled", LocationManagerCompat.isLocationEnabled(lm))
            map.putBoolean("gpsFix", now - AccidentDetectionService.lastFixMs < 15_000)
            map.putBoolean("batteryOptimizationIgnored", pm.isIgnoringBatteryOptimizations(rc.packageName))
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("STATUS_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun openBatterySettings() = launch(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)

    @ReactMethod
    fun openLocationSettings() = launch(Settings.ACTION_LOCATION_SOURCE_SETTINGS)

    /** DEV ONLY: runs the alert + countdown + SOS pipeline without a real crash. */
    @ReactMethod
    fun debugTriggerAlert() {
        rc.startService(
            Intent(rc, AccidentDetectionService::class.java)
                .setAction(AccidentDetectionService.ACTION_DEBUG_ALERT)
        )
    }

    private fun launch(action: String) {
        try {
            rc.startActivity(Intent(action).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        } catch (e: Exception) {
            Log.w(AccidentDetectionService.TAG, "Cannot open settings: ${e.message}")
        }
    }
}

class AccidentDetectionPackage : ReactPackage {
    override fun createNativeModules(rc: ReactApplicationContext): List<NativeModule> =
        listOf(AccidentDetectionModule(rc))

    override fun createViewManagers(rc: ReactApplicationContext): List<ViewManager<*, *>> =
        emptyList()
}