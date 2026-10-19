import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from '@react-native-firebase/firestore'
import { getAuth } from '@react-native-firebase/auth'
import Toast from 'react-native-toast-message'
import { getFirebaseErrorMessage } from '../../helpers/Helpers'

interface UseFirestoreDocOptions<T extends Record<string, any>> {
    path: string[]
    defaultValue: T
    fetchOnMount?: boolean
}

interface SaveOptions {
    successTitle?: string
    successMessage?: string
    showSuccessToast?: boolean
}

export function useFirestoreDoc<T extends Record<string, any>>({
    path,
    defaultValue,
    fetchOnMount = true,
}: UseFirestoreDocOptions<T>) {
    const [data, setData] = useState<T>(defaultValue)
    const [fetching, setFetching] = useState(fetchOnMount)
    const [saving, setSaving] = useState(false)

    const getDocRef = useCallback(() => {
        const auth = getAuth()
        const currentUser = auth.currentUser

        if (!currentUser) {
            return null
        }

        const firestore = getFirestore()
        return doc(firestore, 'users', currentUser.uid, ...path)
    }, [path.join('/')])

    const fetchData = useCallback(async () => {
        try {
            setFetching(true)

            const ref = getDocRef()

            if (!ref) {
                return
            }

            const snapshot = await getDoc(ref)

            if (snapshot.exists()) {
                setData(prev => ({ ...prev, ...(snapshot.data() as T) }))
            }
        } catch (error: any) {
            console.log('useFirestoreDoc fetch error:', error)
            Toast.show({
                type: 'error',
                text1: 'Failed to Load',
                text2: getFirebaseErrorMessage(error),
            })
        } finally {
            setFetching(false)
        }
    }, [getDocRef])

    const saveData = useCallback(
        async (payload: Partial<T>, options?: SaveOptions): Promise<boolean> => {
            try {
                setSaving(true)

                const auth = getAuth()
                const currentUser = auth.currentUser

                if (!currentUser) {
                    Toast.show({
                        type: 'error',
                        text1: 'Not Signed In',
                        text2: 'Please log in again and try saving.',
                    })
                    return false
                }

                const ref = getDocRef()

                if (!ref) {
                    return false
                }

                await setDoc(
                    ref,
                    {
                        ...payload,
                        userId: currentUser.uid,
                        updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                )

                setData(prev => ({ ...prev, ...payload }))

                if (options?.showSuccessToast !== false) {
                    Toast.show({
                        type: 'success',
                        text1: options?.successTitle ?? 'Saved',
                        text2: options?.successMessage ?? 'Your data has been saved successfully.',
                    })
                }

                return true
            } catch (error: any) {
                console.log('useFirestoreDoc save error:', error)
                Toast.show({
                    type: 'error',
                    text1: 'Something Went Wrong',
                    text2: getFirebaseErrorMessage(error),
                })
                return false
            } finally {
                setSaving(false)
            }
        },
        [getDocRef]
    )

    useEffect(() => {
        if (fetchOnMount) {
            fetchData()
        }

    }, [])

    return { data, setData, fetching, saving, fetchData, saveData }
}