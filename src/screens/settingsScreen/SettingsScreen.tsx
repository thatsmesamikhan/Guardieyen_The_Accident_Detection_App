import { SectionList, SectionListRenderItemInfo, StyleSheet } from 'react-native'
import React, { useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, commonStyles, FONT, hp, wp } from '../../enums/StyleGuide'
import { NavBar, TextLabel } from '../../commons'
import { IMAGES } from '../../assets/images'
import { SettingsScreenButton } from '../../components'
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../../enums'

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
    const navigation = useNavigation<any>()
    // Keeping section data outside the component would be even better for perf
    // (it never changes), but leaving it here to match your original structure.
    const settingsSections: SettingsSection[] = [
        {
            title: 'Account',
            data: [
                { id: 1, label: 'Your Profile', icon: IMAGES.USER },
                { id: 2, label: 'Edit Name', icon: IMAGES.EDIT_NAME },
                { id: 3, label: 'Change Password', icon: IMAGES.CHANGE_PASSWORD },
                { id: 4, label: 'Change Language', icon: IMAGES.CHANGE_LANGUAGE },
            ]
        },
        {
            title: 'Medical',
            data: [
                { id: 5, label: 'Medical Information', icon: IMAGES.MEDICAL },
            ]
        },
        {
            title: 'Legal',
            data: [
                { id: 6, label: 'Privacy Policy', icon: IMAGES.PRIVACY_POLICY },
                { id: 7, label: 'Terms and Conditions', icon: IMAGES.TERMS_AND_CONDITIONS },
            ]
        },
        {
            title: 'Danger Zone',
            data: [
                { id: 8, label: 'Danger Zone', icon: IMAGES.WARNING, isDanger: true },
                { id: 9, label: 'Logout', icon: IMAGES.LOG_OUT, isDanger: true },
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
                navigation.navigate(SCREENS.EDIT_NAME_SCREEN)
                break
            case 3:
                navigation.navigate(SCREENS.CHANGE_PASSWORD_SCREEN)
                break
            case 4:
                // navigation.navigate('ChangeLanguage')
                break
            case 5:
                navigation.navigate(SCREENS.MEDICAL_INFO_SCREEN)
                break
            case 6:
                navigation.navigate(SCREENS.PRIVACY_POLICY_SCREEN)
                break
            case 7:
                navigation.navigate(SCREENS.TERMS_AND_CONDITIONS_SCREEN)
                break
            case 8:
                navigation.navigate(SCREENS.DANGER_ZONE_SCREEN)
                break
            case 9:

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

    return (
        <SafeAreaView edges={['top', 'bottom']} style={commonStyles.safeView}>
            <NavBar headerLabel='Settings' />
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