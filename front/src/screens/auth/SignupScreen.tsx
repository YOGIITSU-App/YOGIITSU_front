import React from 'react';
import {
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
} from '../../utils';
import InputField from '../../components/inputField';
import MiniCustomButton from '../../components/miniCustomButton';
import MiniCustomButton_W from '../../components/miniCustomButton_W';
import {SafeAreaView} from 'react-native-safe-area-context';

function SignupScreen({inValid = false}) {
  const signup = useForm({
    initialValue: {
      id: '',
      password: '',
      username: '',
      email: '',
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
      <KeyboardAvoidingView behavior="padding">
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
            <View style={styles.nameContainer}>
              <InputField
                placeholder="이름"
                inputMode="text"
                {...signup.getTextInputProps('username')}
              />
            </View>
            <View style={styles.smallInputContainer}>
              <TextInput
                style={styles.smallInput}
                placeholder="이메일"
                placeholderTextColor={colors.GRAY_500}
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                autoCorrect={false}
                {...emailcheak.getTextInputProps('email')}
              />
              <MiniCustomButton
                label="인증"
                inValid={!emailcheak.isFormValid}
              />
            </View>
            <View style={styles.smallInputContainer}>
              <TextInput
                style={styles.smallInput}
                placeholder="인증번호"
                placeholderTextColor={colors.GRAY_500}
                inputMode="numeric"
                autoCapitalize="none"
                spellCheck={false}
                autoCorrect={false}
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
            <Text style={styles.emailText}>*아이디 찾기에 사용됩니다.</Text>

            <View style={styles.smallInputContainer}>
              <TextInput
                style={styles.smallInput}
                placeholder="아이디"
                placeholderTextColor={colors.GRAY_500}
                inputMode="text"
                autoCapitalize="none"
                spellCheck={false}
                autoCorrect={false}
                {...idcheak.getTextInputProps('id')}
              />
              <MiniCustomButton label="확인" inValid={!idcheak.isFormValid} />
            </View>

            <View style={styles.smallInputContainer}>
              <TextInput
                style={styles.smallInput}
                placeholder="비밀번호"
                placeholderTextColor={colors.GRAY_500}
                inputMode="text"
                autoCapitalize="none"
                spellCheck={false}
                autoCorrect={false}
                {...pwcheak.getTextInputProps('password')}
              />
              <MiniCustomButton label="확인" inValid={!pwcheak.isFormValid} />
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
    flex: 1,
    // alignItems: 'flex-end',
    marginTop: 15,
    marginLeft: 25,
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
    flex: 3, // 입력 필드 영역 확장
    justifyContent: 'flex-start', // 위쪽 정렬
    paddingTop: 20, // 위쪽 여백 조정
    paddingHorizontal: 20, // 좌우 여백 조정
    alignItems: 'center',
  },
  nameContainer: {
    marginBottom: '10%', // 이름 입력 필드와 이메일 입력 필드 간격
  },
  smallInputContainer: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between', // 이메일 입력칸과 버튼의 간격 유지
    alignItems: 'center',
    marginBottom: 15, // 이메일 입력 필드와 다음 요소 간격,
  },
  smallInput: {
    flex: 1, // 입력 필드가 버튼보다 넓게 차지하도록 설정
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.GRAY_100,
    paddingHorizontal: 10,
    marginRight: 10, // 버튼과의 간격
    fontSize: 14,
    fontWeight: '700',
  },
  emailText: {
    alignSelf: 'flex-end',
    marginRight: 20,
    fontSize: 12,
    color: colors.GRAY_500,
    marginBottom: '20%',
  },
  idContainer: {
    flex: 1, // 입력 필드 영역 확장
    justifyContent: 'flex-start', // 위쪽 정렬
    paddingHorizontal: 20, // 좌우 여백 조정
    alignItems: 'center',
  },
  PwContainer: {
    flex: 2, // 입력 필드 영역 확장
    justifyContent: 'flex-start', // 위쪽 정렬
    paddingHorizontal: 20, // 좌우 여백 조정
    alignItems: 'center',
  },
});

export default SignupScreen;
