import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CustomButton, IconButton, InputField, NavBar, TextLabel } from '../../commons'
import { ACTIVE_OPACITY, COLORS, FONT, hp } from '../../enums/StyleGuide'
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { IMAGES } from '../../assets/images'

const AddContactScreen = () => {
    const navigation = useNavigation<any>()
    const [selectedRelation, setSelectedRelation] = useState('')

    const relationsData = [
        { id: 1, title: 'Spouse' },
        { id: 2, title: 'Parent' },
        { id: 3, title: 'Sibling' },
        { id: 4, title: 'Friend' },
        { id: 5, title: 'Other' },
    ]

    const RelationCard = ({ item }: any) => {
        const isSelected = selectedRelation === item?.title;
        return (
            <TouchableOpacity onPress={() => setSelectedRelation(item?.title)} activeOpacity={ACTIVE_OPACITY} style={{
                paddingVertical: 5,
                paddingHorizontal: 12,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isSelected ? COLORS.red : COLORS.lightRed,
                borderRadius: 20,
                borderWidth: 0.5,
                borderColor: COLORS.red,
                marginTop: hp('1%'),
                width: '24%'
            }}>
                <TextLabel text={item?.title} style={{ fontFamily: FONT.medium, color: isSelected ? COLORS.white : COLORS.red }} />
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView edges={['top']} style={styles.safeView}>
            <NavBar headerLabel='Add Contact' leftPress={() => navigation.goBack()} />
            <KeyboardAwareScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bottomOffset={20}
            >
                <View style={styles.heroContainer}>
                    <IconButton
                        source={IMAGES.ADD_CONTACT}
                        iconStyle={styles.heroIcon}
                        containerStyle={styles.heroIconContainer} />

                    <TextLabel
                        text="Emergency Contact"
                        style={styles.heroTitle}
                    />

                    <TextLabel
                        text="Choose someone who should receive an alert immediately if an accident is detected."
                        style={styles.heroSubtitle}
                    />
                </View>
                <View style={styles.formCard}>

                    <TextLabel
                        text="Contact Details"
                        style={{ fontFamily: FONT.semiBold }}
                    />
                    <InputField
                        source={IMAGES.USER}
                        keyBoardType='default'
                        returnKeyType='next'
                        autoComplete='name'
                        placeHolder='Full Name'
                        containerStyle={{ marginTop: hp('2%') }}
                        inputFieldStyle={{ height: hp('5.5%') }} />

                    <InputField
                        source={IMAGES.EMAIL}
                        returnKeyType='done'
                        autoComplete='email'
                        keyBoardType='email-address'
                        placeHolder='Email'
                        containerStyle={{ marginTop: hp('1.1%') }}
                        inputFieldStyle={{ height: hp('5.5%') }} />
                </View>
                <View style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    marginTop: hp('2%')
                }}>
                    <TextLabel text='Relationship' style={{ fontFamily: FONT.semiBold }} />
                </View>
                <View style={styles.relationContainer}>
                    {
                        relationsData.map((item) => <RelationCard key={item?.id} item={item} />)
                    }

                </View>

            </KeyboardAwareScrollView>
            <View style={styles.buttonContainer}>
                <CustomButton
                    buttonStyle={styles.buttonStyle}
                    title='Add Contact'
                    buttonTextStyle={{ lineHeight: 50 }}
                    rightIcon={<Image source={IMAGES.ADD_CONTACT} style={styles.buttonIcon} />} />
            </View>
        </SafeAreaView>
    )
}

export default AddContactScreen

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
    heroContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: hp('2%'),
        marginBottom: hp('2%')
    },
    heroIconContainer: {
        height: 60,
        width: 60,
        borderRadius: 40,
        backgroundColor: COLORS.lightRed
    },

    heroIcon: {
        height: 25,
        width: 25,
        tintColor: COLORS.red
    },

    heroTitle: {
        fontSize: 22,
        marginTop: hp('1%'),
        fontFamily: FONT.semiBold
    },

    heroSubtitle: {
        marginTop: 3,
        textAlign: 'center',
        color: COLORS.grey3,
        lineHeight: 22,
        fontSize: 14,
        paddingHorizontal: 25
    },
    buttonIcon: {
        height: 25,
        width: 25,
        tintColor: COLORS.white
    },
    buttonStyle: {
        position: 'absolute',
        bottom: hp('5%')
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16
    },
    formCard: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 18,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: {
            width: 0,
            height: 4
        },
        elevation: 2
    },
    relationContainer: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: hp('1%'),
        flexWrap: 'wrap'
    },

})