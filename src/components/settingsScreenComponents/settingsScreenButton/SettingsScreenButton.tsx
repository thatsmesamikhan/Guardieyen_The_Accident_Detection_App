import { Image, ImageSourcePropType, ImageStyle, Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import React from 'react'
import { COLORS, FONT, hp } from '../../../enums/StyleGuide'
import { TextLabel } from '../../../commons'
import { IMAGES } from '../../../assets/images'

interface ItemProps {
    id: number
    icon: ImageSourcePropType
    label: string
    isDanger?: boolean
}

interface Props {
    item: ItemProps
    container?: StyleProp<ViewStyle>
    labelStyle?: StyleProp<TextStyle>
    arrowIcon?: StyleProp<ImageStyle>
    isDanger?: boolean
    isFirst?: boolean
    isLast?: boolean
    onPress?: () => void
}

const SettingsScreenButton = ({
    container,
    item,
    labelStyle,
    arrowIcon,
    isDanger,
    isFirst,
    isLast,
    onPress
}: Props) => {
    return (
        <Pressable
            android_ripple={{ color: isDanger ? COLORS.lightRed : COLORS.lightRed }}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={item?.label}
            hitSlop={4}
            style={({ pressed }) => [
                styles.container,
                isFirst && styles.firstItem,
                isLast && styles.lastItem,
                !isLast && styles.divider,
                isDanger && styles.dangerContainer,
                pressed && styles.pressed,
                container
            ]}
        >
            <View style={styles.iconAndNameContainer}>
                <View style={[styles.imageContainer, isDanger && styles.dangerImageContainer]}>
                    <Image
                        source={item?.icon}
                        style={[styles.iconStyle, isDanger && styles.dangerIconStyle]}
                    />
                </View>
                <TextLabel
                    numberOfLines={1}
                    text={item?.label}
                    style={[styles.labelStyle, isDanger && styles.dangerLabelStyle, labelStyle]}
                />
            </View>
            <Image
                source={IMAGES.RIGHT_ARROW}
                style={[styles.arrowIcon, isDanger && styles.dangerArrowIcon, arrowIcon]}
            />
        </Pressable>
    )
}

export default React.memo(SettingsScreenButton)

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1
    },
    firstItem: {
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        marginTop: hp('0.4%')
    },
    lastItem: {
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14
    },
    divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.08)'
    },
    dangerContainer: {
        backgroundColor: COLORS.red
    },
    pressed: {
        opacity: 0.85
    },
    iconAndNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexShrink: 1
    },
    imageContainer: {
        height: 36,
        width: 36,
        borderRadius: 18,
        backgroundColor: COLORS.lightRed,
        justifyContent: 'center',
        alignItems: 'center'
    },
    dangerImageContainer: {
        backgroundColor: COLORS.white
    },
    iconStyle: {
        height: '55%',
        width: '55%',
        tintColor: COLORS.red,
        resizeMode: 'contain'
    },
    dangerIconStyle: {
        tintColor: COLORS.red
    },
    labelStyle: {
        fontFamily: FONT.medium,
        color: COLORS.red,
        fontSize: 14,
        flexShrink: 1
    },
    dangerLabelStyle: {
        color: COLORS.white
    },
    arrowIcon: {
        height: 11,
        width: 11,
        resizeMode: 'contain',
        tintColor: COLORS.grey2
    },
    dangerArrowIcon: {
        tintColor: COLORS.white
    }
})