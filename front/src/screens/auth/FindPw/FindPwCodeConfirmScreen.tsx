import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Modal,
  Image,
  TouchableOpacity,
} from 'react-native';
import InputField from '../../../components/inputField';
import CustomBotton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';
import MiniCustomButton_W from '../../../components/miniCustomButton_W';
import MiniInputField from '../../../components/miniInputField';
import AlertModal from '../../../components/AlertModal';
import {colors} from '../../../constants';
import useForm from '../../../hooks/useForms';
import {validateCodeMessage, validateEmail} from '../../../utils';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../../navigations/stack/AuthStackNavigator';
import emailApi from '../../../api/emailApi';
import {EmailVerificationPurpose} from '../../../constants/emailPurpose';
import {scale, verticalScale} from '../../../utils/scale';
import AppScreenLayout from '../../../components/common/AppScreenLayout';

const deviceHeight = Dimensions.get('screen').height;

function FindPwCodeConfirmScreen() {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

  const emailcheak = useForm({
    initialValue: {email: ''},
    validate: validateEmail,
  });

  const codemessagecheck = useForm({
    initialValue: {codemessage: ''},
    validate: validateCodeMessage,
  });

  const [sendCodeModalVisible, setSendCodeModalVisible] = useState(false);
  const [codeWrongModalVisible, setCodeWrongModalVisible] = useState(false);
  const [isCodeFieldVisible, setCodeFieldVisible] = useState(false);
  const [isSendButtonVisible, setSendButtonVisible] = useState(true);
  const [guideTextType, setGuideTextType] = useState<'email' | 'code'>('email');
  const [wrongEmailModalVisible, setWrongEmailModalVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // 인증번호 전송
  const handleSendCode = async () => {
    if (isSending) return;
    setIsSending(true);

    try {
      await emailApi.sendCode(
        emailcheak.values.email,
        EmailVerificationPurpose.FIND_PASSWORD,
      );
      setSendCodeModalVisible(true);
    } catch (error: any) {
      setWrongEmailModalVisible(true);
    } finally {
      setIsSending(false);
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    try {
      await emailApi.verifyCode(codemessagecheck.values.codemessage);
      navigation.navigate('FindPw', {email: emailcheak.values.email});
    } catch (error) {
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
        {guideTextType === 'email' ? (
          <>
            <Text style={styles.guideText}>비밀번호를 찾기 위해</Text>
            <Text style={styles.guideText}>
              <Text style={styles.highlightedText}>가입 이메일</Text>을 입력해
              주세요
            </Text>
          </>
        ) : (
          <Text style={styles.guideText}>
            전송된 <Text style={styles.highlightedText}>인증번호</Text>를 입력해
            주세요
          </Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        {/* 이메일 입력 */}
        <InputField
          placeholder="이메일 입력"
          keyboardType="email-address"
          touched={emailcheak.touched.email}
          error={emailcheak.errors.email}
          {...emailcheak.getTextInputProps('email')}
        />

        {/* 이메일 에러 텍스트 */}
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

        {/* 인증번호 입력 */}
        {isCodeFieldVisible && (
          <View style={styles.smallContainer}>
            <MiniInputField
              placeholder="인증번호"
              keyboardType="number-pad"
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

        {/* 가입 이력이 없는 이메일 모달 (일반 Modal) */}
        <Modal
          transparent
          visible={wrongEmailModalVisible}
          animationType="fade"
          onRequestClose={() => setWrongEmailModalVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.modalBox}>
              <Image
                source={require('../../../assets/Warning-icon-gray.png')}
                style={styles.warningIcon}
              />
              <Text style={styles.wrongTitle}>
                가입 이력이 없는 이메일입니다
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setWrongEmailModalVisible(false);
                  setSendButtonVisible(true);
                  setGuideTextType('email');
                  setCodeFieldVisible(false);
                }}>
                <Text style={styles.buttonText}>다시 입력하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  guideContainer: {
    marginTop: verticalScale(15),
    marginLeft: scale(24),
    gap: scale(3),
    marginBottom: '5%',
  },
  guideText: {
    fontSize: scale(20),
    color: colors.BLACK_700,
    fontWeight: '700',
  },
  highlightedText: {
    color: colors.BLUE_700,
  },
  infoContainer: {
    justifyContent: 'flex-start',
    paddingTop: verticalScale(20),
    paddingHorizontal: scale(20),
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  errorMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: scale(10),
    marginBottom: '10%',
  },
  smallContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.TRANSLUCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
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
    width: '73%',
    height: deviceHeight * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(6),
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: scale(14),
    fontWeight: '600',
  },
});

export default FindPwCodeConfirmScreen;
