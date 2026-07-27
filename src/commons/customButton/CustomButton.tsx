import { AccessibilityRole, ActivityIndicator, GestureResponderEvent, Pressable, PressableProps, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import TextLabel from '../textLabel'
import { COLORS, FONT, hp } from '../../enums/StyleGuide'

export interface CustomButtonProps extends PressableProps {
    title: string;
    onPress?: (event: GestureResponderEvent) => void;
    buttonWrapper?: StyleProp<ViewStyle>;
    buttonStyle?: StyleProp<ViewStyle>;
    buttonTextStyle?: StyleProp<TextStyle>;
    colors?: string[];
    disabled?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: React.ReactNode;
    accessRole?: AccessibilityRole;
    accessLabel?: string;
    accessHint?: string;
    testID?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    buttonWrapper,
    buttonStyle,
    buttonTextStyle,
    onPress,
    colors = ['#FF3B30', '#B71C1C'],
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    accessRole = 'button',
    accessLabel,
    accessHint,
    testID,
    ...rest
}) => {
    return (
        <View style={[styles.buttonWrapper, buttonWrapper]}>
            <Pressable
                onPress={onPress}
                disabled={disabled || loading}
                accessibilityRole={accessRole}
                accessibilityLabel={accessLabel}
                accessibilityHint={accessHint}
                testID={testID}
                android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
                {...rest}
            >
                <LinearGradient
                    colors={colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        styles.button,
                        disabled && { opacity: 0.6 },
                        buttonStyle,
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : children ? (
                        children
                    ) : (
                        <>
                            {leftIcon}
                            <TextLabel
                                text={title}
                                style={StyleSheet.flatten([styles.buttonText, buttonTextStyle]) as TextStyle}
                            />
                            {rightIcon}
                        </>
                    )}
                </LinearGradient>
            </Pressable>
        </View>
    )
}

export default CustomButton

const styles = StyleSheet.create({
    buttonWrapper: {
        width: '100%',
    },
    button: {
        width: '100%',
        height: hp('5.5%'),
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap : '2%'
    },
    buttonText: {
        fontSize: 16,
        fontFamily: FONT.semiBold,
        color: COLORS.white,
        letterSpacing: 0.4,
    },
})