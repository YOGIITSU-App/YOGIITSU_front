import React, {useContext} from 'react';

import {
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
import {RootStackParamList} from '../../navigations/root/Rootnavigator';
import Yogiitsu from '../../assets/Yogiitsu.svg';
import {useUser} from '../../contexts/UserContext'; // ✅ 유저 컨텍스트 추가
import {Alert} from 'react-native'; // ✅ 알림창 위해 추가

type AuthHomeScreenProps = StackScreenProps<
  AuthStackParamList & RootStackParamList,
  typeof authNavigations.AUTH_HOME
>;

function AuthHomeScreen({navigation}: AuthHomeScreenProps) {
  const {login} = useUser(); // ✅ UserContext의 login 함수 가져오기

  const loginForm = useForm({
    initialValue: {
      id: '',
      password: '',
    },
    validate: validateLogin,
  });

  const handleLogin = () => {
    const {id, password} = loginForm.values;

    if (id === 'test123' && password === 'yogi1234@@') {
      login({
        // 더미 테스트 유저 정보
        id: 'test123',
        username: '김테스트',
        email: 'test@dev.com',
      });
    } else {
      Alert.alert('로그인 실패', '아이디 또는 비밀번호가 올바르지 않아요!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior="height">
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          <View style={styles.imageContainer}>
            <Yogiitsu />
          </View>
          <View style={styles.inputContainer}>
            <InputField
              placeholder="아이디 입력"
              inputMode="text"
              keyboardType="ascii-capable"
              {...loginForm.getTextInputProps('id')}
            />
            <InputField
              placeholder="비밀번호 입력"
              inputMode="text"
              secureTextEntry
              {...loginForm.getTextInputProps('password')}
            />
          </View>
          <View>
            <CustomBotton
              label="로그인"
              variant="filled"
              size="large"
              inValid={!loginForm.isFormValid} // 폼이 유효하지 않으면 버튼 비활성화
              onPress={handleLogin}
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
                onPress={() => navigation.navigate('FindPwCodeConfirm')}>
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
    alignContent: 'center',
    justifyContent: 'center',
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
