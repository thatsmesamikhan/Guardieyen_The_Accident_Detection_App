import { SectionList, SectionListRenderItemInfo, StyleSheet } from 'react-native'
import React, { useCallback, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, commonStyles, FONT, hp, wp } from '../../enums/StyleGuide'
import { NavBar, TextLabel } from '../../commons'
import { IMAGES } from '../../assets/images'
import { LogoutModal, SettingsScreenButton } from '../../components'
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../../enums'
import { getAuth } from '@react-native-firebase/auth'
import Toast from 'react-native-toast-message'

interface SettingsItem {
    id: number
    label: string
    icon: number
    isDanger?: boolean
}

interface SettingsSection {
    title: string
    data: SettingsItem[]
}

const SettingsScreen = () => {
    const auth = getAuth();
    const navigation = useNavigation<any>()
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false)
    const [logOutLoader, setLogOutLoader] = useState(false)

    const settingsSections: SettingsSection[] = [
        {
            title: 'Account',
            data: [
                { id: 1, label: 'Your Profile', icon: IMAGES.USER },
                { id: 2, label: 'Change Password', icon: IMAGES.CHANGE_PASSWORD },
                { id: 3, label: 'Change Language', icon: IMAGES.CHANGE_LANGUAGE },
            ]
        },
        {
            title: 'Medical',
            data: [
                { id: 4, label: 'Medical Information', icon: IMAGES.MEDICAL },
            ]
        },
        {
            title: 'Legal',
            data: [
                { id: 5, label: 'Privacy Policy', icon: IMAGES.PRIVACY_POLICY },
                { id: 6, label: 'Terms and Conditions', icon: IMAGES.TERMS_AND_CONDITIONS },
            ]
        },
        {
            title: 'Danger Zone',
            data: [
                { id: 7, label: 'Danger Zone', icon: IMAGES.WARNING, isDanger: true },
                { id: 8, label: 'Logout', icon: IMAGES.LOG_OUT, isDanger: true },
            ]
        }
    ]

    // Wire real navigation / logout logic here. Kept as a single dispatcher
    // so ProfileScreen stays the only place that knows about routing.
    const handleItemPress = useCallback((item: SettingsItem) => {
        switch (item.id) {
            case 1:
                navigation.navigate(SCREENS.PROFILE_SCREEN)
                break
            case 2:
                navigation.navigate(SCREENS.CHANGE_PASSWORD_SCREEN)
                break
            case 3:
                // setIsLogoutModalVisible(true)
                break
            case 4:
                navigation.navigate(SCREENS.MEDICAL_INFO_SCREEN)
                break
            case 5:
                navigation.navigate(SCREENS.PRIVACY_POLICY_SCREEN)
                break
            case 6:
                navigation.navigate(SCREENS.TERMS_AND_CONDITIONS_SCREEN)
                break
            case 7:
                navigation.navigate(SCREENS.DANGER_ZONE_SCREEN)
                break
            case 8:
                setIsLogoutModalVisible(true)
                break
            default:
                break
        }
    }, [])

    const renderItem = useCallback(({ item, index, section }: SectionListRenderItemInfo<SettingsItem, SettingsSection>) => {
        return (
            <SettingsScreenButton
                item={item}
                isDanger={item?.isDanger}
                isFirst={index === 0}
                isLast={index === section.data.length - 1}
                onPress={() => handleItemPress(item)}
            />
        )
    }, [handleItemPress])

    const handleLogout = async () => {
        try {
            setLogOutLoader(true)
            await auth.signOut()
            navigation.reset({
                index: 0,
                routes: [
                    { name: SCREENS.LOGIN_SCREEN },
                ],

            })
        } catch (error) {
            Toast.show({ type: "error", text1: String(error) })
        } finally {
            setLogOutLoader(false)
        }
    }

    return (
        <SafeAreaView edges={['top', 'bottom']} style={commonStyles.safeView}>
            <NavBar headerLabel='Settings' rightSource={IMAGES.QR_CODE} />
            <SectionList
                sections={settingsSections}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                renderSectionHeader={({ section: { title } }) => (
                    <TextLabel text={title} style={styles.sectionHeader} />
                )}
                renderItem={renderItem}
            />
            {
                isLogoutModalVisible &&
                <LogoutModal
                    loading={logOutLoader}
                    disabled={logOutLoader}
                    visible={isLogoutModalVisible}
                    onCancel={() => setIsLogoutModalVisible(false)}
                    onConfirm={handleLogout}
                    title='Log Out'
                    message='Are you sure you want to logout?'
                    confirmLabel='Log Out'
                />
            }
        </SafeAreaView>
    )
}

export default SettingsScreen

const styles = StyleSheet.create({
    list: {
        flex: 1,
        width: '100%'
    },
    listContent: {
        paddingHorizontal: wp('4%'),
        paddingTop: hp('1%'),
        paddingBottom: hp('15%')
    },
    sectionHeader: {
        fontFamily: FONT.medium,
        fontSize: 12.5,
        letterSpacing: 0.4,
        color: COLORS.grey2,
        marginTop: hp('2%'),
        marginBottom: hp('0.8%'),
        textTransform: 'uppercase'
    }
})