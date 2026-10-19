import { StyleSheet } from "react-native";
import { FONT, hp } from "../../../enums/StyleGuide";

export const styles = StyleSheet.create({
    forgotPasswordWrapper: {
        width: '100%',
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginTop: hp('2%'),
        marginBottom: hp('1%')
    },
    forgotPasswordText: {
        fontFamily: FONT.medium,
        fontSize: 13,
    },
    buttonWrapper: {
        width: '100%',
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: hp('5%'),
        position: 'absolute'
    }
})