import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { BOTTOM_TAB, SCREENS } from '../enums';
import * as ui from '../screens'
import BottomNavigators from './BottomNavigators';

const RootNavigators = () => {
    const Stack = createNativeStackNavigator();
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name={SCREENS.SPLASH_SCREEN} component={ui.SplashScreen} />
                <Stack.Screen name={SCREENS.ON_BOARDING_SCREENS} component={ui.OnBoardingScreens} />
                <Stack.Screen name={SCREENS.LOGIN_SCREEN} component={ui.LoginScreen} />
                <Stack.Screen name={SCREENS.PROFILE_SCREEN} component={ui.ProfileScreen} />
                <Stack.Screen name={SCREENS.CHANGE_PASSWORD_SCREEN} component={ui.ChangePasswordScreen} />
                <Stack.Screen name={SCREENS.MEDICAL_INFO_SCREEN} component={ui.MedicalInfoScreen} />
                <Stack.Screen name={SCREENS.PRIVACY_POLICY_SCREEN} component={ui.PrivacyPolicyScreen} />
                <Stack.Screen name={SCREENS.TERMS_AND_CONDITIONS_SCREEN} component={ui.TermsAndConditionsScreen} />
                <Stack.Screen name={SCREENS.DANGER_ZONE_SCREEN} component={ui.DangerZoneScreen} />
                <Stack.Screen name={SCREENS.REGISTER_SCREEN} component={ui.RegisterScreen} />
                <Stack.Screen name={SCREENS.ADD_CONTACT_SCREEN} component={ui.AddContactScreen} />
                <Stack.Screen name={BOTTOM_TAB.BOTTOM_NAVIGATOR} component={BottomNavigators} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default RootNavigators