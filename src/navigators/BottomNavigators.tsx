import React, { useEffect, useMemo } from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SCREENS } from '../enums';
import * as ui from '../screens';
import { IMAGES } from '../assets/images';
import { COLORS, FONT, hp, WIDTH } from '../enums/StyleGuide';

const Tab = createBottomTabNavigator();

const BAR_HORIZONTAL_MARGIN = 16;
const BAR_WIDTH = WIDTH - BAR_HORIZONTAL_MARGIN * 2;
const INDICATOR_SIZE = 32;

const tabIcons: Record<string, any> = {
    [SCREENS.HOME_SCREEN]: IMAGES.HOME,
    [SCREENS.CONTACTS_SCREEN]: IMAGES.CONTACTS,
    [SCREENS.HISTORY_SCREEN]: IMAGES.HISTORY,
    [SCREENS.PROFILE_SCREEN]: IMAGES.USER,
};

const tabLabels: Record<string, string> = {
    [SCREENS.HOME_SCREEN]: 'Home',
    [SCREENS.CONTACTS_SCREEN]: 'Contacts',
    [SCREENS.HISTORY_SCREEN]: 'History',
    [SCREENS.PROFILE_SCREEN]: 'Profile',
};

interface TabButtonProps {
    focused: boolean;
    onPress: () => void;
    icon: any;
    label: string;
    width: number;
}

const TabButton = React.memo(({ focused, onPress, icon, label, width }: TabButtonProps) => {
    const progress = useSharedValue(focused ? 1 : 0);
    const pressScale = useSharedValue(1);

    useEffect(() => {
        progress.value = withSpring(focused ? 1 : 0, { damping: 16, stiffness: 200, mass: 0.6 });
    }, [focused, progress]);

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: -progress.value * 2 }, { scale: pressScale.value }],
        tintColor: interpolateColor(progress.value, [0, 1], [COLORS.grey3, COLORS.white]),
    }));

    const labelStyle = useAnimatedStyle(() => ({
        color: interpolateColor(progress.value, [0, 1], [COLORS.grey3, COLORS.red]),
    }));

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => {
                pressScale.value = withTiming(0.9, { duration: 80 });
            }}
            onPressOut={() => {
                pressScale.value = withTiming(1, { duration: 120 });
            }}
            android_ripple={{ borderless: true, color: 'rgba(220,38,38,0.1)' }}
            style={[styles.tabButton, { width }]}
        >
            <Animated.Image source={icon} resizeMode="contain" style={[styles.tabIcon, iconStyle]} />
            <Animated.Text
                allowFontScaling={false}
                style={[styles.tabLabel, labelStyle]}
                numberOfLines={1}
            >
                {label}
            </Animated.Text>
        </Pressable>
    );
});

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();
    const bottomOffset = insets.bottom > 0 ? insets.bottom + 8 : 16;
    const tabWidth = BAR_WIDTH / state.routes.length;

    const indicatorTarget = useMemo(
        () => (index: number) => index * tabWidth + (tabWidth - INDICATOR_SIZE) / 2,
        [tabWidth],
    );

    const indicatorX = useSharedValue(indicatorTarget(state.index));

    useEffect(() => {
        indicatorX.value = withSpring(indicatorTarget(state.index), {
            damping: 18,
            stiffness: 220,
            mass: 0.7,
        });
    }, [state.index, indicatorTarget, indicatorX]);

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorX.value }],
    }));

    return (
        <View style={[styles.tabBarStyle, { bottom: bottomOffset, width: BAR_WIDTH }]}>
            <Animated.View style={[styles.indicator, indicatorStyle]}>
                <LinearGradient
                    colors={['#FF3B30', '#B71C1C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.indicatorGradient}
                />
            </Animated.View>

            {state.routes.map((route, index) => {
                const focused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });
                    if (!focused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TabButton
                        key={route.key}
                        focused={focused}
                        onPress={onPress}
                        icon={tabIcons[route.name]}
                        label={
                            (descriptors[route.key].options.tabBarLabel as string) ??
                            tabLabels[route.name]
                        }
                        width={tabWidth}
                    />
                );
            })}
        </View>
    );
};

const BottomNavigators = () => {
    return (
        <Tab.Navigator
            screenOptions={{ headerShown: false }}
            tabBar={props => <CustomTabBar {...props} />}
        >
            <Tab.Screen options={{ tabBarLabel: 'Home' }} name={SCREENS.HOME_SCREEN} component={ui.HomeScreen} />
            <Tab.Screen options={{ tabBarLabel: 'Contacts' }} name={SCREENS.CONTACTS_SCREEN} component={ui.ContactsScreen} />
            <Tab.Screen options={{ tabBarLabel: 'History' }} name={SCREENS.HISTORY_SCREEN} component={ui.HistoryScreen} />
            <Tab.Screen options={{ tabBarLabel: 'Profile' }} name={SCREENS.PROFILE_SCREEN} component={ui.ProfileScreen} />
        </Tab.Navigator>
    );
};

export default BottomNavigators;

const styles = StyleSheet.create({
    tabBarStyle: {
        position: 'absolute',
        left: BAR_HORIZONTAL_MARGIN,
        flexDirection: 'row',
        height: hp('8%'),
        borderRadius: 24,
        backgroundColor: COLORS.white,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    indicator: {
        position: 'absolute',
        top: 11,
        left: 0,
        width: INDICATOR_SIZE,
        height: INDICATOR_SIZE,
        borderRadius: INDICATOR_SIZE / 2,
        overflow: 'hidden',
        shadowColor: '#B71C1C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    indicatorGradient: {
        flex: 1,
    },
    tabButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 11,
    },
    tabIcon: {
        width: 22,
        height: 22,
    },
    tabLabel: {
        marginTop: 5,
        fontSize: 11,
        fontFamily: FONT.medium,
    },
});