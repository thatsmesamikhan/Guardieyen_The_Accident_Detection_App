import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from "@react-native-firebase/auth"
import { useNavigation } from '@react-navigation/native'
import { useState } from "react"
import { useForgotPassword } from "../../../hooks/auth"
import Toast from "react-native-toast-message"

const useChangePassModalView = () => {
    const auth = getAuth()
    const navigation = useNavigation()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const { resetLoading, forgotPasswordVisible, handleForgotPasswordSubmit, setForgotPasswordVisible } = useForgotPassword()
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        const trimmedCurrentPassword = currentPassword.trim();
        const trimmedNewPassword = newPassword.trim();
        const trimmedConfirmPassword = confirmPassword.trim();

        if (!trimmedCurrentPassword || !trimmedNewPassword || !trimmedConfirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill in all fields.',
            });
            return;
        }

        if (trimmedNewPassword !== trimmedConfirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'New passwords do not match.',
            });
            return;
        }

        const user = auth.currentUser;
        if (!user || !user.email) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No user is signed in.',
            });
            return;
        }

        try {
            setLoading(true);

            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            await updatePassword(user, newPassword);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Password updated successfully.',
            });
            navigation.goBack();
        } catch (error: any) {
            console.log(error);
            if (error.code === 'auth/wrong-password') {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'The current password is incorrect.',
                });
            } else if (error.code === 'auth/weak-password') {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'The new password is too weak.',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error.message,
                });
            }
        } finally {
            setLoading(false);
        }
    };
    return {
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
    }
}

export default useChangePassModalView