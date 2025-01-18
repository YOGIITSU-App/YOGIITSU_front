import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  PressableProps,
  Dimensions,
  View,
} from 'react-native';
import {colors} from '../constants/colors';

interface CustomBottonProps extends PressableProps {
  label: string;
  variant?: 'filled' | 'outlined';
  size?: 'large' | 'medium';
  inValid?: boolean;
}

const deviceWidth = Dimensions.get('screen').width;

const deviceHeight = Dimensions.get('screen').height;

function CustomBotton({
  label,
  variant = 'filled',
  size = 'large',
  inValid = false,
  ...props
}: CustomBottonProps) {
  return (
    <Pressable
      disabled={inValid}
      style={({pressed}) => [
        styles.container,
        pressed ? styles[`${variant}Pressed`] : styles[variant],
        inValid && styles.inValid,
      ]}
      {...props}>
      <View style={styles[size]}>
        <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    justifyContent: 'center',
    flexDirection: 'row',
    width: deviceWidth * 0.84,
    height: deviceHeight * 0.06,
  },
  inValid: {
    backgroundColor: colors.GRAY_700,
  },
  filled: {
    backgroundColor: colors.BLUE_700,
  },
  outlined: {
    borderColor: colors.BLUE_700,
    borderWidth: 1,
  },
  filledPressed: {
    backgroundColor: colors.BLUE_500,
  },
  outlinedPressed: {
    borderColor: colors.BLUE_700,
    borderWidth: 1,
    opacity: 0.5,
  },
  large: {
    width: '100%',
    // paddingVertical: deviceHeight > 700 ? 15 : 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  medium: {
    width: '50%',
    // paddingVertical: deviceHeight > 700 ? 12 : 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  filledText: {
    color: colors.WHITE,
  },
  outlinedText: {
    color: colors.BLUE_700,
  },
});

export default CustomBotton;
