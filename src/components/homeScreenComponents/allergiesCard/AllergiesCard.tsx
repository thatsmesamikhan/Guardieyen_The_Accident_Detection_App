import { StyleSheet, View } from 'react-native'
import React from 'react'
import { TextLabel } from '../../../commons'
import { COLORS } from '../../../enums/StyleGuide'

const AllergiesCard = ({ item }: any) => {
    return (
        <View style={styles.safetyBadge}>
            <TextLabel text={item?.allergies} style={styles.safetyBadgeText} />
        </View>
    )
}

export default React.memo(AllergiesCard)

const styles = StyleSheet.create({
    safetyBadge: {
        padding: 3,
        borderRadius: 20,
        backgroundColor: COLORS.lightRed,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8
    },
    safetyBadgeText: {
        fontSize: 10,
        color: COLORS.red
    },
})