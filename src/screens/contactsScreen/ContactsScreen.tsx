import { StyleSheet, View, SectionList, Image, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { ACTIVE_OPACITY, COLORS, FONT, hp } from '../../enums/StyleGuide'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NavBar, TextLabel } from '../../commons'
import { IMAGES } from '../../assets/images'
import { ContactCard } from '../../components'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { SCREENS } from '../../enums'
import { Section, SECTION_ORDER } from '../../dummy/Dummies'
import { getAuth } from '@react-native-firebase/auth'
import Toast from 'react-native-toast-message'
import { collection, getDocs, getFirestore } from '@react-native-firebase/firestore'

const ContactsScreen = () => {
    const [contactsData, setContactsData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)      // first-load state (drives empty/skeleton state)
    const [refreshing, setRefreshing] = useState(false) // pull-to-refresh + focus-refresh spinner
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
    const navigation = useNavigation<any>()

    // Fetch contacts. `isActive` lets the caller cancel state updates if the
    // screen blurs/unmounts before the request resolves (avoids "set state
    // on unmounted component" warnings and race conditions on fast nav).
    const fetchContacts = useCallback(async (isActiveRef: { current: boolean }) => {
        const auth = getAuth()
        const currentUser = auth.currentUser

        if (!currentUser) {
            if (isActiveRef.current) {
                Toast.show({
                    type: 'error',
                    text1: 'Not Signed In',
                    text2: 'Please log in again and try again.',
                })
                setLoading(false)
                setRefreshing(false)
            }
            return
        }

        try {
            const firestore = getFirestore()
            const contactsRef = collection(firestore, 'users', currentUser.uid, 'emergencyContacts')
            const snapshot = await getDocs(contactsRef)

            const data = snapshot.docs.map((docSnap) => ({
                id: docSnap.id, // = contactUid, used as the stable key
                ...docSnap.data(),
            }))

            if (isActiveRef.current) {
                setContactsData(data)
            }
        } catch (error: any) {
            console.log('getContactDetails error:', error)
            if (isActiveRef.current) {
                Toast.show({
                    type: 'error',
                    text1: 'Something Went Wrong',
                    text2: error?.message ?? 'Could not load contacts. Please try again.',
                })
            }
        } finally {
            if (isActiveRef.current) {
                setLoading(false)
                setRefreshing(false)
                setHasLoadedOnce(true)
            }
        }
    }, [])

    // Refetch every time the screen gains focus (first mount included),
    // and drive the RefreshControl spinner while doing it so the user sees
    // the same familiar "pulling" affordance rather than a silent update.
    useFocusEffect(
        useCallback(() => {
            const isActiveRef = { current: true }
            setRefreshing(true)
            fetchContacts(isActiveRef)

            return () => {
                isActiveRef.current = false
            }
        }, [fetchContacts])
    )

    // Manual pull-to-refresh handler (shares the same fetch path)
    const onRefresh = useCallback(() => {
        const isActiveRef = { current: true }
        setRefreshing(true)
        fetchContacts(isActiveRef)
    }, [fetchContacts])

    const sections: Section[] = SECTION_ORDER
        .map(({ key, label }) => ({
            title: label,
            data: contactsData.filter((c) => c.relation === key),
        }))
        .filter((section) => section.data.length > 0)

    const totalContacts = contactsData.length
    const showEmptyState = hasLoadedOnce && !refreshing && totalContacts === 0

    const toCardItem = (contact: any) => ({
        title: contact.name ?? 'Unnamed Contact',
        relation: contact.relation ?? '—',
        image: IMAGES.DEFAULT_USER, // fallback avatar — Firestore doc has no image field
    })

    return (
        <SafeAreaView edges={['top']} style={styles.safeView}>
            <NavBar headerLabel='My Contacts' />

            <SectionList
                sections={sections}
                keyExtractor={(item) => String(item.id)}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.red}
                        colors={[COLORS.red]}
                    />
                }
                ListHeaderComponent={
                    <View style={styles.infoBanner}>
                        <View style={styles.infoIconWrap}>
                            <View style={styles.infoIconDot} />
                        </View>
                        <TextLabel
                            text='These people will be notified instantly with your live location when an accident is detected.'
                            style={styles.infoText}
                        />
                    </View>
                }
                renderSectionHeader={({ section }) => (
                    <View style={styles.sectionHeaderRow}>
                        <TextLabel text={section.title.toUpperCase()} style={styles.sectionTitle} />
                        <View style={styles.sectionLine} />
                        <TextLabel text={`${section.data.length}`} style={styles.sectionCount} />
                    </View>
                )}
                renderItem={({ item }) => (
                    <ContactCard
                        item={toCardItem(item)}
                        container={{ backgroundColor: COLORS.white }}
                        subTitleStyle={{ color: COLORS.black }}
                    />
                )}
                SectionSeparatorComponent={() => <View style={{ height: hp('0.6%') }} />}
                ListEmptyComponent={
                    showEmptyState ? (
                        <View style={styles.emptyState}>
                            <TextLabel text='No emergency contacts yet' style={styles.emptyTitle} />
                            <TextLabel
                                text='Tap "Add Contact" below to add someone who should be notified in an emergency.'
                                style={styles.emptySubtitle}
                            />
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    totalContacts > 0 ? (
                        <View style={styles.footerNote}>
                            <TextLabel
                                text={`${totalContacts} emergency contact${totalContacts > 1 ? 's' : ''} configured`}
                                style={styles.footerNoteText}
                            />
                        </View>
                    ) : null
                }
            />
            <TouchableOpacity onPress={() => navigation.navigate(SCREENS.ADD_CONTACT_SCREEN)} activeOpacity={ACTIVE_OPACITY} style={styles.fabStyle}>
                <Image source={IMAGES.ADD_CONTACT} style={styles.fabIcon} />
                <TextLabel text='Add Contact' style={styles.fabTitle} />
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default ContactsScreen

const styles = StyleSheet.create({
    safeView: {
        flex: 1,
        backgroundColor: COLORS.bgColor,
    },
    listContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: hp('12%')
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.lightRed,
        borderRadius: 14,
        padding: 14,
        marginTop: hp('1.8%'),
        elevation: 3
    },
    infoIconWrap: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: COLORS.red,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginTop: 1,
    },
    infoIconDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.white,
    },
    infoText: {
        flex: 1,
        fontSize: 12.5,
        lineHeight: 18,
        color: COLORS.black,
        fontFamily: FONT.medium ?? FONT.regular,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp('1%'),
    },
    sectionTitle: {
        fontFamily: FONT.semiBold,
        fontSize: 12.5,
        letterSpacing: 0.8,
        color: COLORS.black,
    },
    sectionLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.grey5 ?? '#E2E2E2',
        marginHorizontal: 10,
    },
    sectionCount: {
        fontSize: 12,
        fontFamily: FONT.semiBold,
        color: COLORS.grey3,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: hp('8%'),
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontFamily: FONT.semiBold,
        fontSize: 15,
        color: COLORS.black,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 12.5,
        lineHeight: 18,
        color: COLORS.grey3,
        textAlign: 'center',
    },
    footerNote: {
        alignItems: 'center',
        marginTop: hp('3%'),
    },
    footerNoteText: {
        fontSize: 11.5,
        color: COLORS.grey3,
    },
    fabStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: COLORS.red,
        paddingVertical: 9,
        paddingHorizontal: 13,
        flexDirection: 'row',
        gap: 5,
        position: 'absolute',
        bottom: hp('12%'),
        right: '5%'
    },
    fabIcon: {
        height: 20,
        width: 20,
        tintColor: COLORS.white
    },
    fabTitle: {
        fontFamily: FONT.semiBold,
        color: COLORS.white,
        fontSize: 13
    }
})