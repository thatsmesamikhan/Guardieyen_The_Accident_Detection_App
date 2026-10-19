package com.guardieyen

import kotlin.math.abs
import kotlin.math.max
import kotlin.math.sqrt

/**
 * Pure-Kotlin crash detector (no Android dependencies, so it can be unit-tested).
 * All timestamps are nanoseconds on the elapsedRealtime clock.
 *
 * Pipeline:
 *  1. TRAVEL GATE  - GPS speed in the 8 s before the spike must be >= 6 m/s (~22 km/h).
 *                    This alone rejects dancing, walking, running, phone drops, pocket bumps.
 *  2. IMPACT       - accelerometer magnitude spike >= 4 g.
 *  3. OBSERVE 8 s  - gather evidence: gyro spin, post-impact speed, post-impact stillness.
 *  4. SCORE        - crash only if the vehicle actually stopped (speed collapse) or the phone
 *                    went still with no GPS, AND the total score >= 5.
 *
 * Thresholds are STARTING POINTS. Tune them with real logs (adb logcat -s Guardieyen).
 */
class AccidentDetector(
    private val onCrash: (CrashEvidence) -> Unit,
    private val log: (String) -> Unit = {},
) {
    data class CrashEvidence(
        val peakG: Float,
        val gyroPeakRad: Float,
        val preSpeedMs: Float,
        val postSpeedMs: Float?,
        val still: Boolean,
        val score: Int,
    )

    private data class Fix(val t: Long, val speed: Float)

    private enum class State { IDLE, OBSERVING, COOLDOWN }

    companion object {
        const val G = 9.81f
        const val IMPACT_MS2 = 4f * G            // spike that starts an observation
        const val HARD_IMPACT_MS2 = 7f * G       // very hard hit -> extra score
        const val FREE_FALL_MS2 = 2.0f           // < 0.2 g  = free fall (dropped phone)
        const val FREE_FALL_MIN_SAMPLES = 4      // ~80 ms at 50 Hz
        const val MOTION_DEV_MS2 = 1.5f          // deviation from 1 g that counts as "moving"
        const val TRAVEL_SPEED_MS = 6.0f         // must have been travelling at least this fast
        const val POST_SPEED_MAX_MS = 3.0f       // avg speed after impact must be below this
        const val GYRO_ROLL_RAD = 5.0f           // ~290 deg/s -> tumbling / rollover
        const val STILL_STD_MS2 = 1.0f           // std-dev of magnitude when "still"
        const val MIN_STILL_SAMPLES = 100        // ~2 s of samples
        const val TRIGGER_SCORE = 5

        const val NS = 1_000_000_000L
        const val PRE_WINDOW_NS = 8 * NS
        const val OBSERVE_NS = 8 * NS
        const val STILL_FROM_NS = 3 * NS
        const val PEAK_WINDOW_NS = NS / 2
        const val FREE_FALL_LOOKBACK_NS = 600_000_000L
        const val REJECT_COOLDOWN_NS = 5 * NS
        const val TRIGGER_COOLDOWN_NS = 60 * NS
    }

    private var state = State.IDLE
    private var cooldownUntil = 0L

    // current candidate
    private var impactNs = 0L
    private var peakAcc = 0f
    private var preSpeed = 0f
    private var gyroPeak = 0f
    private var freeFallBefore = false
    private var n = 0
    private var mean = 0.0
    private var m2 = 0.0

    // rolling context
    private val fixes = ArrayDeque<Fix>()
    private var ffRun = 0
    private var lastFreeFallNs = Long.MIN_VALUE / 2
    private var gyroWinStart = 0L
    private var gyroWinPeak = 0f

    /** Last time the device moved or travelled; used by the service for power gating. */
    @Volatile
    var lastActivityNs = 0L
        private set

    val isIdle: Boolean get() = state == State.IDLE

    fun markActivity(t: Long) {
        lastActivityNs = t
    }

    fun onSpeed(t: Long, speedMs: Float) {
        fixes.addLast(Fix(t, speedMs))
        while (fixes.size > 40) fixes.removeFirst()
        if (speedMs >= 1f) lastActivityNs = t
    }

    fun onGyro(t: Long, x: Float, y: Float, z: Float) {
        val w = sqrt(x * x + y * y + z * z)
        if (state == State.OBSERVING) {
            if (t - impactNs <= 3 * NS / 2) gyroPeak = max(gyroPeak, w)
            return
        }
        if (t - gyroWinStart > NS) {
            gyroWinStart = t
            gyroWinPeak = w
        } else {
            gyroWinPeak = max(gyroWinPeak, w)
        }
    }

    fun onAccel(t: Long, x: Float, y: Float, z: Float) {
        val a = sqrt(x * x + y * y + z * z)

        if (abs(a - G) > MOTION_DEV_MS2) lastActivityNs = t

        if (a < FREE_FALL_MS2) {
            ffRun++
            if (ffRun >= FREE_FALL_MIN_SAMPLES) lastFreeFallNs = t
        } else {
            ffRun = 0
        }

        when (state) {
            State.IDLE -> if (a >= IMPACT_MS2) tryBegin(t, a)

            State.OBSERVING -> {
                // A newer spike (>1 s later) becomes the reference impact, so a pothole
                // followed by a real crash is still caught.
                if (a >= IMPACT_MS2 && t - impactNs > NS) {
                    tryBegin(t, a)
                    return
                }
                if (t - impactNs <= PEAK_WINDOW_NS && a > peakAcc) peakAcc = a
                if (t - impactNs >= STILL_FROM_NS) {
                    n++
                    val d = a - mean
                    mean += d / n
                    m2 += d * (a - mean)
                }
                if (t - impactNs >= OBSERVE_NS) evaluate(t)
            }

            State.COOLDOWN -> if (t >= cooldownUntil) state = State.IDLE
        }
    }

    private fun tryBegin(t: Long, a: Float) {
        val pre = fixes.filter { t - it.t in 0L..PRE_WINDOW_NS }.maxOfOrNull { it.speed } ?: 0f
        if (pre < TRAVEL_SPEED_MS) return // not travelling -> ignore (dance, drop, walk...)

        state = State.OBSERVING
        impactNs = t
        peakAcc = a
        preSpeed = pre
        gyroPeak = if (t - gyroWinStart <= NS) gyroWinPeak else 0f
        freeFallBefore = t - lastFreeFallNs <= FREE_FALL_LOOKBACK_NS
        n = 0
        mean = 0.0
        m2 = 0.0
        log("impact ${"%.1f".format(a / G)}g while travelling ${"%.1f".format(pre * 3.6f)} km/h -> observing")
    }

    private fun evaluate(t: Long) {
        val post = fixes.filter { it.t >= impactNs + 2 * NS && it.t <= t }
        val postSpeed: Float? = if (post.isEmpty()) null else post.map { it.speed }.average().toFloat()
        val speedCollapsed = postSpeed != null && postSpeed <= POST_SPEED_MAX_MS
        val std = if (n > 1) sqrt(m2 / n).toFloat() else Float.MAX_VALUE
        val still = n >= MIN_STILL_SAMPLES && std <= STILL_STD_MS2

        var score = 2
        if (peakAcc >= HARD_IMPACT_MS2) score += 1
        if (gyroPeak >= GYRO_ROLL_RAD) score += 1
        if (speedCollapsed) score += 2
        if (still) score += 2
        if (freeFallBefore) score -= 2 // looks like a dropped phone

        val decisive = speedCollapsed || (still && postSpeed == null)
        val crash = decisive && score >= TRIGGER_SCORE

        log(
            "verdict: peak=${"%.1f".format(peakAcc / G)}g gyro=${"%.1f".format(gyroPeak)}rad/s " +
                "pre=${"%.1f".format(preSpeed)}m/s post=$postSpeed still=$still " +
                "freeFall=$freeFallBefore score=$score -> ${if (crash) "CRASH" else "ignored"}"
        )

        state = State.COOLDOWN
        cooldownUntil = t + if (crash) TRIGGER_COOLDOWN_NS else REJECT_COOLDOWN_NS
        if (crash) {
            onCrash(CrashEvidence(peakAcc / G, gyroPeak, preSpeed, postSpeed, still, score))
        }
    }
}