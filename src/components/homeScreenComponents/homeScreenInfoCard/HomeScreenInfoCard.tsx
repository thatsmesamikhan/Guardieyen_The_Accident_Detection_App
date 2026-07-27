import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native'
import React from 'react'
import { COLORS, FONT, hp } from '../../../enums/StyleGuide'
import { TextLabel } from '../../../commons'

interface props {
    id?: number,
    title: string,
    info: string,
    icon: ImageSourcePropType
}

interface itemProp {
    item: props
}

const HomeScreenInfoCard = ({ item }: itemProp) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Image source={item?.icon} style={styles.iconStyle} />
            </View>
            <View style={styles.titleContainer}>
                <TextLabel numberOfLines={1} text={item?.title} style={styles.titleStyle} />
                <TextLabel numberOfLines={1} text={item?.info} style={styles.infoStyle} />
            </View>
        </View>
    )
}

export default HomeScreenInfoCard

const styles = StyleSheet.create({
    container: {
        width: '49%',
        borderRadius: 10,
        padding: 10,
        backgroundColor: COLORS.lightRed,
        flexDirection: 'row',
        paddingVertical: 15,
        marginTop: hp('1%')
    },
    iconContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8
    },
    iconStyle: {
        height: 20,
        width: 20
    },
    titleContainer: {
        marginLeft: '5%'
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
    }
})