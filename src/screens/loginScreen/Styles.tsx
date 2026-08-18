import { StyleSheet } from "react-native";
import { COLORS, FONT, hp } from "../../enums/StyleGuide";

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: hp('4%'),
    },
    logoWrapper: {
        height: 80,
        width: 80,
        borderRadius: 40,
        backgroundColor: COLORS.white,
        elevation: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        borderRadius: 40,
    },
    title: {
        marginTop: hp('2%'),
    },
    subtitle: {
        marginTop: hp('1%'),
        textAlign: 'center',
        color: COLORS.grey3,
    },
    emailField: {
        width: '100%',
        marginTop: hp('4%'),
    },
    passwordField: {
        width: '100%',
        marginTop: hp('1.5%'),
    },
    fieldText: {
        fontSize: 13,
        height: hp('5.5%'),
    },
    forgotPasswordWrapper: {
        width: '100%',
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginTop: hp('2.5%'),
    },
    forgotPasswordText: {
        fontFamily: FONT.medium,
        fontSize: 13,
    },
    loginButton: {
        width: '100%',
        marginTop: hp('2.5%'),
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        marginTop: hp('2%'),
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.grey3,
    },
    dividerText: {
        marginHorizontal: 12,
        color: COLORS.grey3,
    },
    googleIcon: {
        height: 18,
        width: 18,
    },
    googleButtonText: {
        color: COLORS.black,
        fontSize: 15
    },
    googleButton: {
        width: '100%',
        marginTop: hp('2.5%'),
    },
    signUpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp('2.5%')
    },
    signUpPrompt: {
        fontSize: 12,
    },
    signUpLink: {
        fontSize: 14,
        fontFamily: FONT.semiBold,
        color: COLORS.red,
    },
});