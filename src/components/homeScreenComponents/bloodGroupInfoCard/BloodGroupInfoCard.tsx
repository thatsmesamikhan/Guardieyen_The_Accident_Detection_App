import { StyleSheet, View } from 'react-native'
import React from 'react'
import { TextLabel } from '../../../commons'
import { COLORS, FONT, hp } from '../../../enums/StyleGuide'

const BloodGroupInfoCard = ({ item }: any) => {
    return (
        <View style={styles.container}>
            <TextLabel numberOfLines={1} text={item?.title} style={styles.titleStyle} />
            <TextLabel numberOfLines={1} text={item?.info} style={[styles.infoStyle, { marginTop: hp('0.5%') }]} />
        </View>
    )
}

export default React.memo(BloodGroupInfoCard)

const styles = StyleSheet.create({
    container: {
        width: '50%',
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
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