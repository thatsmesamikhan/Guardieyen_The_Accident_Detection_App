import { Image, StyleSheet, View, ViewStyle, StyleProp } from 'react-native'
import React from 'react'
import SwitchButton from '../switchButton'
import { COLORS, FONT, hp } from '../../../enums/StyleGuide'
import { IMAGES } from '../../../assets/images'
import { TextLabel } from '../../../commons'

interface props {
    containerStyle?: StyleProp<ViewStyle>,
    isSwitchOn?: boolean,
    switchPress?: () => void,
    lastUpdated?: string,
    percentOfSafeScore?: number
}

const HomeScreenHeaderCard = ({ containerStyle, switchPress, isSwitchOn, lastUpdated, percentOfSafeScore }: props) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.topRow}>
                <View style={styles.titleBlock}>
                    <View style={styles.titleRow}>
                        <Image source={IMAGES.SHIELD} style={styles.shieldIcon} />
                        <TextLabel
                            numberOfLines={1}
                            text={isSwitchOn ? 'Protection Active' : 'Protection Inactive'}
                            style={styles.titleText}
                        />
                    </View>
                    <TextLabel text={`Monitoring for accidents in\nreal-time`} style={styles.subtitleText} />
                </View>
                <SwitchButton onPress={switchPress} isSwitchOn={isSwitchOn} />
            </View>

            <View style={styles.footerRow}>
                <View style={styles.lastUpdateRow}>
                    <TextLabel text="Last update: " style={styles.lastUpdateLabel} />
                    <TextLabel text={lastUpdated} style={styles.lastUpdateValue} />
                </View>
                <View style={styles.safetyBadge}>
                    <TextLabel
                        text={`${percentOfSafeScore}% Safety Score`}
                        style={styles.safetyBadgeText}
                    />
                </View>
            </View>
        </View>
    )
}

export default React.memo(HomeScreenHeaderCard)

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 16,
        padding: 15,
        backgroundColor: COLORS.white,
        marginTop: hp('2%'),
        borderWidth: 0.7,
        borderColor: COLORS.red,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    titleBlock: {
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10
    },
    shieldIcon: {
        height: 25,
        width: 25,
        tintColor: COLORS.darkRed
    },
    titleText: {
        fontSize: 18,
        fontFamily: FONT.semiBold
    },
    subtitleText: {
        fontSize: 14,
        marginTop: hp('1%')
    },
    footerRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 0.5,
        borderColor: COLORS.grey,
        marginTop: hp('1%'),
        paddingVertical: hp('1%'),
        paddingTop: hp('2%')
    },
    lastUpdateRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    lastUpdateLabel: {
        fontSize: 13
    },
    lastUpdateValue: {
        fontFamily: FONT.medium,
        color: COLORS.red,
        fontSize: 14
    },
    safetyBadge: {
        padding: 3,
        borderRadius: 20,
        backgroundColor: COLORS.lightGrey,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8
    },
    safetyBadgeText: {
        fontSize: 10,
        color: COLORS.green
    }
})