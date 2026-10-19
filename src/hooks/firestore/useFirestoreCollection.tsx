import { useCallback, useEffect, useState } from 'react'
import { collection, getDocs, getFirestore } from '@react-native-firebase/firestore'
import { getAuth } from '@react-native-firebase/auth'
import Toast from 'react-native-toast-message'
import { getFirebaseErrorMessage } from '../../helpers/Helpers'

interface UseFirestoreCollectionOptions {
    path: string[]
    fetchOnMount?: boolean
}

export function useFirestoreCollection<T extends Record<string, any>>({
    path,
    fetchOnMount = true,
}: UseFirestoreCollectionOptions) {
    const [items, setItems] = useState<(T & { id: string })[]>([])
    const [fetching, setFetching] = useState(fetchOnMount)

    const getCollectionRef = useCallback(() => {
        const auth = getAuth()
        const currentUser = auth.currentUser

        if (!currentUser) {
            return null
        }

        const firestore = getFirestore()
        return collection(firestore, 'users', currentUser.uid, ...path)
    }, [path.join('/')])

    const fetchItems = useCallback(async () => {
        try {
            setFetching(true)

            const ref = getCollectionRef()

            if (!ref) {
                setItems([])
                return
            }

            const snapshot = await getDocs(ref)
            const results = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...(docSnap.data() as T),
            }))

            setItems(results)
        } catch (error: any) {
            console.log('useFirestoreCollection fetch error:', error)
            Toast.show({
                type: 'error',
                text1: 'Failed to Load',
                text2: getFirebaseErrorMessage(error),
            })
        } finally {
            setFetching(false)
        }
    }, [getCollectionRef])

    useEffect(() => {
        if (fetchOnMount) {
            fetchItems()
        }
    }, [])

    return { items, fetching, fetchItems }
}