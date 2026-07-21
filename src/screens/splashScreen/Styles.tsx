import { StyleSheet } from "react-native";
import { COLORS, FONT, hp, wp } from "../../enums/StyleGuide";

const RING_SIZE = wp('50%');
const GLOW_SIZE = wp('44%');
const LOGO_CIRCLE_SIZE = wp('34%');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp('8%'),
        paddingHorizontal: wp('8%'),
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },

    logoWrapper: {
        width: RING_SIZE,
        height: RING_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp('3%'),
    },

    glow: {
        position: 'absolute',
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        borderRadius: GLOW_SIZE / 2,
        backgroundColor: COLORS.red,
    },

    ring: {
        position: 'absolute',
        width: RING_SIZE,
        height: RING_SIZE,
        borderRadius: RING_SIZE / 2,
        borderWidth: 1.5,
        borderColor: COLORS.red,
    },

    logoCircle: {
        width: LOGO_CIRCLE_SIZE,
        height: LOGO_CIRCLE_SIZE,
        borderRadius: LOGO_CIRCLE_SIZE / 2,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
    },

    logo: {
        width: '62%',
        height: '62%',
    },

    title: {
        fontSize: 25,
        fontFamily: FONT.semiBold,
        letterSpacing: 1.2,
        textAlign: 'center',
        marginTop: hp('2%')
    },

    dividerTrack: {
        height: 3,
        marginVertical: hp('2.2%'),
        overflow: 'hidden',
        borderRadius: 10,
    },

    divider: {
        flex: 1,
        borderRadius: 10,
    },

    subtitle: {
        color: COLORS.grey3,
        textAlign: 'center',
    }
});