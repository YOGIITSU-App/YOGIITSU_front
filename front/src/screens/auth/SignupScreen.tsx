import React, {useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
import emailApi from '../../api/emailApi';
import {EmailVerificationPurpose} from '../../constants/emailPurpose';
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

  const [agreements, setAgreements] = useState({
    all: false,
    age: false,
    terms: false,
    privacy: false,
    loc: false,
  });

  const [sendCodeModalVisible, setSendCodeModalVisible] = useState(false);
  const [codeWrongModalVisible, setCodeWrongModalVisible] = useState(false);
  const [codeCorrectModalVisible, setCodeCorrectModalVisible] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);

  const toggleAll = () => {
    const newValue = !agreements.all;
    setAgreements({
      all: newValue,
      age: newValue,
      terms: newValue,
      privacy: newValue,
      loc: newValue,
    });
  };

  const toggleOne = (key: keyof typeof agreements) => {
    const updated = {...agreements, [key]: !agreements[key]};
    updated.all =
      updated.age && updated.terms && updated.privacy && updated.loc;
    setAgreements(updated);
  };

  const handleNavigateToTermsDetail = (
    type: 'age' | 'terms' | 'privacy' | 'loc',
  ) => {
    navigation.navigate(authNavigations.TERMS_DETAIL, {type});
  };

  // 인증번호 전송
  const handleSendCode = async () => {
    try {
      const res = await emailApi.sendCode(
        signup.values.email,
        EmailVerificationPurpose.SIGNUP,
      );
      setSendCodeModalVisible(true);
    } catch (error: any) {
      const msg = error.response?.data?.message ?? '인증번호 전송 실패';
      Alert.alert('에러', msg);
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    try {
      await emailApi.verifyCode(signup.values.codemessage);
      setIsVerified(true);
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

  // 최종 회원가입 요청
  const handleSignup = async () => {
    const {id, password, email, username} = signup.values;

    if (!isVerified) {
      Alert.alert('안내', '이메일 인증을 먼저 완료해주세요.');
      return;
    }

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
                text="영문, 숫자, 특수문자를 포함한 8~16자리"
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
          <View style={styles.divider} />
          <View style={{marginTop: 30}}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 20,
                color: colors.GRAY_500,
              }}>
              서비스 정책 동의
            </Text>
            <TouchableOpacity
              onPress={toggleAll}
              style={[
                styles.agreeBox,
                agreements.all && styles.agreeBoxChecked,
              ]}>
              <View style={styles.allagreeRow}>
                <View
                  style={[
                    styles.checkCircle,
                    agreements.all && styles.checkCircleChecked,
                  ]}>
                  <Image
                    source={require('../../assets/check-icon.png')} // 회색 체크 아이콘
                    style={[
                      styles.allcheckIcon,
                      agreements.all && {tintColor: colors.WHITE},
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.allText,
                    agreements.all && styles.allTextChecked,
                  ]}>
                  전체동의 (필수)
                </Text>
              </View>
            </TouchableOpacity>

            {[
              {key: 'age', label: '만 14세 이상입니다 (필수)'},
              {key: 'terms', label: '서비스 이용약관에 동의 (필수)'},
              {key: 'privacy', label: '개인정보 수집 및 이용에 동의 (필수)'},
              {key: 'loc', label: '위치기반 서비스 이용에 동의 (필수)'},
            ].map(item => (
              <View key={item.key}>
                <TouchableOpacity
                  onPress={() => toggleOne(item.key as keyof typeof agreements)}
                  style={styles.agreeRow}>
                  <Image
                    source={require('../../assets/check-icon.png')}
                    style={[
                      styles.checkIcon,
                      agreements[item.key as keyof typeof agreements] && {
                        tintColor: colors.BLUE_700,
                      },
                    ]}
                  />
                  <Text style={styles.agreeText}>{item.label}</Text>
                  <TouchableOpacity
                    onPress={() => handleNavigateToTermsDetail(item.key as any)}
                    style={{marginRight: 6, marginLeft: 'auto'}}>
                    <Image
                      source={require('../../assets/right-arrow-icon.png')}
                      style={{
                        tintColor: colors.GRAY_400,
                      }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.completeButton}>
        <CustomBotton
          label={`동의 및 완료 ${
            [
              agreements.age,
              agreements.terms,
              agreements.privacy,
              agreements.loc,
            ].filter(Boolean).length
          }/4`}
          inValid={
            !signup.isFormValid ||
            !isVerified ||
            !(
              agreements.age &&
              agreements.terms &&
              agreements.privacy &&
              agreements.loc
            )
          }
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
                navigation.navigate(authNavigations.AUTH_HOME);
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
  divider: {
    height: 1,
    marginTop: 30,
    backgroundColor: colors.GRAY_50,
  },
  agreeBox: {
    backgroundColor: colors.GRAY_100,
    borderRadius: 6,
    paddingVertical: 15,
    paddingHorizontal: 17,
    marginBottom: 4,
  },
  agreeBoxChecked: {
    backgroundColor: colors.BLUE_100,
  },
  allagreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    marginLeft: 22,
    marginTop: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.GRAY_300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleChecked: {
    backgroundColor: colors.BLUE_700,
  },
  allcheckIcon: {
    width: 12,
    height: 8,
    tintColor: colors.GRAY_100,
  },
  allText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    color: colors.GRAY_500,
  },
  allTextChecked: {
    color: colors.BLUE_700,
  },
  checkIcon: {
    width: 12,
    height: 8,
    resizeMode: 'contain',
  },
  agreeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.GRAY_500,
  },
  descriptionText: {
    fontSize: 12,
    color: colors.GRAY_500,
    fontWeight: '500',
    lineHeight: 18,
    marginLeft: 22,
  },
});

export default SignupScreen;
