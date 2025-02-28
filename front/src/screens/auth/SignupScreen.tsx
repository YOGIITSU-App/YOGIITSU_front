import React, {useMemo} from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {colors} from '../../constants';
import useForm from '../../hooks/useForms';
import {
  validateSignup,
  validateId,
  validatePw,
  validateEmail,
  validateCodeMessage,
  validatePwConfirm,
} from '../../utils';
import InputField from '../../components/inputField';
import MiniCustomButton from '../../components/miniCustomButton';
import MiniCustomButton_W from '../../components/miniCustomButton_W';
import {SafeAreaView} from 'react-native-safe-area-context';
import MiniInputField from '../../components/miniInputField';
import CustomText from '../../components/CustomText';

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
      codemessage: 0,
    },
    validate: validateSignup,
  });

  const emailcheak = useForm({
    initialValue: {
      email: '',
    },
    validate: validateEmail,
  });

  const codemessagecheck = useForm({
    initialValue: {
      codemessage: 0,
    },
    validate: validateCodeMessage,
  });

  const idcheak = useForm({
    initialValue: {
      id: '',
    },
    validate: validateId,
  });

  const pwcheak = useForm({
    initialValue: {
      password: '',
    },
    validate: validatePw,
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="height">
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="handled">
          <View style={styles.guideContainer}>
            <Text style={styles.guideText}>반가워요!</Text>
            <Text style={styles.guideText}>
              <Text style={styles.highlightedText}>요기있수</Text> 입니다
            </Text>
            <Text>가입을 위한 기본 정보를 작성해 주세요</Text>
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
                focused={emailcheak.focused.email}
                {...signup.getTextInputProps('email')}
                {...emailcheak.getTextInputProps('email')}
              />
              <MiniCustomButton
                label="인증"
                inValid={!emailcheak.isFormValid}
              />
            </View>
            <View style={styles.smallContainer}>
              <MiniInputField
                placeholder="인증번호"
                inputMode="text"
                focused={codemessagecheck.focused.codemessage}
                {...signup.getTextInputProps('codemessage')}
                {...codemessagecheck.getTextInputProps('codemessage')}
                onChangeText={text => {
                  // 6자리 이상 입력을 제한
                  if (text.length <= 6) {
                    codemessagecheck
                      .getTextInputProps('codemessage')
                      .onChangeText(text);
                  }
                }}
              />
              <MiniCustomButton_W
                label="확인"
                inValid={!codemessagecheck.isFormValid}
              />
            </View>
            <Text style={styles.emailText}>* 아이디 찾기에 사용됩니다.</Text>
            <View style={styles.smallContainer}>
              <MiniInputField
                placeholder="아이디"
                inputMode="text"
                keyboardType="ascii-capable"
                focused={idcheak.focused.id}
                {...signup.getTextInputProps('id')}
                {...idcheak.getTextInputProps('id')}
              />
              <MiniCustomButton label="확인" inValid={!idcheak.isFormValid} />
            </View>
            <View style={styles.pwBigInputfield}>
              <InputField
                placeholder="비밀번호"
                inputMode="text"
                secureTextEntry
                // focused={signup.focused.password}
                {...signup.getTextInputProps('password')}
                {...pwcheak.getTextInputProps('password')}
              />
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
        </ScrollView>
      </KeyboardAvoidingView>
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
  smallInputContainer: {
    borderRadius: 5,
    backgroundColor: colors.GRAY_100,
    padding: deviceHeight > 700 ? 14 : 10,
    width: deviceWidth * 0.605,
    height: deviceHeight * 0.06,
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
    marginBottom: '20%',
  },
  pwBigInputfield: {
    paddingTop: 30, // 위쪽 여백 조정
    gap: 20,
  },
  errorMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: deviceWidth * 0.04,
    marginBottom: '15%',
  },
});

export default SignupScreen;
