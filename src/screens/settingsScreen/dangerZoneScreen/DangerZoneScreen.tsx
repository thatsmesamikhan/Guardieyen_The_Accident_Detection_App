import { SectionList, SectionListRenderItemInfo, StyleSheet } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import {
    getAuth,
    deleteUser,
    reauthenticateWithCredential,
    GoogleAuthProvider,
} from '@react-native-firebase/auth'
import {
    getFirestore,
    doc,
    collection,
    getDocs,
    query,
    limit,
    writeBatch,
    deleteDoc,
} from '@react-native-firebase/firestore'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import Toast from 'react-native-toast-message'
import { IMAGES } from '../../../assets/images'
import { SCREENS } from '../../../enums'
import { LogoutModal, SettingsScreenButton } from '../../../components'
import { COLORS, commonStyles, FONT, hp, wp } from '../../../enums/StyleGuide'
import { NavBar, TextLabel } from '../../../commons'

type DangerAction = 'reset' | 'delete'

interface DangerItem {
    id: number
    label: string
    icon: number
    action: DangerAction
    isDanger?: boolean
}

interface DangerSection {
    title: string
    data: DangerItem[]
}

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

// Subcollections under users/{uid}. Add new ones here if you create more later.
const USER_SUBCOLLECTIONS = ['emergencyContacts', 'medicalInfo']

// Firestore batches allow max 500 writes; stay below it.
const BATCH_SIZE = 400

// true  -> Reset keeps users/{uid} + emailIndex (profile survives, only subcollections are wiped)
// false -> Reset removes everything in Firestore for this user (your current requirement).
//          Make sure your login flow recreates users/{uid} if it is missing.
const RESET_KEEPS_PROFILE = false

const MODAL_CONTENT: Record<DangerAction, { title: string; message: string; confirmLabel: string }> = {
    reset: {
        title: 'Reset App',
        message: 'This will permanently delete all your data and sign you out. Your account will not be deleted.',
        confirmLabel: 'Reset',
    },
    delete: {
        title: 'Delete Account',
        message: 'This will permanently delete your account and all its data. This action cannot be undone.',
        confirmLabel: 'Delete',
    },
}

const REAUTH_CANCELLED = 'reauth/cancelled'

/* -------------------------------------------------------------------------- */
/*                               FIRESTORE HELPERS                            */
/* -------------------------------------------------------------------------- */

/** Deletes every document in users/{uid}/{name}, in batches. */
const deleteUserSubcollection = async (uid: string, name: string) => {
    const db = getFirestore()
    while (true) {
        const snap = await getDocs(query(collection(db, 'users', uid, name), limit(BATCH_SIZE)))
        if (snap.empty) break

        const batch = writeBatch(db)
        snap.docs.forEach((d: any) => batch.delete(d.ref))
        await batch.commit()

        if (snap.size < BATCH_SIZE) break
    }
}

/**
 * Removes this user's data from Firestore.
 * Order: subcollections -> emailIndex -> user doc.
 */
const deleteAllUserData = async (uid: string, email: string | null | undefined, keepProfile: boolean) => {
    const db = getFirestore()

    // 1. Subcollections (Firestore does NOT delete these when the parent doc is deleted)
    for (const name of USER_SUBCOLLECTIONS) {
        await deleteUserSubcollection(uid, name)
    }

    if (keepProfile) return

    // 2. emailIndex entry (assumes the doc ID is the lowercase email; adjust if yours differs)
    if (email) {
        await deleteDoc(doc(db, 'emailIndex', email.toLowerCase()))
    }

    // 3. The user document itself
    await deleteDoc(doc(db, 'users', uid))
}

/* -------------------------------------------------------------------------- */
/*                               AUTH HELPERS                                 */
/* -------------------------------------------------------------------------- */

/**
 * Firebase requires a recent login before deleting an account.
 * For Google users we re-authenticate BEFORE touching Firestore, so we never
 * end up with deleted data but a still-existing account.
 */
const reauthenticateIfNeeded = async (user: any) => {
    const isGoogleUser = user.providerData.some((p: { providerId: string }) => p.providerId === 'google.com')
    if (!isGoogleUser) return

    await GoogleSignin.hasPlayServices()
    const response: any = await GoogleSignin.signIn()

    // Newer versions of google-signin return { type: 'cancelled' } instead of throwing
    if (response?.type === 'cancelled') {
        const cancelled: any = new Error('Re-authentication was cancelled.')
        cancelled.code = REAUTH_CANCELLED
        throw cancelled
    }

    // Supports both the new ({ data: { idToken } }) and old ({ idToken }) response shapes
    const idToken = response?.data?.idToken ?? response?.idToken
    if (!idToken) throw new Error('Google sign-in did not return an ID token.')

    await reauthenticateWithCredential(user, GoogleAuthProvider.credential(idToken))
}

