import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {colors} from '../constants';

interface miniCustomButton_WProps {
  label: string;
  inValid?: boolean;
}

function miniCustomButton_W({label, inValid = false}: miniCustomButton_WProps) {
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
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.GRAY_300,
  },
  filled: {
    backgroundColor: colors.BLUE_700,
  },
  filledPressed: {
    backgroundColor: colors.BLUE_500,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  filledText: {
    color: colors.GRAY_500,
  },
});

export default miniCustomButton_W;
