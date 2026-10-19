// src/screens/Home/HomeScreen.tsx

import { ActivityIndicator, Alert, Pressable, StyleSheet, View, Vibration } from 'react-native'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, FONT, hp } from '../../enums/StyleGuide'
import { IconButton, KeyboardAware, NavBar, TextLabel } from '../../commons'
import { IMAGES } from '../../assets/images'
import { AllergiesCard, BloodGroupInfoCard, ContactCard, HomeScreenHeaderCard, HomeScreenInfoCard, LocationInfoCard } from '../../components'
import { useFirestoreDoc } from '../../hooks/firestore/useFirestoreDoc'
import { useFirestoreCollection } from '../../hooks/firestore/useFirestoreCollection'
import { getAuth } from '@react-native-firebase/auth'
import Geolocation from '@react-native-community/geolocation'
import { useIsFocused } from '@react-navigation/native'
import { useCurrentLocation } from '../../hooks/useCurrentLocation'
import {
    requestLocationPermission,
    getCurrentUserIdToken,
} from '../../services/pushNotifications'
import { useProtection } from '../../hooks/useProtection'

interface MedicalInfoData {
    bloodGroup: string
    condition: string
    allergies: string[]
    emergencyNote: string
}

const DEFAULT_MEDICAL_INFO: MedicalInfoData = {
    bloodGroup: '',
    condition: '',
    allergies: [],
    emergencyNote: '',
}

// Matches isValidContactData in firestore.rules — each contact is its
// own document under users/{uid}/emergencyContacts/{contactId}, NOT a
// single doc holding an array. So this is a COLLECTION read, not a doc read.
interface EmergencyContactData {
    contactUid: string
    name: string
    email: string
    relation: string
    addedBy: string
}

const SOS_ENDPOINT = 'https://sos-notify-api.vercel.app/api/send-sos'
const SOS_REQUEST_TIMEOUT_MS = 10000

