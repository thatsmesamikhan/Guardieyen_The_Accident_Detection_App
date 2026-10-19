import { ActivityIndicator, Alert, Linking, Pressable, SectionList, StyleSheet, View } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, FONT, commonStyles, hp } from '../../enums/StyleGuide'
import { NavBar, TextLabel } from '../../commons'
import { AppNotification, RETENTION_DAYS, useNotifications } from '../../hooks/useNotifications'

type Filter = 'all' | 'received' | 'sent'
const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'received', label: 'Received' },
    { key: 'sent', label: 'Sent' },
]
const GREEN = '#1E8E3E'
const GREEN_BG = '#E6F4EA'

const timeAgo = (ms: number) => {
    const s = Math.max(0, Math.floor((Date.now() - ms) / 1000))
    if (s < 60) return 'Just now'
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
}

const sectionTitle = (ms: number) => {
    const d = new Date(ms)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

const mapsUrlFor = (n: AppNotification) =>
    Number.isFinite(n.latitude) && Number.isFinite(n.longitude)
        ? `https://www.google.com/maps/search/?api=1&query=${n.latitude},${n.longitude}`
        : null

interface CardProps {
    item: AppNotification
    onPress: (n: AppNotification) => void
    onLongPress: (n: AppNotification) => void
}

const NotificationCard = React.memo(({ item, onPress, onLongPress }: CardProps) => {
    const received = item.type === 'received'
    const hasLocation = !!mapsUrlFor(item)
    return (
        <Pressable
            onPress={() => onPress(item)}
            onLongPress={() => onLongPress(item)}
            android_ripple={{ color: COLORS.lightGrey }}
            accessibilityRole='button'
            accessibilityHint={hasLocation ? 'Opens the location in maps. Long press to delete.' : 'Long press to delete.'}
            style={[styles.card, !item.read && styles.cardUnread]}>
            <View style={[styles.iconWrap, { backgroundColor: received ? COLORS.lightRed : GREEN_BG }]}>
                <TextLabel text={received ? '🚨' : '📤'} style={styles.iconText} />
            </View>
            <View style={styles.cardBody}>
                <View style={styles.rowBetween}>
                    <TextLabel numberOfLines={1} text={item.title} style={styles.cardTitle} />
                    <TextLabel text={timeAgo(item.createdAt)} style={styles.time} />
                </View>
                <TextLabel text={item.body} style={styles.cardText} />
                <View style={styles.metaRow}>
                    <View style={[styles.tag, { backgroundColor: received ? COLORS.lightRed : GREEN_BG }]}>
                        <TextLabel
                            text={received ? 'RECEIVED' : 'SENT'}
                            style={[styles.tagText, { color: received ? COLORS.red : GREEN }]}
                        />
                    </View>
                    {hasLocation && <TextLabel text='📍 View on map' style={styles.link} />}
                </View>
            </View>
            {!item.read && <View style={styles.dot} />}
        </Pressable>
    )
})

const NotificationScreen = () => {
    const { items, loading, error, markRead, remove, clearAll } = useNotifications()
    const [filter, setFilter] = useState<Filter>('all')
    const [clearing, setClearing] = useState(false)

    const unreadCount = useMemo(() => items.filter((n) => !n.read && n.type === 'received').length, [items])

    const sections = useMemo(() => {
        const visible = items.filter((n) => filter === 'all' || n.type === filter)
        const out: { title: string; data: AppNotification[] }[] = []
        visible.forEach((n) => {
            const title = sectionTitle(n.createdAt)
            const last = out[out.length - 1]
            if (last && last.title === title) last.data.push(n)
            else out.push({ title, data: [n] })
        })
        return out
    }, [items, filter])

    const handlePress = useCallback(async (n: AppNotification) => {
        if (!n.read) markRead(n.id)
        const url = mapsUrlFor(n)
        if (!url) return
        try {
            await Linking.openURL(url)
        } catch {
            Alert.alert('Could not open maps', 'No app was found to open this location.')
        }
    }, [markRead])

    const handleDeleteOne = useCallback((n: AppNotification) => {
        Alert.alert('Delete notification?', undefined, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => remove(n.id).catch(() => Alert.alert('Could not delete. Try again.')) },
        ])
    }, [remove])

    const handleClearAll = () => {
        Alert.alert(
            'Clear all notifications?',
            'This permanently deletes your sent and received notifications.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear all',
                    style: 'destructive',
                    onPress: async () => {
                        setClearing(true)
                        try {
                            await clearAll()
                        } catch {
                            Alert.alert('Could not clear notifications. Check your connection and try again.')
                        } finally {
                            setClearing(false)
                        }
                    },
                },
            ]
        )
    }

    const renderEmpty = () => {
        if (loading) return <ActivityIndicator color={COLORS.red} style={{ marginTop: hp('8%') }} />
        return (
            <View style={styles.empty}>
                <TextLabel text={error ? '⚠️' : '🔔'} style={styles.emptyIcon} />
                <TextLabel
                    text={error ? 'Could not load notifications' : 'No notifications'}
                    style={styles.emptyTitle}
                />
                <TextLabel
                    text={error
                        ? 'Check your connection and try again later.'
                        : 'SOS alerts you send or receive will appear here.'}
                    style={styles.emptyText}
                />
            </View>
        )
    }

    return (
        <SafeAreaView style={commonStyles.safeView}>
            <NavBar
                headerLabel='Notifications'
                subHeaderLabel={unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
            />

            <View style={styles.toolbar}>
                <View style={styles.chips}>
                    {FILTERS.map((f) => {
                        const active = filter === f.key
                        return (
                            <Pressable
                                key={f.key}
                                onPress={() => setFilter(f.key)}
                                style={[styles.chip, active && styles.chipActive]}>
                                <TextLabel text={f.label} style={[styles.chipText, active && styles.chipTextActive]} />
                            </Pressable>
                        )
                    })}
                </View>
                <Pressable
                    onPress={handleClearAll}
                    disabled={items.length === 0 || clearing}
                    hitSlop={8}
                    style={{ opacity: items.length === 0 ? 0.35 : 1 }}>
                    {clearing
                        ? <ActivityIndicator size='small' color={COLORS.red} />
                        : <TextLabel text='Clear all' style={styles.clearText} />}
                </Pressable>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(n) => n.id}
                renderItem={({ item }) => (
                    <NotificationCard item={item} onPress={handlePress} onLongPress={handleDeleteOne} />
                )}
                renderSectionHeader={({ section }) => (
                    <TextLabel text={section.title.toUpperCase()} style={styles.sectionHeader} />
                )}
                stickySectionHeadersEnabled={false}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={
                    items.length > 0 ? (
                        <TextLabel
                            text={`Notifications are removed automatically after ${RETENTION_DAYS} days.`}
                            style={styles.footer}
                        />
                    ) : null
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    )
}

