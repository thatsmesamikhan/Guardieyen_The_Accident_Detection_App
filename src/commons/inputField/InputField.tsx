import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
    Image,
    ImageSourcePropType,
    KeyboardType,
    Platform,
    ReturnKeyTypeOptions,
    StyleSheet,
    Text,
    TextInputSubmitEditingEvent,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { COLORS, FONT, hp, wp } from '../../enums/StyleGuide';
import { IMAGES } from '../../assets/images';

type IconSource = ImageSourcePropType | React.ReactElement;

interface Props {
    containerStyle?: ViewStyle;
    inputFieldStyle?: TextStyle;
    iconButtonStyle?: ViewStyle;
    placeHolder: string;
    hint?: string;
    label?: string;
    labelStyle?: TextStyle;
    required?: boolean;
    source?: IconSource;
    iconPress?: () => void;
    leftSource?: IconSource;
    leftIconPress?: () => void;
    keyBoardType?: KeyboardType;
    editable?: boolean;
    secureTextEntry?: boolean;
    onChangeText?: (text: string) => void;
    onBlur?: () => void;
    value?: string;
    error?: string;
    showError?: boolean;
    helperText?: string;
    multiLine?: boolean;
    numberOfLines?: number;
    autoFocus?: boolean;
    returnKeyType?: ReturnKeyTypeOptions;
    selectTextOnFocus?: boolean;
    maxLength?: number;
    onSubEdit?: (e: TextInputSubmitEditingEvent) => void;
    testID?: string;
    autoComplete?: 'email' | 'password' | 'name' | 'tel' | 'off' | 'username';
    disableAutoPasswordToggle?: boolean;
}

