import React from 'react';
import { ImageSourcePropType, StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT, hp } from '../../../enums/StyleGuide';
import { IconButton, TextLabel } from '../../../commons';

interface Contact {
    title: string;
    relation: string;
    image: ImageSourcePropType;
}

interface Props {
    item: Contact;
    onPress?: () => void;
}

const ContactCard = ({ item, onPress }: Props) => {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={styles.container}>
            <View style={styles.leftContainer}>
                <View style={styles.avatarContainer}>
                    <IconButton
                        disabled
                        source={item.image}
                        containerStyle={styles.avatarButton}
                        iconStyle={styles.avatar}
                    />
                </View>

                <View style={styles.infoContainer}>
                    <TextLabel
                        text={item.title}
                        style={styles.title}
                        numberOfLines={1}
                    />

                    <TextLabel
                        text={item.relation}
                        style={styles.subtitle}
                        numberOfLines={1}
                    />
                </View>
            </View>

            <View style={styles.rightContainer}>
                <View style={styles.badge}>
                    <View style={styles.badgeDot} />
                    <TextLabel text="Connected" style={styles.badgeText} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default ContactCard;

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: 22,
        marginTop: hp('1%'),
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        elevation: 3,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F8F8F8',
    },
    avatar: {
        width: 56,
        height: 56,
        tintColor: COLORS.grey2,
    },
    infoContainer: {
        marginLeft: 14,
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontFamily: FONT.semiBold,
        color: '#111827',
    },
    subtitle: {
        marginTop: 4,
        fontSize: 13,
        color: '#6B7280',
    },
    rightContainer: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginLeft: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',

        backgroundColor: '#ECFDF3',

        paddingHorizontal: 10,
        height: 28,
        borderRadius: 20,
    },
    badgeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22C55E',
        marginRight: 6,
    },
    badgeText: {
        fontSize: 12,
        fontFamily: FONT.medium,
        color: '#16A34A',
    },
    arrow: {
        width: 18,
        height: 18,
        tintColor: '#9CA3AF',
        marginTop: 10,
    },
});