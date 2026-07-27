import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACTIVE_OPACITY, COLORS, FONT, hp, TEXT_STYLE } from '../../enums/StyleGuide';
import { IMAGES } from '../../assets/images';
import { CustomButton, InputField, TextLabel } from '../../commons';

interface ForgotPasswordModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (email: string) => void;
    loading?: boolean;
}

const FOCUS_DELAY = Platform.OS === 'ios' ? 350 : 150;

const ForgotPasswordModal = ({
    visible,
    onClose,
    onSubmit,
    loading = false,
}: ForgotPasswordModalProps) => {
    const [email, setEmail] = useState('');
    const emailInputRef = useRef<any>(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            const focusTimer = setTimeout(() => {
                emailInputRef.current?.focus();
            }, FOCUS_DELAY);
            return () => clearTimeout(focusTimer);
        }
        setEmail('');
    }, [visible]);

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = () => {
        const trimmed = email.trim();
        if (!trimmed || loading) return;
        onSubmit(trimmed);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.backdrop}>
                    <TouchableWithoutFeedback>
                        <KeyboardAvoidingView behavior="padding" style={styles.avoidingView}>
                            <View
                                style={[
                                    styles.card,
                                    { paddingBottom: (insets.bottom || hp('2%')) + hp('1%') },
                                ]}
                            >
                                <View style={styles.dragHandle} />

                                <TouchableOpacity
                                    activeOpacity={ACTIVE_OPACITY}
                                    style={styles.closeButton}
                                    onPress={handleClose}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <TextLabel text="✕" style={styles.closeIcon} />
                                </TouchableOpacity>

                                <View style={styles.iconWrapper}>
                                    <Image source={IMAGES.EMAIL} style={styles.icon} />
                                </View>

                                <TextLabel
                                    text="Forgot Password?"
                                    style={[TEXT_STYLE.smallTitleSemiBold, styles.title]}
                                />
                                <TextLabel
                                    text="Enter the email address linked to your account and we'll send you a link to reset your password."
                                    style={[TEXT_STYLE.text, styles.subtitle]}
                                />

                                <InputField
                                    ref={emailInputRef}
                                    placeHolder="Email"
                                    containerStyle={styles.emailField}
                                    inputFieldStyle={styles.fieldText}
                                    keyBoardType="email-address"
                                    autoComplete="email"
                                    returnKeyType="done"
                                    source={IMAGES.EMAIL}
                                    value={email}
                                    onChangeText={setEmail}
                                    onSubEdit={handleSubmit}
                                />

                                <CustomButton
                                    title={loading ? '' : 'Send Reset Link'}
                                    buttonWrapper={styles.submitButton}
                                    onPress={handleSubmit}
                                    disabled={loading || !email.trim()}
                                    leftIcon={
                                        loading ? (
                                            <ActivityIndicator color={COLORS.white} />
                                        ) : undefined
                                    }
                                />

                                <TouchableOpacity activeOpacity={ACTIVE_OPACITY} onPress={handleClose} style={styles.backRow}>
                                    <TextLabel text="Back to Login" style={styles.backText} />
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default ForgotPasswordModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'flex-end',
    },
    avoidingView: {
        width: '100%',
    },
    card: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: hp('1.5%'),
        alignItems: 'center',
        elevation: 20,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: -6 },
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E4E4E7',
        alignSelf: 'center',
        marginBottom: hp('2%'),
    },
    closeButton: {
        position: 'absolute',
        top: hp('1.8%'),
        right: 16,
        height: 30,
        width: 30,
        borderRadius: 15,
        backgroundColor: '#F4F4F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        fontSize: 14,
        color: COLORS.black,
    },
    iconWrapper: {
        height: 64,
        width: 64,
        borderRadius: 32,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp('1.5%'),
    },
    icon: {
        height: 28,
        width: 28,
        resizeMode: 'contain',
    },
    title: {
        textAlign: 'center',
    },
    subtitle: {
        marginTop: hp('1%'),
        textAlign: 'center',
        color: COLORS.grey3,
        paddingHorizontal: 8,
    },
    emailField: {
        width: '100%',
        marginTop: hp('3%'),
    },
    fieldText: {
        fontSize: 13,
        height: hp('5.5%'),
    },
    submitButton: {
        width: '100%',
        marginTop: hp('2.5%'),
    },
    backRow: {
        marginTop: hp('1.5%'),
        paddingVertical: hp('1%'),
    },
    backText: {
        fontSize: 13,
        fontFamily: FONT.medium,
        color: COLORS.grey3,
    },
});