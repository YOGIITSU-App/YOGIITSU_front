import React, {useState} from 'react';
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {authNavigations, colors} from '../../constants';
import CustomBotton from '../../components/CustomButton';
import InputField from '../../components/inputField';
import MiniInputField from '../../components/miniInputField';
import MiniCustomButton_W from '../../components/miniCustomButton_W';
import AlertModal from '../../components/AlertModal';
import CustomText from '../../components/CustomText';
import useForm from '../../hooks/useForms';
import {validateEmail, validateCodeMessage} from '../../utils';
import authApi from '../../api/authApi';
import emailApi from '../../api/emailApi';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigations/stack/AuthStackNavigator';
import {scale, verticalScale} from '../../utils/scale';
import {EmailVerificationPurpose} from '../../constants/emailPurpose';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

function FindIdScreen() {
  const emailForm = useForm({
    initialValue: {email: ''},
    validate: validateEmail,
  });
  const codeForm = useForm({
    initialValue: {codemessage: ''},
    validate: validateCodeMessage,
  });

  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [sendCodeModalVisible, setSendCodeModalVisible] = useState(false);
  const [codeWrongModalVisible, setCodeWrongModalVisible] = useState(false);
  const [wrongEmailModalVisible, setWrongEmailModalVisible] = useState(false);
  const [correctModalVisible, setCorrectModalVisible] = useState(false);
  const [foundId, setFoundId] = useState('');

  const handleSendCode = async () => {
    try {
      // 이메일이 가입되어 있는지 체크 + 인증번호 발송
      const checkRes = await authApi.findId(emailForm.values.email);
      const {id} = checkRes.data;
      if (!id) {
        setWrongEmailModalVisible(true);
        return;
      }
      await emailApi.sendCode(
        emailForm.values.email,
        EmailVerificationPurpose.FIND_ID,
      );
      setSendCodeModalVisible(true);
      setIsCodeSent(true);
    } catch (error) {
      setWrongEmailModalVisible(true);
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    try {
      await emailApi.verifyCode(codeForm.values.codemessage);
      // 인증 성공시 아이디 조회
      const checkRes = await authApi.findId(emailForm.values.email);
      const {id} = checkRes.data;
      setFoundId(id);
      setCorrectModalVisible(true);
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
    <SafeAreaView style={styles.container}>
      {/* 안내 문구 */}
      <View style={styles.guideContainer}>
        <Text style={styles.guideText}>아이디를 찾기 위해</Text>
        <Text style={styles.guideText}>
          <Text style={styles.highlightedText}>가입 이메일</Text>을 입력해주세요
        </Text>
      </View>

      {/* 입력 영역 */}
      <View style={styles.infoContainer}>
        <InputField
          placeholder="이메일 입력"
          inputMode="email"
          touched={emailForm.touched.email}
          error={emailForm.errors.email}
          focused={emailForm.focused.email}
          {...emailForm.getTextInputProps('email')}
        />
        <View style={styles.errorMessageContainer}>
          <CustomText
            text="이메일 형식으로 입력해 주세요"
            touched={emailForm.touched.email}
            error={emailForm.errors.email}
            {...emailForm.getTextInputProps('email')}
          />
        </View>
        {!isCodeSent && (
          <CustomBotton
            label="인증번호 전송"
            inValid={!emailForm.isFormValid}
            onPress={handleSendCode}
          />
        )}

        {/* 인증번호 입력 영역 */}
        {isCodeSent && (
          <>
            <View style={styles.codeContainer}>
              <MiniInputField
                placeholder="인증번호"
                inputMode="text"
                focused={codeForm.focused.codemessage}
                {...codeForm.getTextInputProps('codemessage')}
                onChangeText={text => {
                  const upperText = text.toUpperCase();
                  if (upperText.length <= 6) {
                    codeForm
                      .getTextInputProps('codemessage')
                      .onChangeText(upperText);
                  }
                }}
              />
              <MiniCustomButton_W
                label="확인"
                inValid={!codeForm.isFormValid}
                onPress={handleVerifyCode}
              />
            </View>
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
          </>
        )}

        {/* 인증번호 발송 안내 모달 */}
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

        {/* 아이디 없음 모달 */}
        <Modal
          transparent
          visible={wrongEmailModalVisible}
          animationType="fade"
          onRequestClose={() => setWrongEmailModalVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.modalBox}>
              <Image
                source={require('../../assets/Warning-icon-gray.png')}
                style={styles.warningIcon}
              />
              <Text style={styles.wrongTitle}>
                가입 이력이 없는 이메일입니다
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setWrongEmailModalVisible(false);
                  setIsCodeSent(false);
                }}>
                <Text style={styles.buttonText}>다시 입력하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 아이디 있음 모달 */}
        <Modal
          transparent
          visible={correctModalVisible}
          animationType="fade"
          hardwareAccelerated={true}
          onRequestClose={() => setCorrectModalVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.modalBox}>
              <Image
                source={require('../../assets/Warning-icon-blue.png')}
                style={styles.warningIcon}
              />
              <Text style={styles.correctTitle}>
                이메일 정보와{'\n'}일치하는 아이디가 있습니다
              </Text>
              <View style={styles.idBox}>
                <Text style={styles.idText}>{foundId}</Text>
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setCorrectModalVisible(false);
                  navigation.navigate(authNavigations.AUTH_HOME);
                }}>
                <Text style={styles.buttonText}>로그인 하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
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
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  errorMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: scale(10),
    marginBottom: '10%',
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.TRANSLUCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
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
  correctTitle: {
    color: colors.BLACK_700,
    fontSize: scale(16),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: scale(25),
  },
  idBox: {
    backgroundColor: colors.GRAY_100,
    marginVertical: verticalScale(25),
    padding: scale(12),
    width: deviceWidth * 0.7277,
    height: deviceHeight * 0.06125,
    marginHorizontal: scale(7),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(6),
  },
  idText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.BLUE_700,
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
});

export default FindIdScreen;
