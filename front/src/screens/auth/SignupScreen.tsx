import React, {useState} from 'react';
import {Alert, Dimensions, Modal, StyleSheet, Text, View} from 'react-native';
import {authNavigations, colors} from '../../constants';
import useForm from '../../hooks/useForms';
import {validateSignup} from '../../utils';
import InputField from '../../components/inputField';
import MiniCustomButton from '../../components/miniCustomButton';
import MiniCustomButton_W from '../../components/miniCustomButton_W';
import {SafeAreaView} from 'react-native-safe-area-context';
import MiniInputField from '../../components/miniInputField';
import CustomText from '../../components/CustomText';
import CustomBotton from '../../components/CustomButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import authApi from '../../api/authApi';
import AlertModal from '../../components/AlertModal';
import CompleteCheck from '../../assets/CompleteCheck.svg';
import {useNavigation} from '@react-navigation/native';
import {AuthStackParamList} from '../../navigations/stack/AuthStackNavigator';
import {StackNavigationProp} from '@react-navigation/stack';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

function SignupScreen() {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

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

  const [sendCodeModalVisible, setSendCodeModalVisible] = useState(false);
  const [codeWrongModalVisible, setCodeWrongModalVisible] = useState(false);
  const [codeCorrectModalVisible, setCodeCorrectModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);

  // 인증번호 전송
  const handleSendCode = async () => {
    try {
      const res = await authApi.sendCode(signup.values.email);
      console.log('응답 확인 👉', res.data);
      setSendCodeModalVisible(true);
    } catch (error: any) {
      const msg = error.response?.data?.message ?? '인증번호 전송 실패';
      Alert.alert('에러', msg);
    }
  };

  // 🔐 인증번호 확인
  const handleVerifyCode = async () => {
    try {
      await authApi.verifyCode(signup.values.email, signup.values.codemessage);
      setCodeCorrectModalVisible(true);
    } catch (error: any) {
      setCodeWrongModalVisible(true);
    }
  };

  // 인증번호 재전송
  const handleReSend = () => {
    setCodeWrongModalVisible(false);
    handleSendCode();
  };

  // 🙌 최종 회원가입 요청
  const handleSignup = async () => {
    const {id, password, email, username} = signup.values;

    try {
      await authApi.signup(id, password, email, username);
      setCompleteModalVisible(true);
    } catch (error: any) {
      const msg = error.response?.data?.message ?? '회원가입 실패';
      Alert.alert('오류', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          // padding: 20,
        }}
        keyboardShouldPersistTaps="handled">
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
          <View style={styles.nameInputfield}>
            <InputField
              placeholder="이름"
              inputMode="text"
              focused={signup.focused.username}
              {...signup.getTextInputProps('username')}
            />
          </View>
          <View style={styles.emailcontainer}>
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
          </View>
          <AlertModal
            visible={sendCodeModalVisible}
            onRequestClose={() => setSendCodeModalVisible(false)}
            message="인증번호가 전송되었습니다"
            buttons={[
              {
                label: '확인',
                onPress: () => setSendCodeModalVisible(false),
                style: {backgroundColor: colors.BLUE_700},
              },
            ]}
          />
          <AlertModal
            visible={codeCorrectModalVisible}
            onRequestClose={() => setCodeCorrectModalVisible(false)}
            message="인증번호가 일치합니다"
            buttons={[
              {
                label: '확인',
                onPress: () => setCodeCorrectModalVisible(false),
                style: {backgroundColor: colors.BLUE_700},
              },
            ]}
          />
          <AlertModal
            visible={codeWrongModalVisible}
            onRequestClose={() => setCodeWrongModalVisible(false)}
            message="인증번호가 틀렸습니다"
            buttons={[
              {
                label: '다시 입력',
                onPress: () => setCodeWrongModalVisible(false),
                style: {backgroundColor: colors.GRAY_300},
              },
              {
                label: '재전송',
                onPress: handleReSend,
                style: {backgroundColor: colors.BLUE_700},
              },
            ]}
          />
          <View style={styles.idContainer}>
            <InputField
              placeholder="아이디"
              inputMode="text"
              keyboardType="ascii-capable"
              focused={signup.focused.id}
              {...signup.getTextInputProps('id')}
            />
          </View>
          <View style={styles.pwContainer}>
            <View style={styles.pwBigInputfield}>
              <InputField
                placeholder="비밀번호"
                inputMode="text"
                secureTextEntry
                touched={signup.touched.password}
                error={signup.errors.password}
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
      <Modal
        animationType="fade"
        transparent
        visible={completeModalVisible}
        onRequestClose={() => setCompleteModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <View style={styles.iconContainer}>
              <CompleteCheck />
            </View>
            <Text style={styles.modalTitle}>가입이 완료되었습니다</Text>
            <CustomBotton
              label="로그인 하기"
              onPress={() => {
                setCompleteModalVisible(false);
                navigation.navigate(authNavigations.AUTH_HOME); // 혹은 원하는 화면
              }}
              style={styles.loginButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  guideContainer: {
    marginTop: 15,
    marginLeft: deviceWidth * 0.08,
    gap: 3,
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
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  infoContainer: {
    paddingTop: 20, // 위쪽 여백 조정
    paddingHorizontal: deviceWidth * 0.08,
    marginBottom: '10%',
  },
  nameInputfield: {
    marginTop: '5%',
  },
  emailcontainer: {
    marginTop: '15%',
  },
  smallContainer: {
    width: deviceWidth * 0.84,
    flexDirection: 'row',
    justifyContent: 'space-between', // 입력칸과 버튼의 간격 유지
    marginBottom: 15, // 입력 필드와 다음 요소 간격,
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
  },
  idContainer: {
    marginTop: '15%',
  },
  pwContainer: {
    marginTop: '8%',
  },
  pwBigInputfield: {
    paddingTop: 20,
    gap: 20,
  },
  errorMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: deviceWidth * 0.04,
  },
  completeButton: {
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: deviceWidth * 0.85,
    height: deviceHeight * 0.2525,
    padding: 20,
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    marginTop: 10,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK_700,
    marginBottom: 30,
    textAlign: 'center',
  },
  loginButton: {
    width: deviceWidth * 0.7277,
    height: deviceHeight * 0.06125,
    backgroundColor: colors.BLUE_700,
    borderRadius: 6,
    justifyContent: 'center',
  },
});

export default SignupScreen;
