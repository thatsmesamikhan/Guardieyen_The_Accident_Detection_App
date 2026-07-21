import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { COLORS, FONT } from '../../enums/StyleGuide';

interface Props extends TextProps {
    text?: string;
    style?: TextStyle | TextStyle[];
    children?: React.ReactNode;
}

const TextLabel = ({
    text,
    children,
    style,
    ...rest
}: Props) => {
    return (
        <Text
            maxFontSizeMultiplier={1.3}
            style={[styles.text, style]}
            {...rest}
        >
            {text ?? children}
        </Text>
    );
};

export default React.memo(TextLabel);

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        fontFamily: FONT.regular,
        color: COLORS.black,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
});