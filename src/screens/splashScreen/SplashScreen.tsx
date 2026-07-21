import React from 'react';
import { Animated, Image, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { IMAGES } from '../../assets/images';
import { TextLabel } from '../../commons';
import useSplashModalView from './useSplashModalView';
import { styles } from './Styles';

const SplashScreen = () => {
    const {
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
    } = useSplashModalView()
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoWrapper}>
                    <Animated.View
                        style={[
                            styles.glow,
                            {
                                opacity: glowOpacity,
                                transform: [{ scale: glowScale }],
                            },
                        ]}
                    />

                    <Animated.View
                        style={[
                            styles.ring,
                            {
                                opacity: ringOpacity,
                                transform: [{ scale: ringScale }],
                            },
                        ]}
                    />

                    <Animated.View
                        style={{
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                        }}
                    >
                        <View style={styles.logoCircle}>
                            <Image
                                source={IMAGES.APP_ICON}
                                resizeMode="contain"
                                style={styles.logo}
                            />
                        </View>
                    </Animated.View>
                </View>

                <Animated.View
                    style={{
                        opacity: titleOpacity,
                        transform: [{ translateY: titleTranslateY }],
                    }}
                >
                    <TextLabel text='Guardieyen' style={styles.title} />
                </Animated.View>

                <Animated.View style={[styles.dividerTrack, { width: dividerWidth }]}>
                    <LinearGradient
                        colors={['#FF3B30', '#B71C1C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.divider}
                    />
                </Animated.View>


            </View>
            <Animated.View
                style={{
                    opacity: subtitleOpacity,
                    transform: [{ translateY: subtitleTranslateY }],
                    alignItems: 'center',
                }}
            >
                <TextLabel text={`AI-Based Real-Time Accident\nDetection and Alert System`} style={styles.subtitle} />

            </Animated.View>
        </View>
    );
};

export default SplashScreen;