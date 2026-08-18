import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller';
import { hp } from '../../enums/StyleGuide';

interface KeyboardAwareProps extends KeyboardAwareScrollViewProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
}

const KeyboardAware = ({
    children,
    style,
    contentContainerStyle,
    ...props
}: KeyboardAwareProps) => {
    return (
        <KeyboardAwareScrollView
            style={[styles.scroll, style]}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bottomOffset={20}
            {...props}
        >
            {children}
        </KeyboardAwareScrollView>
    );
};

export default KeyboardAware;

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: hp('15%'),
    },
});