import { StyleSheet, View, Pressable } from 'react-native'
import React, { useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Timeline from 'react-native-timeline-flatlist'
import { COLORS, FONT, commonStyles, hp } from '../../enums/StyleGuide'
import { IconButton, KeyboardAware, NavBar, TextLabel } from '../../commons'
import { IMAGES } from '../../assets/images'
import { AccidentRecord, accidentsHistoryData, IncidentStatus, Severity, SeverityFilter, TimelineRowData } from '../../dummy/Dummies'

const SEVERITY_COLOR: Record<Severity, string> = {
    High: COLORS.red,
    Moderate: '#E8A93B',
    Low: COLORS.green,
}

const STATUS_STYLE: Record<IncidentStatus, { bg: string; color: string }> = {
    Resolved: { bg: '#E6F6EC', color: COLORS.green },
    'Under Review': { bg: COLORS.lightRed, color: COLORS.red },
    'False Alarm': { bg: '#EFEFEF', color: COLORS.grey3 },
}

const FILTERS: SeverityFilter[] = ['All', 'High', 'Moderate', 'Low']

const HistoryScreen: React.FC = () => {
    const [filter, setFilter] = useState<SeverityFilter>('All')

    const filteredData: AccidentRecord[] = useMemo(() => {
        if (filter === 'All') return accidentsHistoryData
        return accidentsHistoryData.filter((item) => item.severity === filter)
    }, [filter])

    const timelineData: TimelineRowData[] = useMemo(
        () =>
            filteredData.map((item) => ({
                ...item,
                lineColor: COLORS.lightRed,
                circleColor: SEVERITY_COLOR[item.severity],
            })),
        [filteredData]
    )

    const summary = useMemo(() => {
        const total = accidentsHistoryData.length
        const resolved = accidentsHistoryData.filter((i) => i.status === 'Resolved').length
        const pending = accidentsHistoryData.filter((i) => i.status === 'Under Review').length
        return { total, resolved, pending }
    }, [])

    const renderTime = (rowData: any, rowID: number) => {
        const timelineRow = rowData as TimelineRowData
        return (
            <View style={styles.timeContainer}>
                <TextLabel text={timelineRow.time} style={styles.timeText} />
                <TextLabel text={timelineRow.date} style={styles.dateText} />
            </View>
        )
    }

    const renderDetail = (rowData: any, rowID: number) => {
        const timelineRow = rowData as TimelineRowData
        const statusStyle = STATUS_STYLE[timelineRow.status]
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <TextLabel numberOfLines={1} text={timelineRow.title} style={styles.cardTitle} />
                    <View style={[styles.severityPill, { backgroundColor: `${SEVERITY_COLOR[timelineRow.severity]}1A` }]}>
                        <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLOR[timelineRow.severity] }]} />
                        <TextLabel text={timelineRow.severity} style={[styles.severityText, { color: SEVERITY_COLOR[timelineRow.severity] }]} />
                    </View>
                </View>

                <TextLabel numberOfLines={3} text={timelineRow.description} style={styles.cardDescription} />

                <View style={styles.cardFooter}>
                    <View style={styles.locationRow}>
                        <IconButton disabled source={IMAGES.GPS} iconStyle={styles.footerIcon} containerStyle={styles.footerIconContainer} />
                        <TextLabel numberOfLines={1} text={timelineRow.location} style={styles.locationText} />
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <TextLabel text={timelineRow.status} style={[styles.statusText, { color: statusStyle.color }]} />
                    </View>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView edges={['top']} style={commonStyles.safeView}>
            <NavBar headerLabel='History' subHeaderLabel='Accident & alert log' />
            <KeyboardAware>

                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <TextLabel text={String(summary.total)} style={styles.summaryValue} />
                        <TextLabel text='Total' style={styles.summaryLabel} />
                    </View>
                    <View style={[styles.summaryCard, styles.summaryDivider]}>
                        <TextLabel text={String(summary.resolved)} style={[styles.summaryValue, { color: COLORS.green }]} />
                        <TextLabel text='Resolved' style={styles.summaryLabel} />
                    </View>
                    <View style={styles.summaryCard}>
                        <TextLabel text={String(summary.pending)} style={[styles.summaryValue, { color: COLORS.red }]} />
                        <TextLabel text='Under Review' style={styles.summaryLabel} />
                    </View>
                </View>

                <View style={styles.filterRow}>
                    {FILTERS.map((item) => {
                        const active = item === filter
                        return (
                            <Pressable
                                key={item}
                                onPress={() => setFilter(item)}
                                hitSlop={6}
                                style={[styles.filterChip, active && styles.filterChipActive]}
                            >
                                <TextLabel text={item} style={[styles.filterChipText, active && styles.filterChipTextActive]} />
                            </Pressable>
                        )
                    })}
                </View>

                <View style={styles.timelineWrapper}>
                    {timelineData.length > 0 ? (
                        <Timeline
                            data={timelineData}
                            circleSize={16}
                            circleColor={COLORS.red}
                            lineColor={COLORS.lightRed}
                            lineWidth={2}
                            innerCircle='dot'
                            separator={false}
                            columnFormat='single-column-left'
                            showTime={false}
                            renderTime={renderTime}
                            renderDetail={renderDetail}
                            timeContainerStyle={styles.timeColumn}
                            detailContainerStyle={styles.detailColumn}
                            style={styles.timeline}
                            options={{
                                style: { paddingTop: hp('1%'), paddingBottom: hp('4%') },
                                scrollEnabled: false,
                            }}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <IconButton disabled source={IMAGES.HISTORY} iconStyle={styles.emptyIcon} containerStyle={styles.emptyIconContainer} />
                            <TextLabel text='No incidents here' style={styles.emptyTitle} />
                            <TextLabel text='Nothing was flagged for this severity level.' style={styles.emptyText} />
                        </View>
                    )}
                </View>

            </KeyboardAware>
        </SafeAreaView>
    )
}

