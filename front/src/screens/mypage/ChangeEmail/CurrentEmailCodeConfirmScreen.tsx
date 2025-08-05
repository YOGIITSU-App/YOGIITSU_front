import React, {useLayoutEffect, useState} from 'react';
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
import InputField from '../../../components/inputField';
import CustomBotton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';
import {colors} from '../../../constants';
import useForm from '../../../hooks/useForms';
import {validateCodeMessage, validateEmail} from '../../../utils';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import MiniCustomButton_W from '../../../components/miniCustomButton_W';
import MiniInputField from '../../../components/miniInputField';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import {useTabOptions} from '../../../constants/tabOptions';
import emailApi from '../../../api/emailApi';
import {EmailVerificationPurpose} from '../../../constants/emailPurpose';
import AlertModal from '../../../components/AlertModal';
import AppScreenLayout from '../../../components/common/AppScreenLayout';
import {scale, verticalScale} from '../../../utils/scale';
import axios from 'axios';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

function CurrentEmailCodeConfirmScreen() {
  const tabOptions = useTabOptions();

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

  const [wrongEmailModalVisible, setWrongEmailModalVisible] = useState(false);
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
      parent?.setOptions({tabBarStyle: tabOptions.tabBarStyle});
    };
  }, [navigation]);

  // 인증번호 전송
  const handleSendCode = async () => {
    if (isSending) return;
    setIsSending(true);

    try {
      const res = await emailApi.sendCode(
        emailcheak.values.email,
        EmailVerificationPurpose.EMAIL_CHANGE_OLD,
      );
      setSendCodeModalVisible(true);
    } catch (error) {
      let msg = '';
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message;
      } else {
        msg = '알 수 없는 오류';
      }

      if (
        msg?.includes('가입된 계정이 존재하지 않습니다') ||
        msg?.includes('이메일 정보가 일치하지 않습니다')
      ) {
        setWrongEmailModalVisible(true);
      } else {
        Alert.alert('에러', msg);
      }
    } finally {
      setIsSending(false);
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    try {
      await emailApi.verifyCode(codemessagecheck.values.codemessage);
      navigation.navigate('ChangeNewEmail');
    } catch (error: any) {
      setCodeWrongModalVisible(true);
    }
  };

  // 인증번호 재전송
  const handleReSend = () => {
    setCodeWrongModalVisible(false);
    handleSendCode();
  };

  return (
    <AppScreenLayout disableTopInset>
      <View style={styles.guideContainer}>
        {/* 상태에 따라 문구 변경 */}
        {guideTextType === 'email' ? (
          <>
            <Text style={styles.guideText}>이메일을 변경하기 위해</Text>
            <Text style={styles.guideText}>
              <Text style={styles.highlightedText}>기존 이메일</Text>을 입력해
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
        <Modal
          transparent
          visible={wrongEmailModalVisible}
          animationType="fade"
          onRequestClose={() => setWrongEmailModalVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.wrongModalBox}>
              <Image
                source={require('../../../assets/Warning-icon-gray.png')}
                style={styles.warningIcon}
              />
              <Text style={styles.wrongTitle}>
                {'현재 계정의 이메일과\n일치하지 않습니다'}
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setWrongEmailModalVisible(false);
                }}>
                <Text style={styles.buttonText}>다시 입력하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 인증번호 입력란 (모달 확인 버튼 클릭 시 표시됨) */}
        {isCodeFieldVisible && (
          <View style={styles.smallContainer}>
            <MiniInputField
              placeholder="인증번호"
              inputMode="text"
              focused={codemessagecheck.focused.codemessage}
              maxLength={6}
              {...codemessagecheck.getTextInputProps('codemessage')}
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
              onPress: () => {
                setCodeWrongModalVisible(false);
                codemessagecheck.setValues({codemessage: ''});
              },
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
  overlay: {
    flex: 1,
    backgroundColor: colors.TRANSLUCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrongModalBox: {
    width: deviceWidth * 0.85,
    backgroundColor: colors.WHITE,
    padding: scale(20),
    borderRadius: scale(10),
    alignItems: 'center',
  },
  warningIcon: {
    width: scale(28),
    height: scale(28),
    marginBottom: verticalScale(18),
  },
  wrongTitle: {
    color: colors.BLACK_700,
    fontSize: scale(16),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: scale(25),
    marginBottom: verticalScale(30),
  },
  button: {
    backgroundColor: colors.BLUE_700,
    width: deviceWidth * 0.7277,
    height: deviceHeight * 0.06125,
    marginHorizontal: scale(7),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(6),
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: scale(14),
    fontWeight: '600',
  },
  smallContainer: {
    width: deviceWidth * 0.84,
    flexDirection: 'row',
    justifyContent: 'space-between', // 이메일 입력칸과 버튼의 간격 유지
    alignItems: 'center',
    gap: deviceWidth * 0.025,
  },
});

export default CurrentEmailCodeConfirmScreen;