const HomeScreen = () => {
    // const [isSwitchOn, setIsSwitchOn] = useState(false)
    const [bloodGroup, setBloodGroup] = useState('')
    const [condition, setCondition] = useState('')
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
    const [emergencyNote, setEmergencyNote] = useState('')
    const [sendingSos, setSendingSos] = useState(false) // ADDED — disables re-triggering mid-send

    const { data, fetching } = useFirestoreDoc<MedicalInfoData>({
        path: ['medicalInfo', 'details'],
        defaultValue: DEFAULT_MEDICAL_INFO,
    })

    // getDocs() over users/{uid}/emergencyContacts — one doc per contact.
    const { items: contactsData, fetching: contactsFetching } = useFirestoreCollection<EmergencyContactData>({
        path: ['emergencyContacts'],
    })
    const { isOn, toggle, cards, lastUpdated } = useProtection(contactsData.length, contactsFetching)

    useEffect(() => {
        if (!fetching) {
            setBloodGroup(data.bloodGroup ?? '')
            setCondition(data.condition ?? '')
            setEmergencyNote(data.emergencyNote ?? '')
            setSelectedAllergies(Array.isArray(data.allergies) ? data.allergies : [])
        }
    }, [fetching])

    // Real blood-group / condition data, built from Firestore state —
    // replaces the old dummy bloodGroupInfoData import. Shape stays the
    // same ({ id, title, info }) so BloodGroupInfoCard needs no changes.
    const bloodGroupInfoData = useMemo(
        () => [
            { id: 1, title: 'BLOOD GROUP', info: bloodGroup || '—' },
            { id: 2, title: 'CONDITIONS', info: condition || '—' },
        ],
        [bloodGroup, condition]
    )

    const removeAllergy = (allergyToRemove: string) => {
        setSelectedAllergies(prev => prev.filter(item => item !== allergyToRemove))
    }

    const toCardItem = (contact: EmergencyContactData & { id: string }) => ({
        title: contact.name ?? 'Unnamed Contact',
        relation: contact.relation ?? '—',
        image: IMAGES.DEFAULT_USER,
    })

    // Wraps a promise so a hung network/location call can't block the SOS
    // flow forever with no feedback to the user.
    const isFocused = useIsFocused()
    const { coords, coordsRef, error: locationError } = useCurrentLocation(isFocused)
    const sosLockRef = useRef(false) // ref, not state: state can't block two presses in the same tick

    const formatCoord = (v: number, pos: string, neg: string) =>
        `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`

    const locationInfoData = useMemo(() => [
        { id: 1, title: 'LATITUDE', info: coords ? formatCoord(coords.latitude, 'N', 'S') : '—' },
        { id: 2, title: 'LONGITUDE', info: coords ? formatCoord(coords.longitude, 'E', 'W') : '—' },
        { id: 3, title: 'ACCURACY', info: coords?.accuracy != null ? `±${Math.round(coords.accuracy)}m` : '—' },
    ], [coords])

    const getCurrentPositionAsync = (): Promise<{ latitude: number; longitude: number; accuracy: number | null }> =>
        new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy ?? null }),
                reject,
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
            )
        })

    const handleSOS = async () => {
        if (sosLockRef.current) return
        sosLockRef.current = true
        setSendingSos(true)
        Vibration.vibrate(200) // confirms the 2s hold registered

        try {
            if (contactsData.length === 0) {
                Alert.alert('No contacts', 'Add at least one emergency contact first.')
                return
            }

            const hasLocationPermission = await requestLocationPermission()
            if (!hasLocationPermission) {
                Alert.alert('Location permission is required to send your SOS.')
                return
            }

            const idToken = await getCurrentUserIdToken()
            if (!idToken) {
                Alert.alert('You need to be signed in to send an SOS.')
                return
            }

            // Fresh fix if possible; otherwise fall back to the last known one
            // from the live watcher. A slightly old location beats no SOS.
            let position: { latitude: number; longitude: number; accuracy: number | null }
            try {
                position = await getCurrentPositionAsync()
            } catch (locationErr) {
                console.warn('Fresh location failed, using last known:', locationErr)
                if (!coordsRef.current) {
                    Alert.alert('Could not get your location. Enable GPS and try again.')
                    return
                }
                position = coordsRef.current
            }

            const senderName = getAuth().currentUser?.displayName ?? 'Emergency Contact'

            // AbortController actually cancels the request (the old Promise.race didn't)
            const controller = new AbortController()
            const timer = setTimeout(() => controller.abort(), SOS_REQUEST_TIMEOUT_MS)
            try {
                const response = await fetch(SOS_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                    body: JSON.stringify({
                        senderName,
                        latitude: position.latitude,
                        longitude: position.longitude,
                        accuracy: position.accuracy,
                        kind: 'sos',
                    }),
                    signal: controller.signal,
                })
                if (!response.ok) {
                    const errBody = await response.json().catch(() => ({}))
                    throw new Error(errBody.error ?? `SOS request failed (${response.status})`)
                }
                Alert.alert('Contacts Alerted')
            } catch (fetchErr) {
                console.error('SOS send failed:', fetchErr)
                Alert.alert('Failed to send SOS. Check your connection and try again.')
            } finally {
                clearTimeout(timer)
            }
        } catch (err) {
            console.error('SOS handler failed:', err)
            Alert.alert('Something went wrong sending the SOS.')
        } finally {
            sosLockRef.current = false
            setSendingSos(false)
        }
    }

    const { data: profile } = useFirestoreDoc<{ name: string }>({
        path: [],
        defaultValue: { name: '' },
    })

    const userName = useMemo(() => {
        const raw = (profile.name ?? '').trim().replace(/\s+/g, ' ')
        if (!raw) return getAuth().currentUser?.displayName ?? ''
        // "SAMI KHAN" -> "Sami Khan" (only when the whole name is upper-case)
        return raw === raw.toUpperCase()
            ? raw.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase())
            : raw
    }, [profile.name])

    const greeting = userName
        ? `Hi, ${userName.length > 20 ? userName.split(' ')[0] : userName}`
        : 'Hi there'

    return (
        <SafeAreaView edges={['top']} style={styles.safeView}>
            <NavBar headerLabel={greeting} subHeaderLabel='Monitoring active & secure' />
            <KeyboardAware>

                {/* HEADER */}
                <HomeScreenHeaderCard
                    isSwitchOn={isOn}
                    switchPress={toggle}
                    lastUpdated={lastUpdated}
                    percentOfSafeScore={98}
                />

                {/* COMPONENTS INFO */}
                <View style={styles.infoContainer}>
                    {cards.map(item => <HomeScreenInfoCard key={item.id} item={item} />)}
                </View>

                {/* EMERGENCY CONTACTS HEADER */}
                <View style={styles.contactsTextContainer}>
                    <TextLabel text='Emergency Contacts' style={styles.emergencyLabel} />
                    <TextLabel selectable text='+ Add Contact' style={styles.addContactLabel} />
                </View>

                {contactsFetching ? (
                    <ActivityIndicator size='small' color={COLORS.red} style={{ marginTop: hp('1%') }} />
                ) : contactsData.length === 0 ? (
                    <TextLabel text='No emergency contacts added yet.' style={{ fontSize: 12, color: COLORS.grey3, marginTop: hp('0.5%') }} />
                ) : (
                    contactsData.slice(0, 3).map((item) =>
                        <ContactCard
                            key={item.id}
                            item={toCardItem(item)}
                            container={{ backgroundColor: COLORS.white }}
                            subTitleStyle={{ color: COLORS.black }}
                        />
                    )
                )}

                {/* MED INFO CARD */}
                <View style={styles.medInfoCard}>
                    <View style={styles.medInfoHeader}>
                        <View style={styles.medInfoTitle}>
                            <IconButton disabled={true} source={IMAGES.MEDICAL} iconStyle={{ tintColor: COLORS.red }} />
                            <TextLabel numberOfLines={1} text='Medical Information' style={styles.emergencyLabel} />
                        </View>
                        <TextLabel selectable text='Edit' style={[styles.addContactLabel, { textDecorationLine: 'underline' }]} />
                    </View>
                    <View style={styles.bloodGroupContainer}>
                        {
                            bloodGroupInfoData.map((item) => <BloodGroupInfoCard key={item?.id} item={item} />)
                        }
                    </View>
                    <View style={styles.allergiesContainer}>
                        <TextLabel numberOfLines={1} text={'ALLERGIES'} style={styles.titleStyle} />
                    </View>
                    {selectedAllergies.length > 0 && (
                        <View style={styles.allergies}>
                            {selectedAllergies.map(item => (
                                <AllergiesCard
                                    key={item}
                                    item={{ allergies: item }}
                                    onRemove={() => removeAllergy(item)}
                                />
                            ))}
                        </View>
                    )}
                    <View style={styles.allergiesContainer}>
                        <TextLabel numberOfLines={1} text={'EMERGENCY NOTES'} style={styles.titleStyle} />
                    </View>
                    <View style={{
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'flex-start'
                    }}>
                        <TextLabel text={emergencyNote} style={{ fontSize: 14, marginTop: hp('0.5%') }} />
                    </View>
                </View>

                {/* LOCATION INFO CARD */}
                <View style={styles.locationContainer}>
                    <View style={styles.medInfoHeader}>
                        <View style={styles.medInfoTitle}>
                            <IconButton disabled={true} source={IMAGES.GPS} iconStyle={{ tintColor: COLORS.bgColor }} containerStyle={{ backgroundColor: COLORS.red }} />
                            <TextLabel numberOfLines={1} text='Current Location' style={[styles.emergencyLabel, { color: COLORS.white }]} />
                        </View>
                        <View style={[styles.safetyBadge, { backgroundColor: COLORS.lightRed }]}>
                            <TextLabel
                                text={locationError ? 'GPS Off' : coords ? 'GPS Active' : 'Locating…'}
                                style={[styles.safetyBadgeText, { color: COLORS.black }]}
                            />
                        </View>
                    </View>
                    <View style={styles.latitudeContainer}>
                        {locationInfoData.map((item) => <LocationInfoCard key={item.id} item={item} />)}
                    </View>
                </View>

                {/* SOS BUTTON */}
                <Pressable
                    delayLongPress={2000}
                    onLongPress={handleSOS}
                    disabled={sendingSos}
                    android_ripple={{ color: COLORS.lightGrey }} style={styles.emergencySosButton}>
                    {sendingSos ? (
                        <ActivityIndicator size='small' color={COLORS.red} />
                    ) : (
                        <IconButton disabled={true} source={IMAGES.SOS} />
                    )}
                    <View>
                        <TextLabel text={sendingSos ? 'Sending SOS…' : 'Emergency SOS'} style={[styles.titleStyle, styles.emergencySOStitle]} />
                        <TextLabel text={`Hold for 2 seconds to notify your\nemergency contacts.`} style={styles.emergencySubTitleStyle} />
                    </View>
                </Pressable>

            </KeyboardAware>
        </SafeAreaView>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    safeView: {
        flex: 1,
        backgroundColor: COLORS.bgColor,
    },
    infoContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: hp('1%'),
        flexWrap: 'wrap'
    },
    safetyBadge: {
        padding: 3,
        borderRadius: 20,
        backgroundColor: COLORS.lightRed,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8
    },
    safetyBadgeText: {
        fontSize: 10,
        color: COLORS.red
    },
    contactsTextContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: hp('1%'),
        marginBottom: hp('1')
    },
    emergencyLabel: {
        fontFamily: FONT.semiBold
    },
    addContactLabel: {
        color: COLORS.red,
        fontSize: 13
    },
    titleStyle: {
        color: COLORS.grey3,
        fontSize: 11.5
    },
    infoStyle: {
        color: COLORS.red,
        fontFamily: FONT.semiBold,
        fontSize: 16,
        marginTop: -3
    },
    medInfoCard: {
        width: '100%',
        borderRadius: 16,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        marginTop: hp('2%'),
        borderWidth: 0.7,
        borderColor: COLORS.red
    },
    medInfoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    },
    medInfoTitle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bloodGroupContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: hp('1%'),
    },
    allergiesContainer: {
        width: '100%',
        marginTop: hp('1.5%')
    },
    allergies: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        width: '100%',
        marginTop: hp('0.5%')
    },
    emergencySubTitleStyle: {
        fontSize: 12,
    },
    emergencySosButton: {
        width: '100%',
        borderRadius: 16,
        padding: 12,
        backgroundColor: COLORS.lightRed,
        marginTop: hp('2%'),
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    emergencySOStitle: {
        color: COLORS.red,
        fontFamily: FONT.semiBold,
        fontSize: 15
    },
    latitudeContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: hp('1%'),
        borderTopWidth: 0.3,
        borderTopColor: COLORS.lightRed
    },
    locationContainer: {
        width: '100%',
        borderRadius: 16,
        backgroundColor: COLORS.red,
        padding: 12,
        marginTop: hp('2%'),
        paddingBottom: hp('2%')
    }
})