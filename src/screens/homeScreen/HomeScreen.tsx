import { Alert, Pressable, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, FONT, hp } from '../../enums/StyleGuide'
import { IconButton, NavBar, TextLabel } from '../../commons'
import { IMAGES } from '../../assets/images'
import { ContactCard, HomeScreenHeaderCard, HomeScreenInfoCard } from '../../components'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const HomeScreen = () => {
    const [isSwitchOn, setIsSwitchOn] = useState(false)

    const homeScreenInfoData = [
        { id: 1, title: 'Sensors', info: 'Active', icon: IMAGES.SENSORS },
        { id: 2, title: 'GPS', info: 'Connected', icon: IMAGES.GPS },
        { id: 3, title: 'Background', info: 'Running', icon: IMAGES.BACKGROUND },
        { id: 4, title: 'Contacts', info: 'Ready', icon: IMAGES.CONTACTS },
    ]

    const contacts = [
        { id: 1, title: 'Sami Khan', relation: 'Brother', image: IMAGES.USER },
        { id: 2, title: 'Ali Khan', relation: 'Brother', image: IMAGES.USER },
        { id: 3, title: 'Adeel Khan', relation: 'Brother', image: IMAGES.USER },
    ]

    const bloodGroupInfoData = [
        { id: 1, title: 'BLOOD GROUP', info: 'O+' },
        { id: 2, title: 'CONDITIONS', info: 'Asthma' },
    ]

    const BloodGroupInfoCard = ({ item }: any) => {
        return (
            <View style={{
                width: '50%',
                justifyContent: 'flex-start',
                alignItems: 'flex-start'
            }}>
                <TextLabel numberOfLines={1} text={item?.title} style={styles.titleStyle} />
                <TextLabel numberOfLines={1} text={item?.info} style={[styles.infoStyle, { marginTop: hp('0.5%') }]} />
            </View>
        )
    }

    const allergiesData = [
        { id: 1, allergies: 'Peanuts' },
        { id: 2, allergies: 'Penicillin' },
        { id: 3, allergies: 'Dust' },
    ]

    const AllergiesCard = ({ item }: any) => {
        return (
            <View style={styles.safetyBadge}>
                <TextLabel text={item?.allergies} style={styles.safetyBadgeText} />
            </View>
        )
    }

    const locationInfoData = [
        { id: 1, title: 'LATITUDE', info: '28.4201° N' },
        { id: 2, title: 'LONGITUDE', info: '70.2954° E' },
        { id: 3, title: 'ACCURACY', info: '±6m' },
    ]

    const LocationInfoCard = ({ item }: any) => {
        return (
            <View style={{
                width: '33.33%',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                marginTop: hp('1%')
            }}>
                <TextLabel numberOfLines={1} text={item?.title} style={[styles.titleStyle, { color: COLORS.lightRed }]} />
                <TextLabel numberOfLines={1} text={item?.info} style={[styles.infoStyle, { marginTop: hp('0.5%'), color: COLORS.white }]} />
            </View>
        )
    }

    return (
        <SafeAreaView edges={['top']} style={styles.safeView}>
            <NavBar headerLabel='Hi, Sami Khan' subHeaderLabel='Monitoring active & secure' rightSource={IMAGES.BELL} />
            <KeyboardAwareScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bottomOffset={20}
            >
                <HomeScreenHeaderCard
                    isSwitchOn={isSwitchOn}
                    switchPress={() => setIsSwitchOn(prev => !prev)}
                    lastUpdated='Just Now'
                    percentOfSafeScore={98}
                />

                <View style={styles.infoContainer}>
                    {
                        homeScreenInfoData.map((item) => <HomeScreenInfoCard key={item?.id} item={item} />)
                    }
                </View>
                <View style={styles.contactsTextContainer}>
                    <TextLabel text='Emergency Contacts' style={styles.emergencyLabel} />
                    <TextLabel selectable text='+ Add Contact' style={styles.addContactLabel} />
                </View>

                {
                    contacts.map((item) => <ContactCard key={item?.id} item={item} />)
                }
                <View style={styles.medInfoCard}>
                    <View style={styles.medInfoHeader}>
                        <View style={styles.medInfoTitle}>
                            <IconButton disabled={true} source={IMAGES.MEDICAL} iconStyle={{ tintColor: COLORS.red }} />
                            <TextLabel numberOfLines={1} text='Medical Information' style={styles.emergencyLabel} />
                        </View>
                        <TextLabel selectable text='Edit' style={[styles.addContactLabel, { textDecorationLine: 'underline' }]} />
                    </View>
                    <View style={styles.bloodGroupContainer}>
                        {
                            bloodGroupInfoData.map((item) => <BloodGroupInfoCard key={item?.id} item={item} />)
                        }
                    </View>
                    <View style={styles.allergiesContainer}>
                        <TextLabel numberOfLines={1} text={'ALLERGIES'} style={styles.titleStyle} />
                    </View>
                    <View style={styles.allergies}>
                        {
                            allergiesData.map((item) => <AllergiesCard key={item?.id} item={item} />)
                        }
                    </View>
                    <View style={styles.allergiesContainer}>
                        <TextLabel numberOfLines={1} text={'EMERGENCY NOTES'} style={styles.titleStyle} />
                    </View>
                    <TextLabel numberOfLines={4} text={'Carries inhaler in side pocket of backpack.Contact Dr. Aris if respiratory distress persists.'} style={{ fontSize: 14, marginTop: hp('0.5%') }} />
                </View>
                <View style={styles.locationContainer}>
                    <View style={styles.medInfoHeader}>
                        <View style={styles.medInfoTitle}>
                            <IconButton disabled={true} source={IMAGES.GPS} iconStyle={{ tintColor: COLORS.bgColor }} containerStyle={{ backgroundColor: COLORS.red }} />
                            <TextLabel numberOfLines={1} text='Current Location' style={[styles.emergencyLabel, { color: COLORS.white }]} />
                        </View>
                        <View style={[styles.safetyBadge, { backgroundColor: COLORS.lightRed }]}>
                            <TextLabel text={'GPS Active'} style={[styles.safetyBadgeText, { color: COLORS.black }]} />
                        </View>
                    </View>
                    <View style={styles.latitudeContainer}>
                        {
                            locationInfoData.map((item) => <LocationInfoCard key={item?.id} item={item} />)
                        }
                    </View>
                </View>
                <Pressable
                    delayLongPress={2000}
                    onLongPress={() => Alert.alert('Contacts Alerted')} android_ripple={{ color: COLORS.lightGrey }} style={styles.emergencySosButton}>
                    <IconButton disabled={true} source={IMAGES.SOS} />
                    <View>
                        <TextLabel text={'Emergency SOS'} style={[styles.titleStyle, styles.emergencySOStitle]} />
                        <TextLabel text={`Hold for 2 seconds to notify your\nemergency contacts.`} style={styles.emergencySubTitleStyle} />
                    </View>
                </Pressable>

            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    safeView: {
        flex: 1,
        backgroundColor: COLORS.bgColor,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: hp('15%')
    },
    infoContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: hp('1%'),
        flexWrap: 'wrap'
    },
    safetyBadge: {
        padding: 3,
        borderRadius: 20,
        backgroundColor: COLORS.lightRed,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8
    },
    safetyBadgeText: {
        fontSize: 10,
        color: COLORS.red
    },
    contactsTextContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: hp('1%'),
        marginBottom: hp('1')
    },
    emergencyLabel: {
        fontFamily: FONT.semiBold
    },
    addContactLabel: {
        color: COLORS.red,
        fontSize: 13
    },
    titleStyle: {
        color: COLORS.grey3,
        fontSize: 11.5
    },
    infoStyle: {
        color: COLORS.red,
        fontFamily: FONT.semiBold,
        fontSize: 16,
        marginTop: -3
    },
    medInfoCard: {
        width: '100%',
        borderRadius: 16,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        marginTop: hp('2%'),
        borderWidth: 0.7,
        borderColor: COLORS.red
    },
    medInfoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    },
    medInfoTitle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bloodGroupContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: hp('1%'),
    },
    allergiesContainer: {
        width: '100%',
        marginTop: hp('1.5%')
    },
    allergies: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        width: '100%',
        marginTop: hp('0.5%')
    },
    emergencySubTitleStyle: {
        fontSize: 12,
    },
    emergencySosButton: {
        width: '100%',
        borderRadius: 16,
        padding: 12,
        backgroundColor: COLORS.lightRed,
        marginTop: hp('2%'),
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    emergencySOStitle: {
        color: COLORS.red,
        fontFamily: FONT.semiBold,
        fontSize: 15
    },
    latitudeContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: hp('1%'),
        borderTopWidth: 0.3,
        borderTopColor: COLORS.lightRed
    },
    locationContainer: {
        width: '100%',
        borderRadius: 16,
        backgroundColor: COLORS.red,
        padding: 12,
        marginTop: hp('2%'),
        paddingBottom: hp('2%')
    }
})