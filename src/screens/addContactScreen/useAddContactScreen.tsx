import { useState } from 'react'
import Toast from 'react-native-toast-message'
import { EMAIL_REGEX } from '../../enums/StyleGuide'
import { getAuth } from '@react-native-firebase/auth'
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from '@react-native-firebase/firestore'
import { relationsData } from '../../dummy/Dummies'
import { useNavigation } from '@react-navigation/native';

const useAddContactScreen = () => {
    const navigation = useNavigation<any>()
    const [selectedRelation, setSelectedRelation] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const addContact = async () => {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedName) {
            Toast.show({
                type: 'error',
                text1: 'Name Required',
                text2: 'Please enter your full name.',
            });
            return;
        }

        if (trimmedName.length < 2) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Name',
                text2: 'Please enter a valid name.',
            });
            return;
        }

        if (!trimmedEmail) {
            Toast.show({
                type: 'error',
                text1: 'Email Required',
                text2: 'Please enter your email address.',
            });
            return;
        }

        if (!EMAIL_REGEX.test(trimmedEmail)) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Email',
                text2: 'Please enter a valid email address.',
            });
            return;
        }

        if (!selectedRelation) {
            Toast.show({
                type: 'error',
                text1: 'Relationship Required',
                text2: 'Please select how this contact is related to you.',
            });
            return;
        }

        try {
            setLoading(true);

            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) {
                Toast.show({
                    type: 'error',
                    text1: 'Not Signed In',
                    text2: 'Please log in again and try adding a contact.',
                });
                return;
            }

            if (trimmedEmail === currentUser.email?.toLowerCase()) {
                Toast.show({
                    type: 'error',
                    text1: 'Invalid Contact',
                    text2: 'You cannot add yourself as an emergency contact.',
                });
                return;
            }

            const firestore = getFirestore();

            const emailIndexRef = doc(firestore, 'emailIndex', trimmedEmail);
            const emailIndexSnap = await getDoc(emailIndexRef);

            if (!emailIndexSnap.exists()) {
                Toast.show({
                    type: 'error',
                    text1: 'User Not Found',
                    text2: 'This email is not registered on the app.',
                });
                return;
            }

            const contactUid = emailIndexSnap.data()?.uid;

            if (!contactUid) {
                Toast.show({
                    type: 'error',
                    text1: 'Something Went Wrong',
                    text2: 'Could not resolve this contact. Please try again.',
                });
                return;
            }

            const existingContactRef = doc(
                firestore,
                'users',
                currentUser.uid,
                'emergencyContacts',
                contactUid
            );
            const existingContactSnap = await getDoc(existingContactRef);

            if (existingContactSnap.exists()) {
                Toast.show({
                    type: 'error',
                    text1: 'Already Added',
                    text2: 'This contact already exists in your emergency contacts.',
                });
                return;
            }

            const relationLabel =
                relationsData.find(
                    (item: { id: number; title: string }) => String(item.id) === String(selectedRelation)
                )?.title ?? selectedRelation;

            await setDoc(existingContactRef, {
                contactUid,
                name: trimmedName,
                email: trimmedEmail,
                relation: relationLabel,
                addedBy: currentUser.uid,
                createdAt: serverTimestamp(),
            }, { merge: true });

            Toast.show({
                type: 'success',
                text1: 'Contact Added',
                text2: `${trimmedName} has been added as your emergency contact.`,
            });

            navigation.goBack();

        } catch (error: any) {
            console.log('addContact error:', error);
            Toast.show({
                type: 'error',
                text1: 'Something Went Wrong',
                text2: error?.message ?? 'Could not add contact. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    }
    return {
        navigation,
        name,
        setName,
        email,
        setEmail,
        selectedRelation,
        setSelectedRelation,
        loading,
        addContact
    }
}

export default useAddContactScreen