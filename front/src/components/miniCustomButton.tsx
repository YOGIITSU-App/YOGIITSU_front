import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
} from 'react-native';
import {colors} from '../constants';

interface miniCustomButtonProps extends PressableProps {
  label: string;
  inValid?: boolean;
  loading?: boolean;
}

const deviceWidth = Dimensions.get('screen').width;

const deviceHeight = Dimensions.get('screen').height;

function miniCustomButton({
  label,
  inValid = false,
  loading = false,
  ...props
}: miniCustomButtonProps) {
  return (
    <Pressable
      disabled={inValid || loading}
      style={({pressed}) => [
        styles.container,
        pressed ? styles.filledPressed : styles.filled,
        (inValid || loading) && styles.inValid,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.WHITE} />
      ) : (
        <Text style={[styles.text, styles.filledText]}>{label}</Text>
      )}
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
