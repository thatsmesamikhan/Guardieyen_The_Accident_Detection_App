import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Image, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Animated, { Extrapolation, interpolate, interpolateColor, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { COLORS, FONT, hp, WIDTH, wp } from '../../enums/StyleGuide';
import { CustomButton, TextLabel } from '../../commons';
import { Slide, SLIDES } from '../../dummy/Dummies';
import { SCREENS } from '../../enums';

const ACTIVE_DOT_COLOR = COLORS.red;
const INACTIVE_DOT_COLOR = '#E7E1E1';

const IMAGE_FADE_DURATION = Platform.OS === 'android' ? 0 : undefined;

const OnboardingItem = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width: WIDTH }]}>
        <View style={styles.imageCard}>
            <Image
                resizeMode="stretch"
                source={item.image}
                style={styles.image}
                fadeDuration={IMAGE_FADE_DURATION}
            />
        </View>
        <TextLabel text={item.title} style={styles.title} />
        <TextLabel text={item.subtitle} style={styles.subtitle} />
    </View>
);

interface DotProps {
    index: number;
    scrollX: SharedValue<number>;
}

const Dot = ({ index, scrollX }: DotProps) => {
    const inputRange = [(index - 1) * WIDTH, index * WIDTH, (index + 1) * WIDTH];

    const animatedDotStyle = useAnimatedStyle(() => {
        const dotWidth = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);
        const backgroundColor = interpolateColor(
            scrollX.value,
            inputRange,
            [INACTIVE_DOT_COLOR, ACTIVE_DOT_COLOR, INACTIVE_DOT_COLOR],
        );
        return { width: dotWidth, backgroundColor };
    });

    return <Animated.View style={[styles.dot, animatedDotStyle]} />;
};

const OnBoardingScreens = () => {
    const navigation = useNavigation<any>();
    const flatListRef = useRef<FlatList<Slide>>(null);
    const scrollX = useSharedValue(0);
    const [activeIndex, setActiveIndex] = useState(0);

    const isLastSlide = activeIndex === SLIDES.length - 1;

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: event => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const handleMomentumScrollEnd = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / WIDTH);
            setActiveIndex(newIndex);
        },
        [],
    );

    const goToNextRoute = useCallback(() => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: SCREENS.LOGIN_SCREEN }],
            }),
        );
    }, [navigation]);

    const handleNext = useCallback(() => {
        if (isLastSlide) {
            goToNextRoute();
            return;
        }
        const nextIndex = activeIndex + 1;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        setActiveIndex(nextIndex);
    }, [activeIndex, goToNextRoute, isLastSlide]);

    const handleSkip = useCallback(() => {
        goToNextRoute();
    }, [goToNextRoute]);

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<Slide>) => <OnboardingItem item={item} />,
        [],
    );

    const keyExtractor = useCallback((item: Slide) => item.id, []);

    const getItemLayout = useCallback(
        (_: ArrayLike<Slide> | null | undefined, index: number) => ({
            length: WIDTH,
            offset: WIDTH * index,
            index,
        }),
        [],
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {!isLastSlide && (
                <TextLabel
                    selectable
                    onPress={handleSkip}
                    accessibilityRole='button'
                    accessibilityLabel='Skip onboarding'
                    text="Skip"
                    style={styles.skipText}
                />
            )}

            <Animated.FlatList
                ref={flatListRef}
                data={SLIDES}
                keyExtractor={keyExtractor}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                onScroll={scrollHandler}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                scrollEventThrottle={16}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                initialNumToRender={SLIDES.length}
                style={styles.flatList}
            />

            <View style={styles.dotsContainer}>
                {SLIDES.map((slide, index) => (
                    <Dot key={slide.id} index={index} scrollX={scrollX} />
                ))}
            </View>

            <CustomButton title={isLastSlide ? 'Get Started' : 'Next'} onPress={handleNext} buttonWrapper={styles.buttonWrapper} />
        </SafeAreaView>
    );
};

export default OnBoardingScreens;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    skipText: {
        fontSize: 14,
        fontFamily: FONT.medium,
        color: COLORS.grey3,
        position: 'absolute',
        top: hp('5%'),
        right: wp('5%'),
        zIndex: 10,
    },
    flatList: {
        flexGrow: 0,
        marginTop: hp('8%'),
    },
    slide: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    imageCard: {
        width: '100%',
        height: hp('32%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: COLORS.white,
    },
    image: {
        height: '100%',
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    title: {
        fontSize: 25,
        fontFamily: FONT.semiBold,
        color: COLORS.black,
        textAlign: 'center',
        marginTop: hp('5%'),
    },
    subtitle: {
        fontSize: 14,
        fontFamily: FONT.regular,
        color: COLORS.grey3,
        textAlign: 'center',
        marginTop: hp('1.5%'),
        lineHeight: 21,
        paddingHorizontal: wp('4%'),
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: hp('13.5%'),
        alignSelf: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    buttonWrapper: {
        position: 'absolute',
        bottom: hp('5%'),
        paddingHorizontal: 16
    },

});