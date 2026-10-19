package com.guardieyen

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

/**
 * Runs the JS task "AccidentSosTask" (registered in index.js) even when the UI is closed.
 * JS owns the Firebase session, so it fetches the ID token and calls your SOS endpoint.
 */
class AccidentSosTaskService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        val extras = intent?.extras ?: return null
        return HeadlessJsTaskConfig(
            "AccidentSosTask",
            Arguments.fromBundle(extras),
            90_000, // timeout ms (covers retries)
            true    // also allowed while the app is in the foreground
        )
    }
}

/** Restarts protection after a reboot if the user had it switched on. */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        val enabled = context
            .getSharedPreferences(AccidentDetectionService.PREFS, Context.MODE_PRIVATE)
            .getBoolean(AccidentDetectionService.KEY_ENABLED, false)
        if (!enabled) return
        try {
            ContextCompat.startForegroundService(
                context,
                Intent(context, AccidentDetectionService::class.java)
                    .setAction(AccidentDetectionService.ACTION_START)
            )
        } catch (e: Exception) {
            Log.w(AccidentDetectionService.TAG, "Boot restart blocked: ${e.message}")
        }
    }
}