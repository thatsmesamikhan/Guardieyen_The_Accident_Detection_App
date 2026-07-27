import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { COLORS, FONT, hp, TEXT_STYLE } from '../../enums/StyleGuide';
import { IMAGES } from '../../assets/images';
import { CustomButton, InputField, TextLabel } from '../../commons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { BOTTOM_TAB, SCREENS } from '../../enums';
import { ForgotPasswordModal } from '../../components';

const LoginScreen = () => {
    const navigation = useNavigation<any>()
    const [isForgotPasswordVisible, setForgotPasswordVisible] = useState(false);
    const [isResetLoading, setResetLoading] = useState(false);

    const handleForgotPasswordSubmit = async (email: string) => {
        try {
            setResetLoading(true);
            // TODO: hook up to your reset-password API call
            // await authService.sendResetLink(email);
            setForgotPasswordVisible(false);
        } catch (error) {
            // TODO: surface an error toast/message here
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            <KeyboardAwareScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bottomOffset={20}
            >
                <View style={styles.logoWrapper}>
                    <Image source={IMAGES.APP_ICON} style={styles.logo} />
                </View>

                <TextLabel
                    text="Welcome Back"
                    style={[TEXT_STYLE.smallTitleSemiBold, styles.title]}
                />
                <TextLabel
                    text="Please enter your email & password to access your account."
                    style={[TEXT_STYLE.text, styles.subtitle]}
                />

                <InputField
                    placeHolder="Email"
                    containerStyle={styles.emailField}
                    inputFieldStyle={styles.fieldText}
                    keyBoardType="email-address"
                    autoComplete="email"
                    returnKeyType="next"
                    source={IMAGES.EMAIL}
                />
                <InputField
                    placeHolder="Password"
                    containerStyle={styles.passwordField}
                    inputFieldStyle={styles.fieldText}
                    autoComplete="password"
                    returnKeyType="done"
                    source={IMAGES.EYE}
                />

                <View style={styles.forgotPasswordWrapper}>
                    <TextLabel
                        text="Forgot Password?"
                        selectable
                        onPress={() => setForgotPasswordVisible(true)}
                        style={styles.forgotPasswordText}
                    />
                </View>

                <CustomButton onPress={() => navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: BOTTOM_TAB.BOTTOM_NAVIGATOR }],
                    }),
                )} title="Login" buttonWrapper={styles.loginButton} />

                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <TextLabel
                        text="or Login with"
                        style={[TEXT_STYLE.text, styles.dividerText]}
                    />

                    <View style={styles.dividerLine} />
                </View>

                <CustomButton
                    leftIcon={<Image source={IMAGES.GOOGLE} style={styles.googleIcon} />}
                    title="Continue with Google"
                    buttonTextStyle={styles.googleButtonText}
                    buttonWrapper={styles.googleButton}
                    colors={['#FFFFFF', '#EFEFEF']}
                />


            </KeyboardAwareScrollView>
            <View style={styles.signUpRow}>
                <TextLabel text={`Don't have an account?\t`} style={styles.signUpPrompt} />
                <TextLabel selectable onPress={() => navigation.navigate(SCREENS.REGISTER_SCREEN as never)} text="Sign up" style={styles.signUpLink} />
            </View>

            {
                isForgotPasswordVisible &&
                <ForgotPasswordModal
                    visible={isForgotPasswordVisible}
                    onClose={() => setForgotPasswordVisible(false)}
                    onSubmit={handleForgotPasswordSubmit}
                    loading={isResetLoading}
                />
            }

        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    scroll: {
        flex: 1,
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
        fontSize : 15
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