const InputField = forwardRef<any, Props>(
    (
        {
            containerStyle,
            inputFieldStyle,
            iconButtonStyle,
            placeHolder,
            hint,
            label,
            labelStyle,
            required = false,
            source,
            iconPress,
            leftSource,
            leftIconPress,
            keyBoardType,
            editable = true,
            secureTextEntry = false,
            onChangeText,
            onBlur,
            value,
            error,
            showError = false,
            helperText,
            multiLine = false,
            numberOfLines,
            autoFocus = false,
            returnKeyType,
            selectTextOnFocus,
            maxLength,
            onSubEdit,
            testID,
            autoComplete,
            disableAutoPasswordToggle = false,
        },
        ref,
    ) => {
        const [isFocused, setIsFocused] = useState(false);
        const [isPasswordVisible, setIsPasswordVisible] = useState(false);
        const showErrorVisuals = showError && !!error;
        const hasCustomRightIcon = !!source;
        const hasCustomLeftIcon = !!leftSource;
        const showPasswordToggle =
            secureTextEntry && !hasCustomRightIcon && !disableAutoPasswordToggle;

        // This field may be used uncontrolled (no value/onChangeText from the
        // parent), as is the case for the Password / Confirm Password fields.
        // We still need to remount the native input below to reliably
        // re-apply Android's secure-text masking, so we keep an internal
        // fallback copy of whatever was typed to survive that remount.
        const isControlled = value !== undefined;
        const [internalValue, setInternalValue] = useState('');
        const displayValue = isControlled ? value : internalValue;

        const handleChangeText = (text: string) => {
            if (!isControlled) {
                setInternalValue(text);
            }
            onChangeText?.(text);
        };

        // Android sometimes fails to re-apply password masking on an
        // already-mounted TextInput when `secureTextEntry` flips back to
        // true. Remounting just this field's input (via `key`) fixes it
        // reliably. The key is derived purely from this instance's own
        // state, so it can never affect any other InputField on screen.
        const inputKey = secureTextEntry
            ? (isPasswordVisible ? 'text-visible' : 'text-hidden')
            : undefined;

        const inputRef = useRef<any>(null);
        const hasMountedRef = useRef(false);

        useEffect(() => {
            if (!hasMountedRef.current) {
                hasMountedRef.current = true;
                return;
            }
            // Re-focus after the remount so the keyboard stays open and the
            // user can keep typing right where they left off.
            if (secureTextEntry) {
                inputRef.current?.focus?.();
            }
        }, [isPasswordVisible, secureTextEntry]);

        const setRefs = (node: any) => {
            inputRef.current = node;
            if (typeof ref === 'function') {
                ref(node);
            } else if (ref) {
                (ref as React.MutableRefObject<any>).current = node;
            }
        };

        const renderIcon = (
            iconSource: IconSource,
            onPress?: () => void,
            style?: ViewStyle,
        ) => (
            <PaperTextInput.Icon
                icon={() =>
                    React.isValidElement(iconSource) ? (
                        iconSource
                    ) : (
                        <Image
                            source={iconSource as ImageSourcePropType}
                            style={styles.iconStyle}
                            resizeMode="contain"
                        />
                    )
                }
                onPress={onPress}
                style={style}
                forceTextInputFocus={false}
            />
        );

        const renderPasswordToggle = () => (
            <PaperTextInput.Icon
                icon={() => (
                    <Image
                        source={isPasswordVisible ? IMAGES.EYE_WITH_LINE : IMAGES.EYE}
                        style={styles.iconStyle}
                        resizeMode="contain"
                    />
                )}
                color={COLORS.grey3}
                onPress={() => setIsPasswordVisible(prev => !prev)}
                forceTextInputFocus={false}
            />
        );

        return (
            <View style={[styles.wrapper, containerStyle]}>
                {label && (
                    <Text style={[styles.topLabelStyle, labelStyle]}>
                        {label}
                        {required && <Text style={{ color: COLORS.red }}> *</Text>}
                    </Text>
                )}

                <PaperTextInput
                    key={inputKey}
                    ref={setRefs}
                    testID={testID}
                    mode="outlined"
                    label={placeHolder}
                    placeholder={hint}
                    autoFocus={autoFocus}
                    returnKeyType={returnKeyType}
                    keyboardType={keyBoardType}
                    editable={editable}
                    value={displayValue}
                    multiline={multiLine}
                    numberOfLines={multiLine ? numberOfLines ?? 4 : 1}
                    onChangeText={handleChangeText}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    selectionColor={COLORS.black}
                    cursorColor={COLORS.black}
                    autoCorrect={false}
                    autoCapitalize={keyBoardType === 'email-address' ? 'none' : 'words'}
                    autoComplete={autoComplete}
                    textContentType={
                        secureTextEntry
                            ? 'password'
                            : keyBoardType === 'email-address'
                                ? 'emailAddress'
                                : undefined
                    }
                    selectTextOnFocus={selectTextOnFocus}
                    maxLength={maxLength}
                    onSubmitEditing={onSubEdit}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        setIsFocused(false);
                        onBlur?.();
                    }}
                    error={showErrorVisuals}
                    dense
                    style={[
                        styles.inputFieldStyle,
                        multiLine && styles.multilineFieldStyle,
                        !editable && styles.disabledFieldStyle,
                        inputFieldStyle,

                    ]}
                    outlineStyle={styles.outlineStyle}
                    contentStyle={styles.contentStyle}
                    textColor={editable ? COLORS.black : COLORS.grey3}
                    placeholderTextColor={COLORS.grey3}
                    outlineColor={isFocused ? COLORS.red : COLORS.grey2}
                    activeOutlineColor={COLORS.red}
                    theme={{
                        roundness: 10,
                        colors: {
                            error: COLORS.red,
                            onSurfaceVariant: isFocused ? COLORS.black : COLORS.grey3,
                            background: editable ? COLORS.white : '#F4F4F5',
                        },
                        fonts: {
                            bodyLarge: { fontFamily: FONT.medium },
                            bodyMedium: { fontFamily: FONT.medium },
                            labelLarge: { fontFamily: FONT.medium },
                        },
                    }}
                    left={
                        hasCustomLeftIcon
                            ? renderIcon(leftSource as IconSource, leftIconPress, iconButtonStyle)
                            : undefined
                    }
                    right={
                        showPasswordToggle
                            ? renderPasswordToggle()
                            : hasCustomRightIcon
                                ? renderIcon(source as IconSource, iconPress, iconButtonStyle)
                                : undefined
                    }
                />

                {showErrorVisuals ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : helperText ? (
                    <Text style={styles.helperText}>{helperText}</Text>
                ) : null}
            </View>
        );
    },
);

InputField.displayName = 'InputField';

export default InputField;

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
    },
    inputFieldStyle: {
        width: '100%',
        height: hp('5.5%'),
        backgroundColor: COLORS.white,
        fontFamily: FONT.medium,
        fontSize: 15,
        paddingTop: Platform.OS === 'ios' ? hp('0.2%') : 0,
    },
    multilineFieldStyle: {
        minHeight: hp('12%'),
        textAlignVertical: 'top',
    },
    disabledFieldStyle: {
        backgroundColor: '#F4F4F5',
    },
    outlineStyle: {
        borderRadius: 10,
        borderWidth: 1,
    },
    contentStyle: {
        fontFamily: FONT.medium,
        color: COLORS.black,
    },
    iconStyle: {
        height: 18,
        width: 18,
    },
    errorText: {
        color: COLORS.red,
        fontSize: 12,
        marginTop: hp('0.5%'),
        alignSelf: 'flex-end',
        fontFamily: FONT.semiBold,
    },
    helperText: {
        color: COLORS.grey3,
        fontSize: 12,
        marginTop: hp('0.5%'),
        fontFamily: FONT.regular,
    },
    topLabelStyle: {
        marginTop: hp('2%'),
        fontSize: 14,
        color: COLORS.black,
        fontFamily: FONT.semiBold,
        letterSpacing: 0.2,
    },
});