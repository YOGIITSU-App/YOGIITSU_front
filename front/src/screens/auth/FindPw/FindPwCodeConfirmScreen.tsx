import React, {useState} from 'react';
import {
  Dimensions,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import InputField from '../../../components/inputField';
import CustomBotton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';
import {colors} from '../../../constants';
import useForm from '../../../hooks/useForms';
import {validateCodeMessage, validateEmail} from '../../../utils';
import MiniCustomButton_W from '../../../components/miniCustomButton_W';
import MiniInputField from '../../../components/miniInputField';
import {AuthStackParamList} from '../../../navigations/stack/AuthStackNavigator';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import authApi from '../../../api/authApi'; // ✅ 추가

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

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

  const [modalVisible, setModalVisible] = useState(false);
  const [isCodeFieldVisible, setCodeFieldVisible] = useState(false);
  const [isSendButtonVisible, setSendButtonVisible] = useState(true);
  const [guideTextType, setGuideTextType] = useState<'email' | 'code'>('email');
  const [token, setToken] = useState('');

  // ✉️ 인증번호 전송
  const handleSendCode = async () => {
    try {
      const res = await authApi.sendResetCode(emailcheak.values.email);

      setToken(res.data.token); // 토큰 저장
      setModalVisible(true);
    } catch (error) {
      Alert.alert('전송 실패', '가입된 이메일이 아니에요!');
    }
  };

  // ✅ 인증번호 확인
  const handleVerifyCode = async () => {
    try {
      await authApi.verifyResetCode(
        emailcheak.values.email,
        codemessagecheck.values.codemessage,
        token,
      );
      navigation.navigate('FindPw', {
        email: emailcheak.values.email, // ✅ 다음 화면에 이메일 넘김
      });
    } catch (error) {
      Alert.alert('실패', '인증번호가 올바르지 않아요!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 안내 문구 */}
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
            <Text style={styles.highlightedText}>인증번호</Text>를 입력해 주세요
          </Text>
        )}
      </View>

      {/* 이메일 입력 */}
      <View style={styles.infoContainer}>
        <InputField
          placeholder="이메일 입력"
          inputMode="email"
          touched={emailcheak.touched.email}
          error={emailcheak.errors.email}
          {...emailcheak.getTextInputProps('email')}
        />

        {/* 인증번호 전송 버튼 */}
        {isSendButtonVisible && (
          <CustomBotton
            label="인증번호 전송"
            variant="filled"
            size="large"
            inValid={!emailcheak.isFormValid}
            onPress={handleSendCode}
          />
        )}

        {/* 인증번호 입력 UI */}
        {isCodeFieldVisible && (
          <View style={styles.smallContainer}>
            <MiniInputField
              placeholder="인증번호"
              inputMode="text"
              {...codemessagecheck.getTextInputProps('codemessage')}
              onChangeText={text => {
                const upperText = text.toUpperCase();
                if (upperText.length <= 8) {
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
      </View>

      {/* 인증번호 전송 완료 모달 */}
      <Modal
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>인증번호가 전송되었습니다</Text>
            <CustomBotton
              label="확인"
              style={styles.confirmButton}
              onPress={() => {
                setModalVisible(false);
                setSendButtonVisible(false);
                setGuideTextType('code');
                setCodeFieldVisible(true);
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 🎨 스타일은 그대로 두셔도 돼요!
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
  smallContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 10,
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  confirmButton: {
    width: '100%',
  },
});

export default FindPwCodeConfirmScreen;
