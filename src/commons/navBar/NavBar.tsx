import { ImageSourcePropType, ImageStyle, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import React from 'react'
import { COLORS, FONT } from '../../enums/StyleGuide'
import { IMAGES } from '../../assets/images'
import TextLabel from '../textLabel'
import IconButton from '../iconButton'

interface props {
    leftPress?: () => void,
    headerLabel: string,
    subHeaderLabel?: string,
    rightSource?: ImageSourcePropType,
    rightPress?: () => void,
    headerStyle?: StyleProp<TextStyle>,
    subHeaderStyle?: StyleProp<TextStyle>,
    iconStyle?: ImageStyle,
    navBarStyle?: StyleProp<ViewStyle>
}

const NavBar = ({ leftPress, headerLabel, subHeaderLabel, rightSource, rightPress, headerStyle, subHeaderStyle, iconStyle, navBarStyle }: props) => {
    return (
        <View style={[styles.navBarStyle, navBarStyle]}>
            <View style={styles.headerContainer}>
                {
                    leftPress &&
                    <IconButton source={IMAGES.LEFT_ARROW} onPress={leftPress} />
                }
                <View>
                    <TextLabel text={headerLabel} style={[styles.headerStyle, headerStyle]} />
                    {
                        subHeaderLabel &&
                        <TextLabel text={subHeaderLabel} style={[styles.subHeaderStyle, subHeaderStyle]} />
                    }

                </View>
            </View>

            {
                rightSource &&
                <IconButton source={rightSource} onPress={rightPress} iconStyle={iconStyle} />
            }
        </View>
    )
}

export default NavBar

const styles = StyleSheet.create({
    navBarStyle: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 0.3,
        borderBottomColor: COLORS.grey,
    },
    headerStyle: {
        fontFamily: FONT.semiBold,
        fontSize: 20,
    },
    subHeaderStyle: {
        color: COLORS.red,
        fontSize: 13,
        marginTop: -3
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10
    }
})