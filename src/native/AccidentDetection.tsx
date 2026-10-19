import { NativeModules, Platform } from 'react-native'

export interface ProtectionStatus {
    enabled: boolean
    running: boolean
    standby: boolean
    alerting: boolean
    hasAccelerometer: boolean
    hasGyroscope: boolean
    sensorsFlowing: boolean
    locationEnabled: boolean
    gpsFix: boolean
    batteryOptimizationIgnored: boolean
}

const EMPTY_STATUS: ProtectionStatus = {
    enabled: false,
    running: false,
    standby: false,
    alerting: false,
    hasAccelerometer: false,
    hasGyroscope: false,
    sensorsFlowing: false,
    locationEnabled: false,
    gpsFix: false,
    batteryOptimizationIgnored: false,
}

const native = NativeModules.AccidentDetection
const supported = Platform.OS === 'android' && !!native

export const AccidentDetection = {
    isSupported: supported,
    start: (): Promise<boolean> =>
        supported ? native.start() : Promise.reject(new Error('Accident detection is Android-only.')),
    stop: (): Promise<boolean> => (supported ? native.stop() : Promise.resolve(true)),
    getStatus: (): Promise<ProtectionStatus> =>
        supported ? native.getStatus() : Promise.resolve(EMPTY_STATUS),
    openBatterySettings: () => supported && native.openBatterySettings(),
    openLocationSettings: () => supported && native.openLocationSettings(),
    /** DEV ONLY: triggers the countdown + SOS pipeline without a real crash. */
    debugTriggerAlert: () => supported && native.debugTriggerAlert(),
}