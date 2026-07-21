import { CommonActions, useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { wp } from '../../enums/StyleGuide';
import { SCREENS } from '../../enums';

const useSplashModalView = () => {
    const navigation = useNavigation<any>();
    const logoScale = useRef(new Animated.Value(0.6)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslateY = useRef(new Animated.Value(16)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const dividerWidth = useRef(new Animated.Value(0)).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;
    const subtitleTranslateY = useRef(new Animated.Value(10)).current;

    const glowScale = useRef(new Animated.Value(1)).current;
    const glowOpacity = useRef(new Animated.Value(0.35)).current;
    const ringScale = useRef(new Animated.Value(1)).current;
    const ringOpacity = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 6,
                    tension: 60,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 550,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: 450,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(titleTranslateY, {
                    toValue: 0,
                    duration: 450,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(dividerWidth, {
                toValue: wp('16%'),
                duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
            }),
            Animated.parallel([
                Animated.timing(subtitleOpacity, {
                    toValue: 1,
                    duration: 450,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(subtitleTranslateY, {
                    toValue: 0,
                    duration: 450,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(glowScale, {
                        toValue: 1.18,
                        duration: 1400,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowScale, {
                        toValue: 1,
                        duration: 1400,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(glowOpacity, {
                        toValue: 0.55,
                        duration: 1400,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowOpacity, {
                        toValue: 0.25,
                        duration: 1400,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ).start();

        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(ringScale, {
                        toValue: 1.35,
                        duration: 1800,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(ringScale, {
                        toValue: 1,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(ringOpacity, {
                        toValue: 0,
                        duration: 1800,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(ringOpacity, {
                        toValue: 0.6,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ).start();

        const timer = setTimeout(() => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: SCREENS.ON_BOARDING_SCREENS }],
                }),
            );
        }, 2400);

        return () => clearTimeout(timer);

    }, [navigation]);

    return {
        glowOpacity,
        glowScale,
        ringOpacity,
        ringScale,
        logoOpacity,
        logoScale,
        titleOpacity,
        titleTranslateY,
        dividerWidth,
        subtitleOpacity,
        subtitleTranslateY
    }
}

export default useSplashModalView