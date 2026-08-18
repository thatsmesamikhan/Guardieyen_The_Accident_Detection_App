import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Toast from 'react-native-toast-message';
import { getAuth, sendPasswordResetEmail } from '@react-native-firebase/auth';
import { getAuthErrorMessage } from '../../helpers/Helpers';

const useForgotPassword = () => {

    const auth = getAuth();
    const [resetLoading, setResetLoading] = useState(false);
    const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);

    const handleForgotPasswordSubmit = async (resetEmail: string) => {
        const trimmed = resetEmail.trim()
        try {
            setResetLoading(true);
            await sendPasswordResetEmail(auth, trimmed);

            Toast.show({
                type: 'success',
                text1: 'Check Your Inbox',
                text2: 'We sent a password reset link to your email.',
            });
            setForgotPasswordVisible(false);
        } catch (error: any) {
            if (error?.code === 'auth/user-not-found') {
                Toast.show({
                    type: 'success',
                    text1: 'Check Your Inbox',
                    text2: 'If an account exists for that email, a reset link is on its way.',
                });
                setForgotPasswordVisible(false);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: getAuthErrorMessage(error?.code, 'We couldn\u2019t send the reset email. Please try again.'),
                });
            }
        } finally {
            setResetLoading(false);
        }
    };

    return {
        resetLoading,
        forgotPasswordVisible,
        setForgotPasswordVisible,
        handleForgotPasswordSubmit
    }
}

export default useForgotPassword