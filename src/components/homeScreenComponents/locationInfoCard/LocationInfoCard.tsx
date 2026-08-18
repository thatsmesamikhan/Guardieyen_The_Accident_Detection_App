import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { COLORS, FONT, hp } from '../../../enums/StyleGuide'
import { TextLabel } from '../../../commons'

const LocationInfoCard = ({ item }: any) => {
    return (
        <View style={styles.container}>
            <TextLabel numberOfLines={1} text={item?.title} style={[styles.titleStyle, { color: COLORS.lightRed }]} />
            <TextLabel numberOfLines={1} text={item?.info} style={[styles.infoStyle, { marginTop: hp('0.5%'), color: COLORS.white }]} />
        </View>
    )
}

export default React.memo(LocationInfoCard)

const styles = StyleSheet.create({
    container: {
        width: '33.33%',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginTop: hp('1%')
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
    },
})