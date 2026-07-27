import React, { useEffect } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { COLORS } from '../../../enums/StyleGuide';

interface SwitchButtonProps {
    isSwitchOn?: boolean;
    onPress?: () => void;
    activeColor?: string;
    inactiveColor?: string;
    thumbColor?: string;
    duration?: number;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}

const SWITCH_WIDTH = 50;
const SWITCH_HEIGHT = 28;
const PADDING = 3;
const THUMB_SIZE = 22;
const MAX_TRANSLATE = SWITCH_WIDTH - THUMB_SIZE - PADDING * 2;

const SwitchButton = ({
    isSwitchOn,
    onPress,
    activeColor = COLORS.red,
    inactiveColor = COLORS.grey,
    thumbColor = COLORS.white,
    duration = 220,
    disabled = false,
    style,
}: SwitchButtonProps) => {
    const progress = useSharedValue(isSwitchOn ? 1 : 0);

    useEffect(() => {
        progress.value = withTiming(isSwitchOn ? 1 : 0, {
            duration,
        });
    }, [isSwitchOn]);

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: isSwitchOn
                ? activeColor
                : inactiveColor,
        };
    });

    const animatedThumbStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: interpolate(
                        progress.value,
                        [0, 1],
                        [0, MAX_TRANSLATE],
                    ),
                },
                {
                    scale: interpolate(
                        progress.value,
                        [0, 1],
                        [1, 1.05],
                    ),
                },
            ],
        };
    });

    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={style}
            android_ripple={{
                color: 'transparent',
            }}
        >
            <Animated.View style={[styles.container, animatedContainerStyle]}>
                <Animated.View style={[
                    styles.thumb,
                    {
                        backgroundColor: thumbColor,
                    },
                    animatedThumbStyle,
                ]}
                />
            </Animated.View>
        </Pressable>
    );
};

export default SwitchButton;

const styles = StyleSheet.create({
    container: {
        width: SWITCH_WIDTH,
        height: SWITCH_HEIGHT,
        borderRadius: SWITCH_HEIGHT / 2,
        padding: PADDING,
        justifyContent: 'center',
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
});