export default HistoryScreen

const styles = StyleSheet.create({
    summaryContainer: {
        width: '100%',
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        borderWidth: 0.7,
        borderColor: COLORS.lightRed,
        marginTop: hp('1.5%'),
        paddingVertical: hp('1.5%'),
    },
    summaryCard: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryDivider: {
        borderLeftWidth: 0.7,
        borderRightWidth: 0.7,
        borderColor: COLORS.lightRed,
    },
    summaryValue: {
        fontFamily: FONT.semiBold,
        fontSize: 18,
        color: COLORS.black,
    },
    summaryLabel: {
        fontSize: 11,
        color: COLORS.grey3,
        marginTop: 2,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: hp('1.5%'),
    },
    filterChip: {
        borderWidth: 0.7,
        borderColor: COLORS.lightRed,
        borderRadius: 20,
        paddingVertical: 7,
        paddingHorizontal: 14,
        backgroundColor: COLORS.white,
    },
    filterChipText: {
        fontSize: 12,
        color: COLORS.grey3,
    },
    filterChipActive: {
        backgroundColor: COLORS.red,
        borderColor: COLORS.red,
    },
    filterChipTextActive: {
        color: COLORS.white,
        fontFamily: FONT.semiBold,
    },
    timelineWrapper: {
        width: '100%',
        marginTop: hp('2%'),
    },
    timeline: {
        flex: 1,
    },
    timeColumn: {
        minWidth: 64,
        paddingRight: 4,
    },
    timeContainer: {
        alignItems: 'flex-start',
    },
    timeText: {
        fontFamily: FONT.semiBold,
        fontSize: 12,
        color: COLORS.black,
    },
    dateText: {
        fontSize: 10,
        color: COLORS.grey3,
        marginTop: 2,
    },
    detailColumn: {
        marginTop: -4,
    },
    card: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 14,
        borderWidth: 0.7,
        borderColor: COLORS.lightRed,
        padding: 12,
        marginBottom: hp('1.5%'),
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        flex: 1,
        fontFamily: FONT.semiBold,
        fontSize: 14.5,
        color: COLORS.black,
        marginRight: 8,
    },
    severityPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingVertical: 3,
        paddingHorizontal: 8,
        gap: 4,
    },
    severityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    severityText: {
        fontSize: 10.5,
        fontFamily: FONT.semiBold,
    },
    cardDescription: {
        fontSize: 12.5,
        color: COLORS.grey3,
        marginTop: 6,
        lineHeight: 18,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 0.5,
        borderTopColor: COLORS.lightRed,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 4,
    },
    footerIconContainer: {
        width: 20,
        height: 20,
        backgroundColor: 'transparent',
    },
    footerIcon: {
        tintColor: COLORS.red,
        width: 12,
        height: 12,
    },
    locationText: {
        fontSize: 11.5,
        color: COLORS.grey3,
        flexShrink: 1,
    },
    statusBadge: {
        borderRadius: 20,
        paddingVertical: 3,
        paddingHorizontal: 10,
    },
    statusText: {
        fontSize: 10.5,
        fontFamily: FONT.semiBold,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp('6%'),
        gap: 4,
    },
    emptyIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.lightRed,
        marginBottom: 6,
    },
    emptyIcon: {
        tintColor: COLORS.red,
    },
    emptyTitle: {
        fontFamily: FONT.semiBold,
        fontSize: 13.5,
        color: COLORS.black,
    },
    emptyText: {
        color: COLORS.grey3,
        fontSize: 12,
    },
})