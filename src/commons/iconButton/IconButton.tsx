import { Image, ImageSourcePropType, ImageStyle, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import React from 'react'
import { ACTIVE_OPACITY, COLORS } from '../../enums/StyleGuide'

interface props {
    onPress?: () => void,
    containerStyle?: StyleProp<ViewStyle>,
    source: ImageSourcePropType,
    iconStyle?: StyleProp<ImageStyle>
    disabled?: boolean
}

const IconButton = ({ onPress, containerStyle, source, iconStyle, disabled = false }: props) => {
    return (
        <TouchableOpacity disabled={disabled} activeOpacity={ACTIVE_OPACITY} onPress={onPress} style={[styles.containerStyle, containerStyle]}>
            <Image source={source} style={[styles.iconStyle, iconStyle]} />
        </TouchableOpacity>
    )
}

export default IconButton

const styles = StyleSheet.create({
    containerStyle: {
        height: 40,
        width: 40,
        borderRadius: 25,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconStyle: {
        height: 20,
        width: 20
    }
})