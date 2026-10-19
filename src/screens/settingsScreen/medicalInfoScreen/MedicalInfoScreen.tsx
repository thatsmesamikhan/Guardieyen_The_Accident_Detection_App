import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CustomButton, InputField, KeyboardAware, NavBar, TextLabel } from '../../../commons'
import { COLORS, commonStyles, hp } from '../../../enums/StyleGuide'
import { useNavigation } from '@react-navigation/native'
import { AllergiesCard } from '../../../components'
import { useFirestoreDoc } from '../../../hooks/firestore/useFirestoreDoc'

const MAX_ALLERGIES = 10

interface MedicalInfoData {
    bloodGroup: string
    condition: string
    allergies: string[]
    emergencyNote: string
}

const DEFAULT_MEDICAL_INFO: MedicalInfoData = {
    bloodGroup: '',
    condition: '',
    allergies: [],
    emergencyNote: '',
}

const MedicalInfoScreen = () => {
    const navigation = useNavigation()

    const { data, fetching, saving, saveData } = useFirestoreDoc<MedicalInfoData>({
        path: ['medicalInfo', 'details'],
        defaultValue: DEFAULT_MEDICAL_INFO,
    })

    const [bloodGroup, setBloodGroup] = useState('')
    const [condition, setCondition] = useState('')
    const [allergiesInput, setAllergiesInput] = useState('')
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
    const [emergencyNote, setEmergencyNote] = useState('')

    const [errors, setErrors] = useState({
        bloodGroup: '',
        condition: '',
        allergies: '',
        emergencyNote: '',
    })

    useEffect(() => {
        if (!fetching) {
            setBloodGroup(data.bloodGroup ?? '')
            setCondition(data.condition ?? '')
            setEmergencyNote(data.emergencyNote ?? '')
            setSelectedAllergies(Array.isArray(data.allergies) ? data.allergies : [])
        }
    }, [fetching])

    const validateMedicalInfo = () => {
        const newErrors = {
            bloodGroup: '',
            condition: '',
            allergies: '',
            emergencyNote: '',
        }

        const cleanBloodGroup = bloodGroup.trim().toUpperCase()
        const cleanCondition = condition.trim()
        const cleanEmergencyNote = emergencyNote.trim()

        const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

        if (!cleanBloodGroup) {
            newErrors.bloodGroup = 'Please enter your blood group.'
        } else if (!validBloodGroups.includes(cleanBloodGroup)) {
            newErrors.bloodGroup = 'Please enter a valid blood group, e.g. O+, A+, AB-.'
        }

        if (!cleanCondition) {
            newErrors.condition = 'Please enter your medical condition.'
        } else if (cleanCondition.length < 2) {
            newErrors.condition = 'Condition must contain at least 2 characters.'
        } else if (cleanCondition.length > 100) {
            newErrors.condition = 'Condition must not exceed 100 characters.'
        } else if (/^\d+$/.test(cleanCondition)) {
            newErrors.condition = 'Please enter a valid medical condition.'
        }

        if (selectedAllergies.length === 0) {
            newErrors.allergies = 'Please add at least one allergy.'
        } else if (selectedAllergies.length > MAX_ALLERGIES) {
            newErrors.allergies = `You can add a maximum of ${MAX_ALLERGIES} allergies.`
        }

        if (cleanEmergencyNote && cleanEmergencyNote.length < 5) {
            newErrors.emergencyNote = 'Emergency note must contain at least 5 characters.'
        } else if (cleanEmergencyNote.length > 250) {
            newErrors.emergencyNote = 'Emergency note must not exceed 250 characters.'
        }

        setErrors(newErrors)

        return !Object.values(newErrors).some(error => error)
    }

    const addAllergy = () => {
        const cleanInput = allergiesInput.trim()

        if (!cleanInput) {
            setErrors(prev => ({ ...prev, allergies: 'Please enter an allergy.' }))
            return
        }

        const newItems = cleanInput
            .split(',')
            .map(item => item.trim())
            .filter(Boolean)

        if (newItems.length === 0) {
            setErrors(prev => ({ ...prev, allergies: 'Please enter a valid allergy.' }))
            return
        }

        const invalidItem = newItems.find(
            item => item.length < 2 || item.length > 50 || /^\d+$/.test(item)
        )

        if (invalidItem) {
            setErrors(prev => ({
                ...prev,
                allergies: `"${invalidItem}" is not a valid allergy name.`,
            }))
            return
        }

        setSelectedAllergies(prev => {
            const merged = [...prev]

            newItems.forEach(item => {
                const alreadyExists = merged.some(
                    existing => existing.toLowerCase() === item.toLowerCase()
                )
                if (!alreadyExists) {
                    merged.push(item)
                }
            })

            if (merged.length > MAX_ALLERGIES) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    allergies: `You can add a maximum of ${MAX_ALLERGIES} allergies.`,
                }))
                return merged.slice(0, MAX_ALLERGIES)
            }

            return merged
        })

        setAllergiesInput('')
        setErrors(prev => ({ ...prev, allergies: '' }))
    }

    const removeAllergy = (allergyToRemove: string) => {
        setSelectedAllergies(prev => prev.filter(item => item !== allergyToRemove))
    }

    const applyChanges = async () => {
        const isValid = validateMedicalInfo()

        if (!isValid) {
            return
        }

        await saveData(
            {
                bloodGroup: bloodGroup.trim().toUpperCase(),
                condition: condition.trim(),
                allergies: selectedAllergies,
                emergencyNote: emergencyNote.trim(),
            },
            {
                successTitle: 'Medical Info Saved',
                successMessage: 'Your medical information has been updated successfully.',
            }
        )
    }

    return (
        <SafeAreaView edges={['top']} style={commonStyles.safeView}>
            <NavBar headerLabel='Medical Info' leftPress={() => navigation.goBack()} />

            {fetching ? (
                <View style={styles.centered}>
                    <ActivityIndicator size='small' color={COLORS.red} />
                </View>
            ) : (
                <KeyboardAware style={{ marginTop: hp('2%') }}>
                    <View
                        style={{
                            width: '100%',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                        }}
                    >
                        <TextLabel text='Enter & edit your medical information.' style={{ fontSize: 13 }} />

                        <InputField
                            placeHolder='Enter blood group'
                            inputFieldStyle={{ fontSize: 13, marginTop: hp('1%') }}
                            helperText='e.g. O+, A+, AB-'
                            keyBoardType='default'
                            returnKeyType='next'
                            value={bloodGroup}
                            onChangeText={text => setBloodGroup(text.toUpperCase())}
                            error={errors.bloodGroup}
                            showError={!!errors.bloodGroup}
                        />

                        <InputField
                            placeHolder='Enter condition'
                            inputFieldStyle={{ fontSize: 13, marginTop: hp('1%') }}
                            helperText='e.g. Asthma'
                            keyBoardType='default'
                            returnKeyType='next'
                            value={condition}
                            onChangeText={setCondition}
                            error={errors.condition}
                            showError={!!errors.condition}
                        />

                        <View style={styles.allergyInputRow}>
                            <InputField
                                placeHolder='Enter allergies'
                                containerStyle={{ width: '82%' }}
                                inputFieldStyle={{ fontSize: 13 }}
                                keyBoardType='default'
                                returnKeyType='done'
                                value={allergiesInput}
                                onChangeText={setAllergiesInput}
                                onSubEdit={addAllergy}
                                error={errors.allergies}
                                showError={!!errors.allergies}
                            />
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={addAllergy}
                                activeOpacity={0.7}
                            >
                                <TextLabel text='Add' style={styles.addButtonText} />
                            </TouchableOpacity>
                        </View>

                        {selectedAllergies.length > 0 && (
                            <View style={styles.allergies}>
                                {selectedAllergies.map(item => (
                                    <AllergiesCard
                                        key={item}
                                        item={{ allergies: item }}
                                        onRemove={() => removeAllergy(item)}
                                    />
                                ))}
                            </View>
                        )}

                        <InputField
                            placeHolder='Enter emergency note'
                            inputFieldStyle={{ fontSize: 13, marginTop: hp('1%') }}
                            helperText='e.g. Carries inhaler in left pocket...'
                            keyBoardType='default'
                            returnKeyType='done'
                            multiLine
                            value={emergencyNote}
                            onChangeText={setEmergencyNote}
                            error={errors.emergencyNote}
                            showError={!!errors.emergencyNote}
                        />
                    </View>
                </KeyboardAware>
            )}

            <View style={styles.buttonWrapper}>
                <CustomButton
                    onPress={applyChanges}
                    loading={saving}
                    disabled={saving || fetching}
                    loaderColor={COLORS.white}
                    title='Apply Changes'
                />
            </View>
        </SafeAreaView>
    )
}

export default MedicalInfoScreen

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    allergyInputRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: hp('1%'),
    },
    addButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: COLORS.red,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 12,
        color: COLORS.white,
    },
    allergies: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
        width: '100%',
        marginTop: hp('0.5%'),
    },
    buttonWrapper: {
        width: '100%',
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: hp('5%'),
        position: 'absolute',
    },
})