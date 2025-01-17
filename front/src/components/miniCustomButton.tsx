import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {colors} from '../constants';

interface miniCustomButtonProps {
  label: string;
  inValid?: boolean;
  onPress: () => void;
}

function miniCustomButton({label, inValid = false}: miniCustomButtonProps) {
  return (
    <Pressable
      disabled={inValid}
      style={({pressed}) => [
        styles.container,
        pressed ? styles.filledPressed : styles.filled,
        inValid && styles.inValid,
      ]}>
      <Text style={[styles.text, styles.filledText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 50,
    backgroundColor: colors.GRAY_300,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inValid: {
    backgroundColor: colors.GRAY_700,
  },
  filled: {
    backgroundColor: colors.BLUE_700,
  },
  filledPressed: {
    backgroundColor: colors.BLUE_500,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
  },
  filledText: {
    color: colors.WHITE,
  },
});

export default miniCustomButton;
