import { StyleSheet, View, SectionList, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { ACTIVE_OPACITY, COLORS, FONT, hp } from '../../enums/StyleGuide'
import { SafeAreaView } from 'react-native-safe-area-context'
import { IconButton, NavBar, TextLabel } from '../../commons'
import { IMAGES } from '../../assets/images'
import { ContactCard } from '../../components'
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../../enums'

type RelationType = 'Spouse' | 'Parent' | 'Sibling' | 'Friend' | 'Other'

interface Contact {
    id: number
    title: string
    relation: RelationType
    image: any
}

interface Section {
    title: string
    data: Contact[]
}

const contacts: Contact[] = [
    { id: 1, title: 'Ayesha Khan', relation: 'Spouse', image: IMAGES.USER },
    { id: 2, title: 'Tariq Khan', relation: 'Parent', image: IMAGES.USER },
    { id: 3, title: 'Naz Khan', relation: 'Parent', image: IMAGES.USER },
    { id: 4, title: 'Sami Khan', relation: 'Sibling', image: IMAGES.USER },
    { id: 5, title: 'Ali Khan', relation: 'Sibling', image: IMAGES.USER },
    { id: 6, title: 'Adeel Khan', relation: 'Sibling', image: IMAGES.USER },
    { id: 7, title: 'Hamza Sheikh', relation: 'Friend', image: IMAGES.USER },
    { id: 8, title: 'Bilal Ahmed', relation: 'Friend', image: IMAGES.USER },
    { id: 9, title: 'Dr. Fatima Malik', relation: 'Other', image: IMAGES.USER },
]

const SECTION_ORDER: { key: RelationType; label: string }[] = [
    { key: 'Spouse', label: 'Spouse' },
    { key: 'Parent', label: 'Parents' },
    { key: 'Sibling', label: 'Siblings' },
    { key: 'Friend', label: 'Friends' },
    { key: 'Other', label: 'Other' },
]

const ContactsScreen = () => {
    const navigation = useNavigation<any>()
    const sections: Section[] = SECTION_ORDER
        .map(({ key, label }) => ({
            title: label,
            data: contacts.filter((c) => c.relation === key),
        }))
        .filter((section) => section.data.length > 0)

    const totalContacts = contacts.length

    return (
        <SafeAreaView edges={['top']} style={styles.safeView}>
            <NavBar headerLabel='My Contacts' />

            <SectionList
                sections={sections}
                keyExtractor={(item) => String(item.id)}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.infoBanner}>
                        <View style={styles.infoIconWrap}>
                            <View style={styles.infoIconDot} />
                        </View>
                        <TextLabel
                            text='These people will be notified instantly with your live location when an accident is detected.'
                            style={styles.infoText}
                        />
                    </View>
                }
                renderSectionHeader={({ section }) => (
                    <View style={styles.sectionHeaderRow}>
                        <TextLabel text={section.title.toUpperCase()} style={styles.sectionTitle} />
                        <View style={styles.sectionLine} />
                        <TextLabel text={`${section.data.length}`} style={styles.sectionCount} />
                    </View>
                )}
                renderItem={({ item }) => <ContactCard item={item} />}
                SectionSeparatorComponent={() => <View style={{ height: hp('0.6%') }} />}
                ListFooterComponent={
                    totalContacts > 0 ? (
                        <View style={styles.footerNote}>
                            <TextLabel
                                text={`${totalContacts} emergency contact${totalContacts > 1 ? 's' : ''} configured`}
                                style={styles.footerNoteText}
                            />
                        </View>
                    ) : null
                }
            />
            <TouchableOpacity onPress={() => navigation.navigate(SCREENS.ADD_CONTACT_SCREEN)} activeOpacity={ACTIVE_OPACITY} style={styles.fabStyle}>
                <Image source={IMAGES.ADD_CONTACT} style={styles.fabIcon} />
                <TextLabel text='Add Contact' style={styles.fabTitle} />
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default ContactsScreen

const styles = StyleSheet.create({
    safeView: {
        flex: 1,
        backgroundColor: COLORS.bgColor,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: hp('12%')
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.white,
        borderRadius: 14,
        padding: 14,
        marginTop: hp('1.8%'),
        elevation: 3
    },
    infoIconWrap: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: COLORS.red,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginTop: 1,
    },
    infoIconDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.white,
    },
    infoText: {
        flex: 1,
        fontSize: 12.5,
        lineHeight: 18,
        color: COLORS.black,
        fontFamily: FONT.medium ?? FONT.regular,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp('1%'),
        // marginBottom: hp('1%')
    },
    sectionTitle: {
        fontFamily: FONT.semiBold,
        fontSize: 12.5,
        letterSpacing: 0.8,
        color: COLORS.black,
    },
    sectionLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.grey5 ?? '#E2E2E2',
        marginHorizontal: 10,
    },
    sectionCount: {
        fontSize: 12,
        fontFamily: FONT.semiBold,
        color: COLORS.grey3,
    },
    footerNote: {
        alignItems: 'center',
        marginTop: hp('3%'),
    },
    footerNoteText: {
        fontSize: 11.5,
        color: COLORS.grey3,
    },
    fabStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: COLORS.red,
        paddingVertical: 7,
        paddingHorizontal: 10,
        flexDirection: 'row',
        gap: 5,
        position: 'absolute',
        bottom: hp('12%'),
        right: '5%'
    },
    fabIcon: {
        height: 20,
        width: 20,
        tintColor: COLORS.white
    },
    fabTitle: {
        fontFamily: FONT.semiBold,
        color: COLORS.white,
        fontSize: 13
    }
})