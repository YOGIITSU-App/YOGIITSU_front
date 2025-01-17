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
}

const deviceWidth = Dimensions.get('screen').width;

const deviceHeight = Dimensions.get('screen').height;

function inputField({
  disabled = false,
  error,
  touched,
  inValid = false,
  ...props
}: inputFieldProps) {
  const innerRef = useRef<TextInput | null>(null);

  const handlePressInput = () => {
    innerRef.current?.focus();
  };

  return (
    <Pressable onPress={handlePressInput}>
      <View style={[styles.container, disabled && styles.disabled]}>
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
    borderWidth: 0,
    borderRadius: 5,
    backgroundColor: colors.GRAY_100,
    padding: deviceHeight > 700 ? 14 : 10,
    width: deviceWidth * 0.8,
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
});

export default inputField;
