import React from 'react';
import { ImageSourcePropType, StyleProp, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ACTIVE_OPACITY, COLORS, FONT, hp } from '../../../enums/StyleGuide';
import { IconButton, TextLabel } from '../../../commons';

interface Contact {
    title: string;
    relation: string;
    image: ImageSourcePropType;
}

interface Props {
    item: Contact;
    onPress?: () => void;
    container?: StyleProp<ViewStyle>
    subTitleStyle?: StyleProp<TextStyle>
}

const ContactCard = ({ item, onPress, container, subTitleStyle }: Props) => {
    return (
        <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            onPress={onPress}
            style={[styles.container, container]}>
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
                        style={[styles.subtitle, subTitleStyle]}
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

export default React.memo(ContactCard);

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.black,
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
        elevation: 5,
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
        borderColor: COLORS.red,
        borderWidth: 2
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
        color: COLORS.red,
    },
    subtitle: {
        marginTop: 4,
        fontSize: 13,
        color: COLORS.white,
    },
    rightContainer: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginLeft: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.green,
        paddingHorizontal: 10,
        height: 28,
        borderRadius: 20,
    },
    badgeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ECFDF3',
        marginRight: 6,
    },
    badgeText: {
        fontSize: 12,
        fontFamily: FONT.medium,
        color: '#ECFDF3',
    },
    arrow: {
        width: 18,
        height: 18,
        tintColor: '#9CA3AF',
        marginTop: 10,
    },
});