import { Image, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CustomButton, IconButton, InputField, KeyboardAware, NavBar, TextLabel } from '../../commons'
import { COLORS, commonStyles, FONT, hp } from '../../enums/StyleGuide'
import { useNavigation } from '@react-navigation/native';
import { IMAGES } from '../../assets/images'
import { relationsData } from '../../dummy/Dummies'
import { RelationCard } from '../../components'

const AddContactScreen = () => {
    const navigation = useNavigation<any>()
    const [selectedRelation, setSelectedRelation] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    return (
        <SafeAreaView edges={['top']} style={commonStyles.safeView}>
            <NavBar headerLabel='Add Contact' leftPress={() => navigation.goBack()} />
            <KeyboardAware>
                <View style={styles.heroContainer}>
                    <IconButton source={IMAGES.ADD_CONTACT} iconStyle={styles.heroIcon} containerStyle={styles.heroIconContainer} />
                    <TextLabel text="Emergency Contact" style={styles.heroTitle} />
                    <TextLabel text="Choose someone who should receive an alert immediately if an accident is detected." style={styles.heroSubtitle} />
                </View>
                <View style={styles.formCard}>
                    <TextLabel text="Contact Details" style={{ fontFamily: FONT.semiBold }} />
                    <InputField
                        value={name}
                        onChangeText={setName}
                        source={IMAGES.USER}
                        keyBoardType='default'
                        returnKeyType='next'
                        autoComplete='name'
                        placeHolder='Full Name'
                        containerStyle={{ marginTop: hp('1%') }}
                    />
                    <InputField
                        value={email}
                        onChangeText={setEmail}
                        source={IMAGES.EMAIL}
                        returnKeyType='done'
                        autoComplete='email'
                        keyBoardType='email-address'
                        placeHolder='Email'
                        containerStyle={{ marginTop: hp('1%') }}
                    />
                </View>
                <View style={styles.relationTextContainer}>
                    <TextLabel text='Relationship' style={{ fontFamily: FONT.semiBold }} />
                </View>
                <View style={styles.relationContainer}>
                    {
                        relationsData.map((item) =>
                            <RelationCard
                                item={item}
                                key={item?.id}
                                selectedRelation={selectedRelation}
                                setSelectedRelation={setSelectedRelation}
                            />)
                    }

                </View>

            </KeyboardAware>
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
    relationTextContainer: {
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginTop: hp('2%')
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