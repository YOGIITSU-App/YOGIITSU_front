import React, {useLayoutEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import InputField from '../../../components/inputField';
import CustomBotton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';
import {colors} from '../../../constants';
import useForm from '../../../hooks/useForms';
import {validateCodeMessage, validateEmail} from '../../../utils';
import {useNavigation} from '@react-navigation/native';
import MiniInputField from '../../../components/miniInputField';
import MiniCustomButton_W from '../../../components/miniCustomButton_W';
import {StackNavigationProp} from '@react-navigation/stack';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import {defaultTabOptions} from '../../../constants/tabOptions';
import emailApi from '../../../api/emailApi';
import {EmailVerificationPurpose} from '../../../constants/emailPurpose';
import AlertModal from '../../../components/AlertModal';
import AppScreenLayout from '../../../components/common/AppScreenLayout';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

function ChangePwCodeConfirmScreen() {
  const emailcheak = useForm({
    initialValue: {
      email: '',
    },
    validate: validateEmail,
  });

  const codemessagecheck = useForm({
    initialValue: {
      codemessage: '',
    },
    validate: validateCodeMessage,
  });

  const [sendCodeModalVisible, setSendCodeModalVisible] = useState(false);
  const [codeWrongModalVisible, setCodeWrongModalVisible] = useState(false);
  const [isCodeFieldVisible, setCodeFieldVisible] = useState(false);
  const [isSendButtonVisible, setSendButtonVisible] = useState(true);
  const [guideTextType, setGuideTextType] = useState<'email' | 'code'>('email');
  const [isSending, setIsSending] = useState(false);

  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({tabBarStyle: {display: 'none'}});

    return () => {
      parent?.setOptions({tabBarStyle: defaultTabOptions.tabBarStyle});
    };
  }, [navigation]);

  // 인증번호 전송
  const handleSendCode = async () => {
    if (isSending) return;
    setIsSending(true);

    try {
      const res = await emailApi.sendCode(
        emailcheak.values.email,
        EmailVerificationPurpose.PASSWORD_CHANGE,
      );
      setSendCodeModalVisible(true);
    } catch (error: any) {
      const msg = error.response?.data?.message ?? '인증번호 전송 실패';
      Alert.alert('에러', msg);
    } finally {
      setIsSending(false);
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    try {
      await emailApi.verifyCode(codemessagecheck.values.codemessage);
      navigation.navigate('ChangePw');
    } catch (error: any) {
      setCodeWrongModalVisible(true);
    }
  };

  // 인증번호 재전송
  const handleReSend = () => {
    setSendCodeModalVisible(false);
    handleSendCode();
  };

  return (
    <AppScreenLayout disableTopInset>
      <View style={styles.guideContainer}>
        {/* 상태에 따라 문구 변경 */}
        {guideTextType === 'email' ? (
          <>
            <Text style={styles.guideText}>비밀번호를 변경하기 위해</Text>
            <Text style={styles.guideText}>
              <Text style={styles.highlightedText}>가입 이메일</Text>을 입력해
              주세요
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.guideText}>
              전송된 <Text style={styles.highlightedText}>인증번호</Text>를
              입력해 주세요
            </Text>
          </>
        )}
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.emailContainer}>
          <InputField
            placeholder="이메일 입력"
            inputMode="email"
            touched={emailcheak.touched.email}
            error={emailcheak.errors.email}
            {...emailcheak.getTextInputProps('email')}
          />
        </View>
        <View style={styles.errorMessageContainer}>
          <CustomText
            text="이메일 형식으로 입력해 주세요"
            touched={emailcheak.touched.email}
            error={emailcheak.errors.email}
            {...emailcheak.getTextInputProps('email')}
          />
        </View>
        {isSendButtonVisible && (
          <CustomBotton
            label="인증번호 전송"
            variant="filled"
            size="large"
            inValid={!emailcheak.isFormValid}
            loading={isSending}
            onPress={handleSendCode}
          />
        )}
        {/* 인증번호 전송 안내 모달 */}
        <AlertModal
          visible={sendCodeModalVisible}
          onRequestClose={() => setSendCodeModalVisible(false)}
          message="인증번호가 전송되었습니다"
          buttons={[
            {
              label: '확인',
              onPress: () => {
                setSendCodeModalVisible(false);
                setSendButtonVisible(false);
                setGuideTextType('code');
                setCodeFieldVisible(true);
              },
              style: {backgroundColor: colors.BLUE_700},
            },
          ]}
        />

        {/* 인증번호 입력란 (모달 확인 버튼 클릭 시 표시됨) */}
        {isCodeFieldVisible && (
          <View style={styles.smallContainer}>
            <MiniInputField
              placeholder="인증번호"
              inputMode="text"
              focused={codemessagecheck.focused.codemessage}
              {...codemessagecheck.getTextInputProps('codemessage')}
              onChangeText={text => {
                const upperText = text.toUpperCase(); // 입력값을 대문자로 변환
                if (upperText.length <= 6) {
                  codemessagecheck
                    .getTextInputProps('codemessage')
                    .onChangeText(upperText);
                }
              }}
            />
            <MiniCustomButton_W
              label="확인"
              inValid={!codemessagecheck.isFormValid}
              onPress={handleVerifyCode}
            />
          </View>
        )}
        {/* 인증번호 틀림 모달 */}
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
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  guideContainer: {
    marginTop: 15,
    marginLeft: deviceWidth * 0.08,
    gap: 3,
    marginBottom: '5%',
  },
  guideText: {
    fontSize: 20,
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
    marginBottom: 15,
  },
  emailContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  errorMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: deviceWidth * 0.05,
    marginTop: 58,
    marginBottom: '5%',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
  },
  modalBox: {
    width: deviceWidth * 0.85,
    height: deviceHeight * 0.19375,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK_500,
    marginBottom: 20,
    marginTop: 10,
  },
  confirmButton: {
    width: deviceWidth * 0.7277,
    height: deviceHeight * 0.06125,
    backgroundColor: colors.BLUE_700,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15, // 버튼과 텍스트 간격 조정
  },
  smallContainer: {
    width: deviceWidth * 0.84,
    flexDirection: 'row',
    justifyContent: 'space-between', // 이메일 입력칸과 버튼의 간격 유지
    alignItems: 'center',
    gap: deviceWidth * 0.025,
  },
});

export default ChangePwCodeConfirmScreen;
