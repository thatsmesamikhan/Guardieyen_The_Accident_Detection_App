import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SCREENS } from '../enums';
import * as ui from '../screens'

const RootNavigators = () => {
    const Stack = createNativeStackNavigator();
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name={SCREENS.SPLASH_SCREEN} component={ui.SplashScreen} />
                <Stack.Screen name={SCREENS.ON_BOARDING_SCREENS} component={ui.OnBoardingScreens} />
                <Stack.Screen name={SCREENS.LOGIN_SCREEN} component={ui.LoginScreen} />
                <Stack.Screen name={SCREENS.REGISTER_SCREEN} component={ui.RegisterScreen} />
                <Stack.Screen name={SCREENS.HOME_SCREEN} component={ui.HomeScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default RootNavigators