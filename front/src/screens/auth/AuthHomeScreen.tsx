import React from 'react';

import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {authNavigations} from '../../constants';
import CustomBotton from '../../components/CustomButton';
import {StackScreenProps} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigations/stack/AuthStackNavigator';
import InputField from '../../components/inputField';
import useForm from '../../hooks/useForms';
import {validateLogin} from '../../utils';
import {colors} from '../../constants/colors';

type AuthHomeScreenProps = StackScreenProps<
  AuthStackParamList,
  typeof authNavigations.AUTH_HOME
>;

function AuthHomeScreen({navigation}: AuthHomeScreenProps) {
  const login = useForm({
    initialValue: {
      id: '',
      password: '',
    },
    validate: validateLogin,
  });

  const handleSubmit = () => {
    console.log('value', login.values);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior="height">
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          <View style={styles.imageContainer}>
            <Image
              resizeMode="contain"
              style={styles.image}
              source={require('../../assets/yogiitsu.png')}
            />
          </View>
          <View style={styles.inputContainer}>
            <InputField
              placeholder="아이디 입력"
              inputMode="text"
              keyboardType="ascii-capable"
              {...login.getTextInputProps('id')}
            />
            <InputField
              placeholder="비밀번호 입력"
              inputMode="text"
              secureTextEntry
              {...login.getTextInputProps('password')}
            />
          </View>
          <View>
            <CustomBotton
              label="로그인"
              variant="filled"
              size="large"
              inValid={!login.isFormValid} // 폼이 유효하지 않으면 버튼 비활성화
              onPress={handleSubmit}
            />
          </View>
          <View style={styles.buttonContainer}>
            <View style={styles.footerContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate(authNavigations.FINDID)}>
                <Text style={styles.footerText}>아이디찾기</Text>
              </TouchableOpacity>
              <Text style={styles.footerText}>|</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(authNavigations.FINDPW)}>
                <Text style={styles.footerText}>비밀번호찾기</Text>
              </TouchableOpacity>
              <Text style={styles.footerText}>|</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(authNavigations.SIGNUP)}>
                <Text style={styles.footerText}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 3,
    width: Dimensions.get('screen').width / 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  inputContainer: {
    flex: 1,
    gap: 15,
    marginBottom: -20,
  },
  buttonContainer: {
    flex: 2,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.GRAY_500,
    marginHorizontal: 5,
  },
});

export default AuthHomeScreen;
