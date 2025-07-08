import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Alert,
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

const deviceWidth = Dimensions.get('screen').width;

function FindPwCodeConfirmScreen() {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

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

  // 인증번호 전송
  const handleSendCode = async () => {
    try {
      await emailApi.sendCode(
        emailcheak.values.email,
        EmailVerificationPurpose.FIND_PASSWORD,
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
    <SafeAreaView style={styles.container}>
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
          inputMode="email"
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
              inputMode="text"
              focused={codemessagecheck.focused.codemessage}
              {...codemessagecheck.getTextInputProps('codemessage')}
              onChangeText={text => {
                const upperText = text.toUpperCase();
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
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
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 20,
  },
  errorMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: deviceWidth * 0.05,
    marginTop: 8,
  },
  smallContainer: {
    width: deviceWidth * 0.84,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: deviceWidth * 0.025,
  },
});

export default FindPwCodeConfirmScreen;
