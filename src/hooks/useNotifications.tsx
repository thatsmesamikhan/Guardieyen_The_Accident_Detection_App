import { useCallback, useEffect, useState } from 'react'
import { getAuth } from '@react-native-firebase/auth'
import {
    getFirestore, collection, query, where, orderBy, limit,
    onSnapshot, getDocs, writeBatch, doc, updateDoc, deleteDoc, Timestamp,
} from '@react-native-firebase/firestore'

export const RETENTION_DAYS = 10
const DAY_MS = 24 * 60 * 60 * 1000

export interface AppNotification {
    id: string
    type: 'sent' | 'received'
    title: string
    body: string
    senderName?: string
    latitude?: number
    longitude?: number
    delivered?: number
    total?: number
    read: boolean
    createdAt: number // ms
}

const notifCol = (uid: string) => collection(getFirestore(), 'users', uid, 'notifications')

export const useNotifications = () => {
    const [items, setItems] = useState<AppNotification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const uid = getAuth().currentUser?.uid
        if (!uid) {
            setLoading(false)
            return
        }
        const col = notifCol(uid)
        const cutoff = Timestamp.fromMillis(Date.now() - RETENTION_DAYS * DAY_MS)

        // Housekeeping: delete anything past 10 days (TTL policy is the backup).
        getDocs(query(col, where('createdAt', '<', cutoff), limit(200)))
            .then((snap) => {
                if (snap.empty) return
                const batch = writeBatch(getFirestore())
                snap.docs.forEach((d) => batch.delete(d.ref))
                return batch.commit()
            })
            .catch((e) => console.warn('Expired cleanup failed:', e))

        const q = query(col, where('createdAt', '>=', cutoff), orderBy('createdAt', 'desc'), limit(100))
        const unsub = onSnapshot(
            q,
            (snap) => {
                setItems(
                    snap.docs.map((d) => {
                        const x: any = d.data()
                        return {
                            id: d.id,
                            type: x.type === 'sent' ? 'sent' : 'received',
                            title: x.title ?? 'Notification',
                            body: x.body ?? '',
                            senderName: x.senderName,
                            latitude: typeof x.latitude === 'number' ? x.latitude : undefined,
                            longitude: typeof x.longitude === 'number' ? x.longitude : undefined,
                            delivered: x.delivered,
                            total: x.total,
                            read: x.read === true,
                            createdAt: x.createdAt?.toMillis?.() ?? Date.now(),
                        } as AppNotification
                    })
                )
                setError(false)
                setLoading(false)
            },
            (err) => {
                console.warn('notifications listener error:', err)
                setError(true)
                setLoading(false)
            }
        )
        return unsub
    }, [])

    const markRead = useCallback(async (id: string) => {
        const uid = getAuth().currentUser?.uid
        if (!uid) return
        try {
            await updateDoc(doc(getFirestore(), 'users', uid, 'notifications', id), { read: true })
        } catch (e) {
            console.warn('markRead failed:', e)
        }
    }, [])

    const remove = useCallback(async (id: string) => {
        const uid = getAuth().currentUser?.uid
        if (!uid) return
        await deleteDoc(doc(getFirestore(), 'users', uid, 'notifications', id))
    }, [])

    // Deletes every notification, in chunks so it stays under Firestore's batch limit.
    const clearAll = useCallback(async () => {
        const uid = getAuth().currentUser?.uid
        if (!uid) return
        const CHUNK = 400
        while (true) {
            const snap = await getDocs(query(notifCol(uid), limit(CHUNK)))
            if (snap.empty) break
            const batch = writeBatch(getFirestore())
            snap.docs.forEach((d) => batch.delete(d.ref))
            await batch.commit()
            if (snap.size < CHUNK) break
        }
    }, [])

    return { items, loading, error, markRead, remove, clearAll }
}