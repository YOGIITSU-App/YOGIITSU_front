import React from 'react';
import {Alert, Dimensions, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../constants';
import useForm from '../../hooks/useForms';
import {
  validateSignup,
  validateId,
  validatePw,
  validateEmail,
  validateCodeMessage,
} from '../../utils';
import InputField from '../../components/inputField';
import MiniCustomButton from '../../components/miniCustomButton';
import MiniCustomButton_W from '../../components/miniCustomButton_W';
import {SafeAreaView} from 'react-native-safe-area-context';
import MiniInputField from '../../components/miniInputField';
import CustomText from '../../components/CustomText';
import CustomBotton from '../../components/CustomButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import authApi from '../../api/authApi';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

function SignupScreen() {
  const signup = useForm({
    initialValue: {
      id: '',
      password: '',
      username: '',
      email: '',
      passwordConfirm: '',
      codemessage: '',
    },
    validate: validateSignup,
  });

  // 인증번호 전송
  const handleSendCode = async () => {
    try {
      await authApi.sendCode(signup.values.email);
      Alert.alert('전송 완료', '이메일로 인증번호가 전송되었어요 ✉️');
    } catch (error: any) {
      const msg = error.response?.data?.message ?? '인증번호 전송 실패 😢';
      Alert.alert('에러', msg);
    }
  };

  // 🔐 인증번호 확인
  const handleVerifyCode = async () => {
    try {
      await authApi.verifyCode(signup.values.email, signup.values.codemessage);
      Alert.alert('확인 완료', '이메일 인증이 완료되었어요 ✅');
    } catch (error: any) {
      const msg = error.response?.data?.message ?? '인증번호가 틀렸어요!';
      Alert.alert('오류', msg);
    }
  };

  // 🙌 최종 회원가입 요청
  const handleSignup = async () => {
    const {id, password, email, username} = signup.values;

    try {
      await authApi.signup(
        id,
        password,
        signup.values.email, // ✅ 수정
        username,
      );
      Alert.alert('가입 완료!', '이제 로그인 해주세요 😄');
    } catch (error: any) {
      const msg = error.response?.data?.message ?? '회원가입 실패 🥲';
      Alert.alert('오류', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={{flex: 1}}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={deviceHeight * 0.1275 + 20}
        keyboardOpeningTime={0}
        contentContainerStyle={{
          paddingBottom: 20,
          flexGrow: 1, // ✅ 스크롤 확보
        }}>
        <View style={styles.guideContainer}>
          <Text style={styles.guideText}>반가워요!</Text>
          <Text style={styles.guideText}>
            <Text style={styles.highlightedText}>요기있수</Text> 입니다
          </Text>
          <View style={styles.textHeight}>
            <Text>가입을 위한 기본 정보를 작성해 주세요</Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.bigInputfield}>
            <InputField
              placeholder="이름"
              inputMode="text"
              focused={signup.focused.username} // focused
              {...signup.getTextInputProps('username')}
            />
          </View>
          <View style={styles.smallContainer}>
            <MiniInputField
              placeholder="이메일"
              inputMode="email"
              focused={signup.focused.email}
              {...signup.getTextInputProps('email')}
            />
            <MiniCustomButton
              label="인증"
              inValid={!!signup.errors.email}
              onPress={handleSendCode}
            />
          </View>
          <View style={styles.smallContainer}>
            <MiniInputField
              placeholder="인증번호"
              inputMode="text"
              focused={signup.focused.codemessage}
              {...signup.getTextInputProps('codemessage')}
              onChangeText={text => {
                const upperText = text.toUpperCase();
                if (upperText.length <= 6) {
                  signup
                    .getTextInputProps('codemessage')
                    .onChangeText(upperText);
                }
              }}
            />
            <MiniCustomButton_W
              label="확인"
              inValid={!!signup.errors.codemessage}
              onPress={handleVerifyCode}
            />
          </View>
          <Text style={styles.emailText}>* 아이디 찾기에 사용됩니다.</Text>
          <View style={styles.smallContainer}>
            <MiniInputField
              placeholder="아이디"
              inputMode="text"
              keyboardType="ascii-capable"
              focused={signup.focused.id}
              {...signup.getTextInputProps('id')}
            />
            <MiniCustomButton label="확인" inValid={!!signup.errors.id} />
          </View>
          <View style={styles.pwContainer}>
            <View style={styles.pwBigInputfield}>
              <InputField
                placeholder="비밀번호"
                inputMode="text"
                secureTextEntry
                touched={signup.touched.password}
                error={signup.errors.password}
                // focused={signup.focused.password}
                {...signup.getTextInputProps('password')}
              />
            </View>
            <View style={styles.errorMessageContainer}>
              <CustomText
                text="영문, 숫자, 특수문자를 포함한 8자리 이상"
                touched={signup.touched.password}
                error={signup.errors.password}
              />
            </View>
            <View style={styles.pwBigInputfield}>
              <InputField
                placeholder="비밀번호 확인"
                inputMode="text"
                secureTextEntry
                touched={signup.touched.passwordConfirm}
                error={signup.errors.passwordConfirm}
                // focused={signup.focused.passwordConfirm}
                {...signup.getTextInputProps('passwordConfirm')}
              />
            </View>
            <View style={styles.errorMessageContainer}>
              <CustomText
                text="위의 비밀번호와 일치하지 않습니다."
                touched={signup.touched.passwordConfirm}
                error={signup.errors.passwordConfirm}
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.completeButton}>
        <CustomBotton
          label="가입하기"
          inValid={!signup.isFormValid}
          onPress={handleSignup}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
  },
  guideContainer: {
    // alignItems: 'flex-end',
    marginTop: 15,
    marginLeft: deviceWidth * 0.08,
    gap: 3,
    marginBottom: '5%',
  },
  guideText: {
    fontSize: 24,
    color: colors.BLACK_700,
    fontWeight: '700',
  },
  highlightedText: {
    color: colors.BLUE_700,
  },
  textHeight: {
    marginTop: 10,
  },
  infoContainer: {
    justifyContent: 'flex-start', // 위쪽 정렬
    paddingTop: 20, // 위쪽 여백 조정
    paddingHorizontal: 20, // 상하 여백 조정
    alignItems: 'center',
    marginBottom: 100,
  },
  bigInputfield: {
    marginBottom: '15%', // 이름 입력 필드와 이메일 입력 필드 간격
  },
  smallContainer: {
    width: deviceWidth * 0.84,
    flexDirection: 'row',
    justifyContent: 'space-between', // 이메일 입력칸과 버튼의 간격 유지
    alignItems: 'center',
    marginBottom: 15, // 이메일 입력 필드와 다음 요소 간격,
    gap: deviceWidth * 0.025,
  },
  smallInputText: {
    fontSize: 14,
    color: colors.BLACK,
    padding: 0,
    fontWeight: '700',
  },
  emailText: {
    alignSelf: 'flex-end',
    marginRight: deviceWidth * 0.03,
    fontSize: 12,
    color: colors.GRAY_500,
    marginBottom: '15%',
  },
  pwContainer: {
    marginTop: '8%',
  },
  pwBigInputfield: {
    paddingTop: 20, // 위쪽 여백 조정
    gap: 20,
  },
  errorMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: deviceWidth * 0.04,
    // marginBottom: '15%',
  },
  // completeButton: {
  //   position: 'absolute',
  //   bottom: 0,
  //   left: 0,
  //   right: 0,
  //   height: deviceHeight * 0.1275,
  //   paddingHorizontal: 20,
  //   paddingVertical: 15,
  //   backgroundColor: 'white',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   borderTopWidth: 1,
  //   borderColor: '#eee',
  // },
  completeButton: {
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignupScreen;
