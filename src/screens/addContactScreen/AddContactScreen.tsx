import { Image, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CustomButton, IconButton, InputField, KeyboardAware, NavBar, TextLabel } from '../../commons'
import { commonStyles, FONT, hp } from '../../enums/StyleGuide'
import { IMAGES } from '../../assets/images'
import { relationsData } from '../../dummy/Dummies'
import { RelationCard } from '../../components'
import useAddContactScreen from './useAddContactScreen'
import { styles } from './Styles'

const AddContactScreen = () => {
    const { navigation, name, setName, email, setEmail, selectedRelation, setSelectedRelation, loading, addContact } = useAddContactScreen()

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
                    title={loading ? 'Adding...' : 'Add Contact'}
                    disabled={loading}
                    onPress={addContact}
                    buttonTextStyle={{ lineHeight: 50 }}
                    rightIcon={<Image source={IMAGES.ADD_CONTACT} style={styles.buttonIcon} />} />
            </View>
        </SafeAreaView>
    )
}

export default AddContactScreen