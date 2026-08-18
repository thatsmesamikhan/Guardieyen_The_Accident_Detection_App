import React from 'react';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TEXT_STYLE } from '../../enums/StyleGuide';
import { IMAGES } from '../../assets/images';
import { CustomButton, InputField, KeyboardAware, TextLabel } from '../../commons';
import { SCREENS } from '../../enums';
import { ForgotPasswordModal } from '../../components';
import useRegisterScreenModalView from './useRegisterScreenModalView';
import { styles } from './Styles';

const RegisterScreen = () => {
    const {
        name,
        setName,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        setForgotPasswordVisible,
        registerWithEmail,
        emailRegisterLoader,
        resendVisible,
        ResendVerificationEmail,
        resendVeriEmailLoader,
        googleLoader,
        signInWithGoogle,
        navigation,
        forgotPasswordVisible,
        handleForgotPasswordSubmit,
        resetLoading
    } = useRegisterScreenModalView()
    return (
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>

            <KeyboardAware contentContainerStyle={[styles.scrollContent, { paddingBottom: 0 }]}>
                <View style={styles.logoWrapper}>
                    <Image source={IMAGES.APP_ICON} style={styles.logo} />
                </View>

                <TextLabel text="Register Now" style={[TEXT_STYLE.smallTitleSemiBold, styles.title]} />
                <TextLabel text="Create an account or login to explore about our app." style={[TEXT_STYLE.text, styles.subtitle]} />

                <InputField
                    placeHolder="Full Name"
                    containerStyle={styles.emailField}
                    inputFieldStyle={styles.fieldText}
                    keyBoardType="default"
                    autoComplete="name"
                    returnKeyType="next"
                    source={IMAGES.USER}
                    value={name}
                    onChangeText={setName}
                />

                <InputField
                    placeHolder="Email"
                    containerStyle={styles.passwordField}
                    inputFieldStyle={styles.fieldText}
                    keyBoardType="email-address"
                    autoComplete="email"
                    returnKeyType="next"
                    source={IMAGES.EMAIL}
                    value={email}
                    onChangeText={setEmail}
                />

                <InputField
                    placeHolder="Password"
                    containerStyle={styles.passwordField}
                    inputFieldStyle={styles.fieldText}
                    autoComplete="password"
                    returnKeyType="next"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <InputField
                    placeHolder="Confirm Password"
                    containerStyle={styles.passwordField}
                    inputFieldStyle={styles.fieldText}
                    autoComplete="password"
                    returnKeyType="done"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <View style={styles.forgotPasswordWrapper}>
                    <TextLabel
                        text="Forgot Password?"
                        selectable
                        onPress={() => setForgotPasswordVisible(true)}
                        style={styles.forgotPasswordText}
                    />
                </View>

                <CustomButton onPress={registerWithEmail} loading={emailRegisterLoader} disabled={emailRegisterLoader} title="Register" buttonWrapper={styles.loginButton} />
                {
                    resendVisible &&
                    <CustomButton onPress={ResendVerificationEmail} loading={resendVeriEmailLoader} disabled={resendVeriEmailLoader} title="Resend verfication link" buttonWrapper={styles.loginButton} />

                }
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <TextLabel
                        text="or Continue with"
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
                <TextLabel text={`Already have an account?\t`} style={styles.signUpPrompt} />
                <TextLabel onPress={() => navigation.navigate(SCREENS.LOGIN_SCREEN)} selectable text="Sign in" style={styles.signUpLink} />
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

export default RegisterScreen;