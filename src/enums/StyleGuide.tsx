import { Dimensions, StyleSheet } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'

export const ACTIVE_OPACITY = 0.75;
export const WIDTH = Dimensions.get('window').width
export const HEIGHT = Dimensions.get('window').height

export { wp, hp }

export const COLORS = {
    white: '#FFFFFF',
    black: '#000000',
    background: '#000000',
    black_90: 'rgba(0,0,0,0.9)',
    modalBg: 'rgba(0, 0, 0, 0.5)',
    lightBlack: 'rgba(13, 13, 13, 1)',
    gold: '#C9A84C',
    goldLight: '#E8C97A',
    purple: 'rgba(81, 78, 183, 1)',
    primary: '#2F78BE',
    light_blue: '#EBF2F9',
    secondary: '#45B7E5',
    grey: '#D9D9D9',
    darkGrey: '#646464',
    lightGrey1: '#A5A6A7',
    red: '#E12222',
    darkRed: '#FF0000',
    darkBlue: '#1E3A8A',
    bgColor: '#FAF9FE',
    lightWhite: 'rgba(246, 246, 248, 1)',
    lightWhite2: 'rgba(255, 255, 255, 1)',
    lightWhite3: 'rgba(255, 255, 255, 0.5)',
    lightGrey2: 'rgba(100, 100, 100, 1)',
    orange: "rgba(255, 204, 77, 1)",
    lightGrey3: "rgba(217, 217, 217, 1)",
    transparent: 'transparent',
    blue2: "rgba(47, 120, 190, 1)",
    faceBook: "#3b5998",
    lightPurple: 'rgba(116, 112, 197, 1)',
    brown: "#A52A2A",
    green: "#008000",
    grey2: "rgba(194, 194, 194,1)",
    grey3: "rgba(149, 149, 149,1)",
    BLACKK: "#0D0D0D",
    grey4: "rgb(27, 27, 27,1)",
    grey5: "#222222",
    textColor: '#003A70',
    lightGrey: 'lightGrey',
    muted: '#6B6F7A',
    textDarkColor: '#00244A'
}

export const FONT = {
    bold: 'Poppins-Bold',
    regular: 'Poppins-Regular',
    extraBold: 'Poppins-ExtraBold',
    semiBold: 'Poppins-SemiBold',
    medium: 'Poppins-Medium',
}

export const TEXT_STYLE = StyleSheet.create({
    titleExtraBold: {
        fontFamily: FONT.extraBold,
        fontSize: 21,
    },
    titleBold: {
        fontFamily: FONT.bold,
        fontSize: 21,
    },
    smallTitleBold: {
        fontFamily: FONT.bold,
        fontSize: 17,
    },
    smallTitleSemiBold: {
        fontFamily: FONT.semiBold,
        fontSize: 20,
    },
    smallTitleMedium: {
        fontFamily: FONT.medium,
        fontSize: 20,
    },
    bigText: {
        fontFamily: FONT.regular,
        fontSize: 17,
    },
    bigTextSemiBold: {
        fontFamily: FONT.semiBold,
        fontSize: 16,
    },
    bigTextMedium: {
        fontFamily: FONT.medium,
        fontSize: 16,
    },
    bigTextBold: {
        fontFamily: FONT.bold,
        fontSize: 16,
    },

    text: {
        fontFamily: FONT.regular,
        fontSize: 13,
    },
    textSemiBold: {
        fontFamily: FONT.semiBold,
        fontSize: 13.5,
    },
    textMedium: {
        fontFamily: FONT.medium,
        fontSize: 13,
    },
    textBold: {
        fontFamily: FONT.bold,
        fontSize: 13.5,
    },

    smallText: {
        fontFamily: FONT.regular,
        fontSize: 11,
    },
    smallTextSemiBold: {
        fontFamily: FONT.semiBold,
        fontSize: 11,
    },
    smallTextMedium: {
        fontFamily: FONT.medium,
        fontSize: 11,
    },
    smallTextBold: {
        fontFamily: FONT.bold,
        fontSize: 11,
    },
})

export const commonStyles = StyleSheet.create({
    horizontalView: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    horizontalView_m05: {
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: hp(0.5),
    },
    horizontalView_m1: {
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: hp(1),
    },
    justifyView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    justifyView_m05: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: hp(0.5),
    },
    justifyView_m1: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: hp(1),
    },
    justifyView_m2: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: hp(2),
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    shadow_5: {
        elevation: 5,
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    shadow_3: {
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    shadow_2: {
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    noPadding: {
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingStart: 0,
        paddingEnd: 0,
    },
    noMargin: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0,
        marginStart: 0,
        marginEnd: 0,
    }
})