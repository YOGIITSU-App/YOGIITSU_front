import React, {useRef, useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  TextInputProps,
  TextInput,
  Pressable,
} from 'react-native';

import {colors} from '../constants/colors';

interface inputFieldProps extends TextInputProps {
  disabled?: boolean;
  error?: string;
  touched?: boolean;
  inValid?: boolean;
  focused?: boolean;
}

const deviceWidth = Dimensions.get('screen').width;

const deviceHeight = Dimensions.get('screen').height;

function inputField({
  disabled = false,
  error,
  touched,
  inValid = false,
  focused,
  ...props
}: inputFieldProps) {
  const innerRef = useRef<TextInput | null>(null);

  const handlePressInput = () => {
    innerRef.current?.focus();
  };

  return (
    <Pressable onPress={handlePressInput}>
      <View
        style={[
          styles.container,
          disabled && styles.disabled,
          focused && styles.inputFocused, // 포커스 되었을 때 스타일 적용
          touched && Boolean(error) && styles.inputError,
        ]}>
        <TextInput
          ref={innerRef}
          editable={!disabled}
          placeholderTextColor={colors.GRAY_500}
          style={[styles.input, disabled && styles.disabled]}
          autoCapitalize="none"
          spellCheck={false}
          autoCorrect={false}
          {...props}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    backgroundColor: colors.GRAY_100,
    padding: deviceHeight > 700 ? 14 : 10,
    width: deviceWidth * 0.84,
    height: deviceHeight * 0.06,
  },
  input: {
    fontSize: 14,
    color: colors.BLACK,
    padding: 0,
    fontWeight: '700',
  },
  disabled: {
    backgroundColor: colors.GRAY_300,
    color: colors.GRAY_700,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.RED_300,
    backgroundColor: colors.RED_100,
  },
  inputFocused: {
    borderWidth: 1,
    borderColor: colors.BLUE_700,
    backgroundColor: colors.BLUE_100,
  },
});

export default inputField;
