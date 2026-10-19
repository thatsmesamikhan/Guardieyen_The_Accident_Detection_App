import React from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { CustomButton, IconButton, TextLabel } from '../../../commons';
import { IMAGES } from '../../../assets/images';
import { COLORS, FONT, hp, wp } from '../../../enums/StyleGuide';


interface LogoutModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    disabled?: boolean,
    loading?: boolean,
    title: string,
    message: string,
    confirmLabel: string
}

const LogoutModal = ({ visible, onCancel, onConfirm, disabled = false, loading = false, title, message, confirmLabel }: LogoutModalProps) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />

                <View style={styles.card}>

                    <IconButton source={IMAGES.LOG_OUT} disabled containerStyle={styles.iconCircle} iconStyle={styles.icon} />

                    <TextLabel text={title} style={styles.title} />

                    <TextLabel
                        text={message}
                        style={styles.message}
                    />

                    <View style={styles.buttonRow}>
                        <Pressable style={styles.cancelButton} onPress={onCancel}>
                            <TextLabel text="Cancel" style={styles.cancelText} />
                        </Pressable>
                        <CustomButton
                            disabled={disabled}
                            onPress={onConfirm}
                            title={loading ? 'Please wait...' : confirmLabel}
                            buttonWrapper={{ width: '50%' }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default React.memo(LogoutModal);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp('6%'),
    },
    card: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: wp('5%'),
        paddingVertical: hp('3%'),
        paddingHorizontal: wp('6%'),
        alignItems: 'center',
    },
    iconCircle: {
        width: wp('16%'),
        height: wp('16%'),
        borderRadius: wp('8%'),
        backgroundColor: 'rgba(255,59,48,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp('2%'),
    },
    icon: {
        width: wp('6%'),
        height: wp('6%'),
        tintColor: COLORS.red,
    },
    title: {
        fontFamily: FONT.semiBold,
        fontSize: 18,
        color: COLORS.black,
        marginBottom: hp('1%'),
    },
    message: {
        fontFamily: FONT.regular,
        fontSize: 13.5,
        color: COLORS.grey2,
        textAlign: 'center',
        lineHeight: 19,
        marginBottom: hp('2%'),
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        borderRadius: wp('3%'),
        borderWidth: 1,
        borderColor: COLORS.grey2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp('3%'),
    },
    cancelText: {
        fontFamily: FONT.medium,
        fontSize: 14,
        color: COLORS.black,
    },
    logoutButtonWrapper: {
        flex: 1,
    },
    logoutButton: {
        height: hp('6%'),
        borderRadius: wp('3%'),
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        fontFamily: FONT.medium,
        fontSize: 14,
        color: COLORS.white,
    },
});