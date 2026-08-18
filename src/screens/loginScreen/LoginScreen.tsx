import React from 'react';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TEXT_STYLE } from '../../enums/StyleGuide';
import { IMAGES } from '../../assets/images';
import { CustomButton, InputField, KeyboardAware, TextLabel } from '../../commons';
import { SCREENS } from '../../enums';
import { ForgotPasswordModal } from '../../components';
import { styles } from './Styles';
import useLoginScreenModalView from './useLoginScreenModalView';

const LoginScreen = () => {
    const {
        email,
        handleEmailChange,
        emailError,
        password,
        handlePasswordChange,
        passwordError,
        setForgotPasswordVisible,
        HandleLogin,
        loginLoader,
        resendVisible,
        ResendVerificationEmail,
        resendVeriEmailLoader,
        googleLoader,
        signInWithGoogle,
        navigation,
        forgotPasswordVisible,
        handleForgotPasswordSubmit,
        resetLoading
    } = useLoginScreenModalView()
    return (
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            <KeyboardAware contentContainerStyle={styles.scrollContent}>

                <View style={styles.logoWrapper}>
                    <Image source={IMAGES.APP_ICON} style={styles.logo} />
                </View>

                <TextLabel text="Welcome Back" style={[TEXT_STYLE.smallTitleSemiBold, styles.title]} />
                <TextLabel text="Please enter your email & password to access your account." style={[TEXT_STYLE.text, styles.subtitle]} />

                <InputField
                    placeHolder="Email"
                    containerStyle={styles.emailField}
                    inputFieldStyle={styles.fieldText}
                    keyBoardType="email-address"
                    autoComplete="email"
                    returnKeyType="next"
                    source={IMAGES.EMAIL}
                    value={email}
                    onChangeText={handleEmailChange}
                    error={emailError}
                    showError={!!emailError}
                />
                <InputField
                    placeHolder="Password"
                    containerStyle={styles.passwordField}
                    inputFieldStyle={styles.fieldText}
                    autoComplete="password"
                    returnKeyType="next"
                    secureTextEntry
                    value={password}
                    onChangeText={handlePasswordChange}
                    error={passwordError}
                    showError={!!passwordError}
                />

                <View style={styles.forgotPasswordWrapper}>
                    <TextLabel
                        text="Forgot Password?"
                        selectable
                        onPress={() => setForgotPasswordVisible(true)}
                        style={styles.forgotPasswordText}
                    />
                </View>

                <CustomButton
                    title="Login"
                    loaderColor={COLORS.white}
                    onPress={HandleLogin} disabled={loginLoader} loading={loginLoader}
                    buttonWrapper={styles.loginButton} />

                {resendVisible && (
                    <CustomButton
                        title="Resend Verification Email"
                        loaderColor={COLORS.white}
                        onPress={ResendVerificationEmail}
                        disabled={resendVeriEmailLoader}
                        loading={resendVeriEmailLoader}
                        buttonWrapper={styles.loginButton} />
                )}

                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <TextLabel
                        text="or Login with"
                        style={[TEXT_STYLE.text, styles.dividerText]}
                    />

                    <View style={styles.dividerLine} />
                </View>

                <CustomButton
                    disabled={googleLoader}
                    loading={googleLoader}
                    onPress={signInWithGoogle}
                    leftIcon={<Image source={IMAGES.GOOGLE} style={styles.googleIcon} />}
                    title="Continue with Google"
                    buttonTextStyle={styles.googleButtonText}
                    buttonWrapper={styles.googleButton}
                    colors={['#FFFFFF', '#EFEFEF']}
                    loaderColor={COLORS.red}
                />

            </KeyboardAware>

            <View style={styles.signUpRow}>
                <TextLabel text={`Don't have an account?\t`} style={styles.signUpPrompt} />
                <TextLabel selectable onPress={() => navigation.navigate(SCREENS.REGISTER_SCREEN as never)} text="Sign up" style={styles.signUpLink} />
            </View>

            {
                forgotPasswordVisible &&
                <ForgotPasswordModal
                    visible={forgotPasswordVisible}
                    onClose={() => setForgotPasswordVisible(false)}
                    onSubmit={handleForgotPasswordSubmit}
                    loading={resetLoading}
                />
            }

        </SafeAreaView>
    );
};

export default LoginScreen;