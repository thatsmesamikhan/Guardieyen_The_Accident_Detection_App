import { StyleSheet } from "react-native";
import { COLORS, FONT, hp } from "../../enums/StyleGuide";

export const styles = StyleSheet.create({
    heroContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: hp('2%'),
        marginBottom: hp('2%')
    },
    heroIconContainer: {
        height: 60,
        width: 60,
        borderRadius: 40,
        backgroundColor: COLORS.lightRed
    },
    heroIcon: {
        height: 25,
        width: 25,
        tintColor: COLORS.red
    },
    heroTitle: {
        fontSize: 22,
        marginTop: hp('1%'),
        fontFamily: FONT.semiBold
    },
    heroSubtitle: {
        marginTop: 3,
        textAlign: 'center',
        color: COLORS.grey3,
        lineHeight: 22,
        fontSize: 14,
        paddingHorizontal: 25
    },
    buttonIcon: {
        height: 25,
        width: 25,
        tintColor: COLORS.white
    },
    buttonStyle: {
        position: 'absolute',
        bottom: hp('5%')
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16
    },
    formCard: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 18,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: {
            width: 0,
            height: 4
        },
        elevation: 2
    },
    relationTextContainer: {
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginTop: hp('2%')
    },
    relationContainer: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: hp('1%'),
        flexWrap: 'wrap'
    },
})