export default NotificationScreen

const styles = StyleSheet.create({
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: hp('1%'),
    },
    chips: { flexDirection: 'row', gap: 8 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 0.7,
        borderColor: COLORS.lightGrey,
    },
    chipActive: { backgroundColor: COLORS.red, borderColor: COLORS.red },
    chipText: { fontSize: 12.5, color: COLORS.black },
    chipTextActive: { color: COLORS.white, fontFamily: FONT.semiBold },
    clearText: { fontSize: 13, color: COLORS.red, fontFamily: FONT.semiBold },
    listContent: { paddingHorizontal: 16, paddingBottom: hp('4%'), flexGrow: 1 },
    sectionHeader: {
        fontSize: 11,
        color: COLORS.grey3,
        letterSpacing: 0.8,
        marginTop: hp('1.5%'),
        marginBottom: hp('0.8%'),
    },
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 12,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        borderWidth: 0.7,
        borderColor: COLORS.lightGrey,
        marginBottom: 10,
    },
    cardUnread: { borderColor: COLORS.red },
    iconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    iconText: { fontSize: 18 },
    cardBody: { flex: 1 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    cardTitle: { flex: 1, fontSize: 14.5, fontFamily: FONT.semiBold },
    time: { fontSize: 11, color: COLORS.grey3 },
    cardText: { fontSize: 13, color: COLORS.grey3, marginTop: 3 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
    tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    tagText: { fontSize: 9.5, fontFamily: FONT.semiBold, letterSpacing: 0.5 },
    link: { fontSize: 12, color: COLORS.red, fontFamily: FONT.semiBold },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.red, marginTop: 6 },
    empty: { alignItems: 'center', marginTop: hp('12%'), paddingHorizontal: 30 },
    emptyIcon: { fontSize: 40 },
    emptyTitle: { fontSize: 16, fontFamily: FONT.semiBold, marginTop: 10 },
    emptyText: { fontSize: 13, color: COLORS.grey3, textAlign: 'center', marginTop: 4 },
    footer: { fontSize: 11, color: COLORS.grey3, textAlign: 'center', marginTop: hp('1.5%') },
})