const isCancelError = (error: any) =>
    error?.code === REAUTH_CANCELLED ||
    error?.code === 'SIGN_IN_CANCELLED' || // google-signin (older)
    error?.code === '12501' // Android cancel code

/* -------------------------------------------------------------------------- */
/*                                   SCREEN                                   */
/* -------------------------------------------------------------------------- */

const DangerZoneScreen = () => {
    const auth = getAuth()
    const navigation = useNavigation<any>()
    const [activeAction, setActiveAction] = useState<DangerAction | null>(null)
    const [loading, setLoading] = useState(false)

    const sections: DangerSection[] = useMemo(
        () => [
            {
                title: 'App Data',
                data: [{ id: 1, label: 'Reset App', icon: IMAGES.RESET_APP, action: 'reset', isDanger: true }],
            },
            {
                title: 'Account',
                data: [{ id: 2, label: 'Delete Account', icon: IMAGES.DELETE_ACCOUNT, action: 'delete', isDanger: true }],
            },
        ],
        []
    )

    const goToLogin = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: SCREENS.LOGIN_SCREEN }],
        })
    }

    const getCurrentUser = () => {
        const user = auth.currentUser
        if (!user) throw new Error('No user is currently signed in.')
        return user
    }

    const handleReset = async () => {
        const user = getCurrentUser()
        await deleteAllUserData(user.uid, user.email, RESET_KEEPS_PROFILE)
        await auth.signOut()
    }

    const handleDeleteAccount = async () => {
        const user = getCurrentUser()

        // 1. Re-authenticate first (may open the Google account picker)
        await reauthenticateIfNeeded(user)

        // 2. Remove all Firestore data
        await deleteAllUserData(user.uid, user.email, false)

        // 3. Remove the Auth account
        await deleteUser(user)
    }

    const handleConfirm = async () => {
        if (!activeAction) return
        try {
            setLoading(true)
            if (activeAction === 'reset') {
                await handleReset()
            } else {
                await handleDeleteAccount()
            }
            setActiveAction(null)
            goToLogin()
        } catch (error: any) {
            if (isCancelError(error)) {
                Toast.show({ type: 'info', text1: 'Cancelled. Nothing was deleted.' })
            } else if (error?.code === 'auth/requires-recent-login') {
                Toast.show({
                    type: 'error',
                    text1: 'Please log in again before deleting your account.',
                })
            } else {
                Toast.show({ type: 'error', text1: String(error?.message ?? error) })
            }
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        if (!loading) setActiveAction(null)
    }

    const renderItem = useCallback(
        ({ item, index, section }: SectionListRenderItemInfo<DangerItem, DangerSection>) => (
            <SettingsScreenButton
                item={item}
                isDanger={item.isDanger}
                isFirst={index === 0}
                isLast={index === section.data.length - 1}
                onPress={() => setActiveAction(item.action)}
            />
        ),
        []
    )

    return (
        <SafeAreaView edges={['top', 'bottom']} style={commonStyles.safeView}>
            <NavBar headerLabel='Danger Zone' />
            <SectionList
                sections={sections}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <TextLabel
                        text='These actions are permanent. Please proceed with caution.'
                        style={styles.warningText}
                    />
                }
                renderSectionHeader={({ section: { title } }) => (
                    <TextLabel text={title} style={styles.sectionHeader} />
                )}
                renderItem={renderItem}
            />
            {activeAction && (
                <LogoutModal
                    loading={loading}
                    disabled={loading}
                    visible={!!activeAction}
                    title={MODAL_CONTENT[activeAction].title}
                    message={MODAL_CONTENT[activeAction].message}
                    confirmLabel={MODAL_CONTENT[activeAction].confirmLabel}
                    onCancel={handleCancel}
                    onConfirm={handleConfirm}
                />
            )}
        </SafeAreaView>
    )
}

export default DangerZoneScreen

const styles = StyleSheet.create({
    list: {
        flex: 1,
        width: '100%',
    },
    listContent: {
        paddingHorizontal: wp('4%'),
        paddingTop: hp('1%'),
        paddingBottom: hp('15%'),
    },
    warningText: {
        fontFamily: FONT.medium,
        fontSize: 13,
        color: COLORS.grey2,
        marginTop: hp('1%'),
    },
    sectionHeader: {
        fontFamily: FONT.medium,
        fontSize: 12.5,
        letterSpacing: 0.4,
        color: COLORS.grey2,
        marginTop: hp('2%'),
        marginBottom: hp('0.8%'),
        textTransform: 'uppercase',
    },
})