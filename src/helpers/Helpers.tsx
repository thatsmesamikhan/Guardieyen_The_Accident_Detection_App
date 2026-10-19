import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';

export const getAuthErrorMessage = (
    code: string | undefined,
    fallback = 'Something went wrong. Please try again.'
): string => {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'That email address is already registered. Try signing in instead.';
        case 'auth/invalid-email':
            return 'That doesn\u2019t look like a valid email address.';
        case 'auth/weak-password':
            return 'Please choose a stronger password (at least 6 characters).';
        case 'auth/user-not-found':
            return 'We couldn\u2019t find an account with that email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please wait a moment and try again.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection and try again.';
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
            return 'That email or password doesn\u2019t look right. Please check and try again.';
        case 'auth/requires-recent-login':
            return 'Please sign in again to continue.';
        case 'auth/operation-not-allowed':
            return 'This sign-in method is currently unavailable. Please contact support.';
        case 'auth/missing-email':
            return 'Please enter your email address.';
        case 'auth/invalid-password':
            return 'Please enter a valid password.';
        case 'auth/account-exists-with-different-credential':
            return 'An account already exists with this email using a different sign-in method. Try logging in with your password instead.';
        default:
            return fallback;
    }
};

const syncEmailIndex = async (uid: string, email: string | null) => {
    if (!email) return;

    const db = getFirestore();
    const emailIndexRef = doc(db, 'emailIndex', email.toLowerCase());

    await setDoc(emailIndexRef, { uid }, { merge: true });
};

export const syncGoogleUserToFirestore = async (
    user: { uid: string; displayName: string | null; email: string | null; photoURL: string | null },
    isNewUser: boolean | undefined,
) => {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', user.uid);

    const profileData = {
        uid: user.uid,
        name: user.displayName ?? '',
        email: user.email ?? '',
        photoURL: user.photoURL ?? '',
        provider: 'google',
    };

    if (isNewUser) {
        await setDoc(userDocRef, {
            ...profileData,
            createdAt: serverTimestamp(),
        });

        await syncEmailIndex(user.uid, user.email);
        return;
    }

    const existingDoc = await getDoc(userDocRef);
    if (!existingDoc.exists()) {
        await setDoc(userDocRef, {
            ...profileData,
            createdAt: serverTimestamp(),
        }, { merge: true });
    }

    await syncEmailIndex(user.uid, user.email);
};

export const getFirebaseErrorMessage = (error: any): string => {
    const code: string = error?.code ?? ''

    switch (code) {
        case 'firestore/permission-denied':
        case 'permission-denied':
            return "You don't have permission to do that. Please log in again."
        case 'firestore/unavailable':
        case 'unavailable':
            return 'No connection to the server. Please check your internet and try again.'
        case 'firestore/deadline-exceeded':
        case 'deadline-exceeded':
            return 'The request took too long. Please try again.'
        case 'firestore/unauthenticated':
        case 'unauthenticated':
            return 'Your session has expired. Please log in again.'
        case 'firestore/not-found':
        case 'not-found':
            return 'We could not find your medical info.'
        case 'firestore/resource-exhausted':
            return 'Too many requests. Please wait a moment and try again.'
        case 'firestore/cancelled':
            return 'The request was cancelled.'
        default:
            return error?.message ?? 'Something went wrong. Please try again.'
    }
}