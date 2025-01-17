import {useRef} from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import {colors} from '../constants';

interface miniInputField extends TextInputProps {
  disabled?: boolean;
}

function miniInputField({disabled = false, ...props}) {
  const innerRef = useRef<TextInput | null>(null);

  const handlePressInput = () => {
    innerRef.current?.focus();
  };

  return (
    <TextInput
      ref={innerRef}
      editable={!disabled}
      style={styles.emailInput}
      placeholderTextColor={colors.GRAY_500}
      autoCapitalize="none"
      spellCheck={false}
      autoCorrect={false}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  emailInput: {
    flex: 1, // 입력 필드가 버튼을 제외한 공간을 채움
    height: 50,
    marginRight: 10, // 버튼과의 간격
    backgroundColor: colors.GRAY_100,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
});

export default miniInputField;
