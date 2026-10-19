import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ACTIVE_OPACITY, COLORS, commonStyles, FONT, hp, wp } from '../../../enums/StyleGuide'
import { KeyboardAware, NavBar, TextLabel } from '../../../commons'
import { useNavigation } from '@react-navigation/native'
import { IMAGES } from '../../../assets/images'
import QRCode from 'react-native-qrcode-svg'
import { getAuth } from '@react-native-firebase/auth'
import { useFirestoreDoc } from '../../../hooks/firestore/useFirestoreDoc'

const ProfileScreen = () => {
    const navigation = useNavigation<any>()
    const { data: profile } = useFirestoreDoc<{ name: string; email: string }>({
        path: [],
        defaultValue: { name: '', email: '' },
    })

    const authUser = getAuth().currentUser

    const displayName = useMemo(() => {
        const raw = (profile.name || authUser?.displayName || '').trim().replace(/\s+/g, ' ')
        // "SAMI KHAN" -> "Sami Khan" (only when the whole name is upper-case)
        return raw && raw === raw.toUpperCase()
            ? raw.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase())
            : raw
    }, [profile.name, authUser?.displayName])

    const email = profile.email || authUser?.email || ''
    return (
        <SafeAreaView style={commonStyles.safeView}>
            <NavBar headerLabel='Your Profile' leftPress={() => navigation.goBack()} />
            <KeyboardAware>
                <View style={styles.headerCard}>
                    {/* <View style={styles.avatarWrap}>
                        <View style={styles.avatarRing}>
                            <Image source={IMAGES.DEFAULT_USER} resizeMode='cover' style={styles.avatar} />
                        </View>
                        <TouchableOpacity activeOpacity={ACTIVE_OPACITY} style={styles.editBadge}>
                            <Image source={IMAGES.PENCIL} resizeMode='contain' style={styles.editIcon} />
                        </TouchableOpacity>
                    </View> */}

                    <TextLabel text={displayName || '—'} numberOfLines={1} style={styles.nameText} />
                    <TextLabel text={email || '—'} numberOfLines={1} style={styles.emailText} />

                    <View style={styles.statusPill}>
                        <View style={styles.statusDot} />
                        <TextLabel text='Emergency Profile Active' style={styles.statusText} />
                    </View>
                </View>

                <View style={styles.qrSection}>
                    <View style={styles.qrCard}>
                        <View style={styles.qrTopRow}>

                            <View style={{ flex: 1, marginLeft: wp('3%') }}>
                                <TextLabel text='Emergency Contact Code' numberOfLines={1} style={styles.qrTitle} />
                                <TextLabel text='Let others scan to add you' numberOfLines={1} style={styles.qrSubtitle} />
                            </View>
                        </View>

                        <View style={styles.qrCodeWrap}>
                            <View style={styles.qrCodeInner}>
                                <QRCode
                                    logo={IMAGES.APP_ICON}
                                    value='Just some string value'
                                    logoSize={32}
                                    logoBackgroundColor='transparent'
                                    size={hp('22%')}
                                    backgroundColor={COLORS.white}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </KeyboardAware>
        </SafeAreaView>
    )
}

export default ProfileScreen

const styles = StyleSheet.create({
    headerCard: {
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: hp('3%'),
        paddingBottom: hp('2.5%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarWrap: {
        height: 96,
        width: 96,
        marginBottom: hp('1.5%'),
    },
    avatarRing: {
        height: '100%',
        width: '100%',
        borderRadius: 50,
        padding: 3,
        backgroundColor: COLORS.lightRed,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        height: '100%',
        width: '100%',
        borderRadius: 50,
    },
    editBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.red,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        bottom: 0,
        borderWidth: 2,
        borderColor: COLORS.white,
        shadowColor: COLORS.red,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    editIcon: {
        height: '70%',
        width: '70%',
        tintColor: COLORS.white,
    },
    nameText: {
        fontFamily: FONT.semiBold,
        fontSize: 19,
        marginTop: hp('0.5%'),
    },
    emailText: {
        fontFamily: FONT.medium,
        fontSize: 13,
        color: COLORS.grey3,
        marginTop: 2,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightRed,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: hp('1.5%'),
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.red,
        marginRight: 6,
    },
    statusText: {
        fontFamily: FONT.medium,
        fontSize: 11,
        color: COLORS.red,
    },
    qrSection: {
        width: '100%',
        paddingHorizontal: 5,
        marginTop: hp('1%'),
    },
    qrCard: {
        width: '100%',
        borderRadius: 20,
        backgroundColor: COLORS.white,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.white ?? '#F0F0F0',
    },
    qrTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qrTitle: {
        fontFamily: FONT.semiBold,
        fontSize: 15,
    },
    qrSubtitle: {
        fontFamily: FONT.medium,
        fontSize: 12,
        color: COLORS.grey2,
        marginTop: 2,
    },
    qrCodeWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hp('2.5%'),
    },
    qrCodeInner: {
        padding: 14,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        shadowColor: COLORS.red,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.lightRed,
        marginBottom: hp('3%')
    }
})