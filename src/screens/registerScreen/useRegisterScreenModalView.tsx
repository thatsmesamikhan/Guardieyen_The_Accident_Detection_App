import { useState } from 'react'
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { useForgotPassword, useGoogleSignIn } from '../../hooks/auth';
import Toast from 'react-native-toast-message';
import { EMAIL_REGEX } from '../../enums/StyleGuide';
import { doc, getFirestore, serverTimestamp, setDoc } from '@react-native-firebase/firestore';
import { SCREENS } from '../../enums';

const useRegisterScreenModalView = () => {
    const auth = getAuth();
    const navigation = useNavigation<any>()
    const [emailRegisterLoader, setEmailRegisterLoader] = useState(false)
    const [resendVisible, setResendVisible] = useState(false)
    const [userCreated, setUserCreated] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [resendVeriEmailLoader, setResendVeriEmailLoader] = useState(false)
    const { resetLoading, forgotPasswordVisible, handleForgotPasswordSubmit, setForgotPasswordVisible } = useForgotPassword()
    const { googleLoader, signInWithGoogle } = useGoogleSignIn();

    const registerWithEmail = async () => {
        if (!name.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Name Required',
                text2: 'Please enter your full name.',
            });
            return;
        }

        if (name.trim().length < 2) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Name',
                text2: 'Please enter a valid name.',
            });
            return;
        }

        if (!email.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Email Required',
                text2: 'Please enter your email address.',
            });
            return;
        }

        if (!EMAIL_REGEX.test(email.trim())) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Email',
                text2: 'Please enter a valid email address.',
            });
            return;
        }

        if (!password) {
            Toast.show({
                type: 'error',
                text1: 'Password Required',
                text2: 'Please enter a password.',
            });
            return;
        }

        if (password.length < 8) {
            Toast.show({
                type: 'error',
                text1: 'Weak Password',
                text2: 'Password must be at least 8 characters long.',
            });
            return;
        }

        if (!/[A-Z]/.test(password)) {
            Toast.show({
                type: 'error',
                text1: 'Weak Password',
                text2: 'Password must contain at least one uppercase letter.',
            });
            return;
        }

        if (!/[a-z]/.test(password)) {
            Toast.show({
                type: 'error',
                text1: 'Weak Password',
                text2: 'Password must contain at least one lowercase letter.',
            });
            return;
        }

        if (!/[0-9]/.test(password)) {
            Toast.show({
                type: 'error',
                text1: 'Weak Password',
                text2: 'Password must contain at least one number.',
            });
            return;
        }

        if (!confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Confirm Password',
                text2: 'Please confirm your password.',
            });
            return;
        }

        if (password !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Passwords Do Not Match',
                text2: 'Please make sure both passwords are identical.',
            });
            return;
        }
        try {
            setEmailRegisterLoader(true)

            if (!userCreated) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password)
                await sendEmailVerification(userCredential.user);

                Toast.show({
                    type: 'info',
                    text1: 'Verify Email',
                    text2: 'We sent a verification link. Please check your inbox (and spam folder).',
                })

                setUserCreated(true)
                setResendVisible(true)
            } else {
                const user = auth.currentUser
                await user?.reload()
                const updatedUser = auth.currentUser

                if (updatedUser?.emailVerified) {
                    const firestore = getFirestore();
                    await setDoc(doc(firestore, 'users', updatedUser.uid), {
                        uid: updatedUser.uid,
                        name: name.trim(),
                        email: updatedUser.email,
                        createdAt: serverTimestamp(),
                    }, { merge: true });

                    await setDoc(doc(firestore, 'emailIndex', updatedUser.email!.toLowerCase()), {
                        uid: updatedUser.uid,
                    }, { merge: true });

                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: 'Your account is now verified and saved!',
                    })
                    navigation.reset({
                        index: 0,
                        routes: [{ name: SCREENS.LOGIN_SCREEN }],
                    });

                } else {
                    Toast.show({
                        type: 'info',
                        text1: 'Email Not Verified',
                        text2: 'Your email is not verified yet. Please check your inbox.',
                    })

                    setResendVisible(true)
                }
            }
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'That email address is already in use!',
                })
            } else if (error.code === 'auth/invalid-email') {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'That email address is invalid!',
                })
            } else if (error.code === 'auth/weak-password') {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Password should be at least 6 characters.',
                })
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error.message,
                })
            }
        } finally {
            setEmailRegisterLoader(false)
        }
    }

    const ResendVerificationEmail = async () => {
        try {
            setResendVeriEmailLoader(true)
            const user = auth.currentUser
            if (!user) throw new Error('No active session. Please register again.');

            await sendEmailVerification(user);
            Toast.show({
                type: 'success',
                text1: 'Sent',
                text2: 'Verification email sent again. Please check your inbox.',
            })
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message,
            })
        } finally {
            setResendVeriEmailLoader(false)
        }
    }
    return {
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
    }
}

export default useRegisterScreenModalView