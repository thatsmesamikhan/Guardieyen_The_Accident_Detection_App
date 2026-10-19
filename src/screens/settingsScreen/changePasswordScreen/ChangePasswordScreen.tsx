import { View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CustomButton, InputField, KeyboardAware, NavBar, TextLabel } from '../../../commons'
import { COLORS, commonStyles, hp } from '../../../enums/StyleGuide'
import { ForgotPasswordModal } from '../../../components'
import useChangePassModalView from './useChangePassModalView'
import { styles } from './Styles'

const ChangePasswordScreen = () => {
    const {
        navigation,
        currentPassword,
        setCurrentPassword,
        setForgotPasswordVisible,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        handleChangePassword,
        loading,
        forgotPasswordVisible,
        handleForgotPasswordSubmit,
        resetLoading
    } = useChangePassModalView();

    return (
        <SafeAreaView edges={['top']} style={commonStyles.safeView}>
            <NavBar headerLabel='Change Password' leftPress={() => navigation.goBack()} />
            <KeyboardAware style={{
                marginTop: hp('2%')
            }}>
                <InputField
                    placeHolder='Current Password'
                    inputFieldStyle={{ fontSize: 13 }}
                    keyBoardType='default'
                    autoComplete='password'
                    returnKeyType="next"
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                />
                <View style={styles.forgotPasswordWrapper}>
                    <TextLabel
                        text="Forgot Password?"
                        selectable
                        onPress={() => setForgotPasswordVisible(true)}
                        style={styles.forgotPasswordText}
                    />
                </View>
                <InputField
                    placeHolder='New Password'
                    inputFieldStyle={{ fontSize: 13 }}
                    keyBoardType='default'
                    autoComplete='password'
                    returnKeyType="next"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <InputField
                    placeHolder='Confirm Password'
                    containerStyle={{ marginTop: hp('1%') }}
                    inputFieldStyle={{ fontSize: 13 }}
                    keyBoardType='default'
                    autoComplete='password'
                    returnKeyType="next"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
            </KeyboardAware>
            <View style={styles.buttonWrapper}>
                <CustomButton
                    onPress={handleChangePassword}
                    loading={loading}
                    loaderColor={COLORS.white}
                    disabled={loading}
                    title={loading ? 'Updating...' : 'Change Password'}
                />
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
    )
}

export default ChangePasswordScreen