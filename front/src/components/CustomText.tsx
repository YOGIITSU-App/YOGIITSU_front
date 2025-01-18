import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {colors} from '../constants';

const deviceWidth = Dimensions.get('screen').width;

interface CustomTextProps {
  text: string;
  error?: string;
  touched?: boolean;
}

function CustomText({text, error, touched}: CustomTextProps) {
  return (
    <View style={touched && error ? styles.errors : styles.noerror}>
      <Text style={styles.errorMessage}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  noerror: {
    display: 'none',
  },
  errors: {
    display: 'flex',
  },
  errorMessage: {
    fontSize: 12,
    color: colors.RED_300,
  },
});

export default CustomText;
