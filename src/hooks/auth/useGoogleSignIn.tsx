import { getAuth, GoogleAuthProvider, signInWithCredential } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useEffect, useState } from "react";
import { getAuthErrorMessage, syncGoogleUserToFirestore } from "../../helpers/Helpers";
import { useNavigation } from '@react-navigation/native';
import { BOTTOM_TAB } from "../../enums";
import Toast from "react-native-toast-message";

const useGoogleSignIn = () => {
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '1003397187774-bavm7tq8sv292gva4f312g0pur0eklf2.apps.googleusercontent.com',
            offlineAccess: true
        });
    }, []);

    const [googleLoader, setGoogleLoader] = useState(false)
    const navigation = useNavigation()

    const signInWithGoogle = async () => {
        try {
            setGoogleLoader(true)
            await GoogleSignin.signOut();
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const signInResult = await GoogleSignin.signIn();

            const idToken = signInResult.data?.idToken;

            if (!idToken) {
                throw new Error('No Google ID token found');
            }

            const googleCredential = GoogleAuthProvider.credential(idToken);

            const userCredential =
                await signInWithCredential(
                    getAuth(),
                    googleCredential,
                );

            const user = userCredential.user;

            const isNewUser = userCredential.additionalUserInfo?.isNewUser;

            await syncGoogleUserToFirestore(user, isNewUser);

            navigation.reset({
                index: 0,
                routes: [{ name: BOTTOM_TAB.BOTTOM_NAVIGATOR } as never],
            })

            return user;
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Google Sign-In Error',
                text2: getAuthErrorMessage(error?.code, 'We couldn\u2019t sign you in with Google. Please try again.'),
            })
        } finally {
            setGoogleLoader(false)
        }
    };

    return {
        googleLoader,
        signInWithGoogle
    }
}

export default useGoogleSignIn