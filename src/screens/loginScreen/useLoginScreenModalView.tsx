import { useState } from 'react'
import { getAuth, sendEmailVerification, signInWithEmailAndPassword, signOut } from '@react-native-firebase/auth'
import { useNavigation } from '@react-navigation/native';
import { useForgotPassword, useGoogleSignIn } from '../../hooks/auth';
import Toast from 'react-native-toast-message';
import { EMAIL_REGEX } from '../../enums/StyleGuide';
import { BOTTOM_TAB } from '../../enums';
import { getAuthErrorMessage } from '../../helpers/Helpers';

const useLoginScreenModalView = () => {
    const auth = getAuth()
    const navigation = useNavigation<any>()
    const [resendVisible, setResendVisible] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loginLoader, setLoginLoader] = useState(false)
    const [resendVeriEmailLoader, setResendVeriEmailLoader] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const { googleLoader, signInWithGoogle } = useGoogleSignIn();
    const { resetLoading, forgotPasswordVisible, handleForgotPasswordSubmit, setForgotPasswordVisible } = useForgotPassword()

    const handleEmailChange = (text: string) => {
        setEmail(text)
        if (emailError) setEmailError('')
    }

    const handlePasswordChange = (text: string) => {
        setPassword(text)
        if (passwordError) setPasswordError('')
    }

    const showFieldAndToastError = (
        toastTitle: string,
        message: string,
        target: 'email' | 'password' | 'both',
    ) => {
        if (target === 'email' || target === 'both') setEmailError(message)
        if (target === 'password' || target === 'both') setPasswordError(message)
        Toast.show({
            type: 'error',
            text1: toastTitle,
            text2: message,
        })
    }

    const HandleLogin = async () => {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        setEmailError('')
        setPasswordError('')

        if (!trimmedEmail) {
            showFieldAndToastError('Email Required', 'Please enter your email address.', 'email')
            return;
        }

        if (!EMAIL_REGEX.test(trimmedEmail)) {
            showFieldAndToastError('Invalid Email', 'Please enter a valid email address.', 'email')
            return;
        }

        if (!trimmedPassword) {
            showFieldAndToastError('Password Required', 'Please enter a password.', 'password')
            return;
        }

        try {
            setLoginLoader(true)
            const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword)
            await userCredential.user.reload()

            if (!userCredential.user.emailVerified) {
                Toast.show({
                    type: 'info',
                    text1: 'Email Not Verified',
                    text2: 'Please check your inbox or tap below to resend the link.',
                })

                setCurrentUser(userCredential.user)
                setResendVisible(true)

                await signOut(auth)
                return
            }

            navigation.reset({
                index: 0,
                routes: [{ name: BOTTOM_TAB.BOTTOM_NAVIGATOR } as never],
            })

        } catch (error: any) {
            const message = getAuthErrorMessage(error?.code)

            if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password') {
                showFieldAndToastError('Login Error', message, 'both')
            } else if (error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-email' || error?.code === 'auth/missing-email') {
                showFieldAndToastError('Login Error', message, 'email')
            } else if (error?.code === 'auth/invalid-password') {
                showFieldAndToastError('Login Error', message, 'password')
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Login Error',
                    text2: message,
                })
            }
        } finally {
            setLoginLoader(false)
        }
    }

    const ResendVerificationEmail = async () => {
        if (!currentUser) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'We lost track of your session. Please log in again to resend the link.',
            })
            return
        }

        try {
            setResendVeriEmailLoader(true)
            await sendEmailVerification(currentUser)
            Toast.show({
                type: 'success',
                text1: 'Sent',
                text2: 'Verification email sent again. Please check your inbox or spam folder.',
            })
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: getAuthErrorMessage(error?.code, 'We couldn\u2019t resend the email. Please try again.'),
            })
        } finally {
            setResendVeriEmailLoader(false)
        }
    }
    return {
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
    }
}

export default useLoginScreenModalView