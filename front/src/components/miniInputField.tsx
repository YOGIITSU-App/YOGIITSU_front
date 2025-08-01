import {useRef} from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import {colors} from '../constants';

interface miniInputFieldProps extends TextInputProps {
  disabled?: boolean;
  error?: string;
  touched?: boolean;
  focused?: boolean;
}

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

function miniInputField({
  disabled = false,
  error,
  touched,
  focused,
  ...props
}: miniInputFieldProps) {
  const innerRef = useRef<TextInput | null>(null);

  const handlePressInput = () => {
    innerRef.current?.focus();
  };

  return (
    <Pressable onPress={handlePressInput}>
      <View
        style={[
          styles.container,
          focused && styles.inputFocused, // 포커스 되었을 때 스타일 적용
          touched && Boolean(error) && styles.inputError,
        ]}>
        <TextInput
          ref={innerRef}
          editable={!disabled}
          placeholderTextColor={colors.GRAY_500}
          style={[styles.input, disabled && styles.disabled]}
          autoCapitalize="characters"
          spellCheck={false}
          autoCorrect={false}
          textContentType="oneTimeCode"
          autoComplete="off"
          importantForAutofill="no"
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
    width: deviceWidth * 0.605,
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

export default miniInputField;
