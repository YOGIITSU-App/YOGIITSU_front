import React from 'react';
import {
  Dimensions,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
} from 'react-native';
import {colors} from '../constants';

interface miniCustomButton_WProps extends PressableProps {
  label: string;
  inValid?: boolean;
}

const deviceWidth = Dimensions.get('screen').width;

const deviceHeight = Dimensions.get('screen').height;

function miniCustomButton_W({
  label,
  inValid = false,
  ...props
}: miniCustomButton_WProps) {
  return (
    <Pressable
      disabled={inValid}
      {...props}
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
    width: deviceWidth * 0.202,
    height: deviceHeight * 0.06,
    backgroundColor: colors.GRAY_300,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inValid: {
    backgroundColor: colors.GRAY_300,
    borderWidth: 1,
    borderColor: colors.WHITE,
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

export default miniCustomButton_W;
