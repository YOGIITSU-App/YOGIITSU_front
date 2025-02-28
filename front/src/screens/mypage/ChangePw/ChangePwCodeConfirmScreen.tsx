import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
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
import MiniInputField from '../../../components/miniInputField';
import MiniCustomButton_W from '../../../components/miniCustomButton_W';
import {StackNavigationProp} from '@react-navigation/stack';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';

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
      codemessage: 0,
    },
    validate: validateCodeMessage,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [isCodeFieldVisible, setCodeFieldVisible] = useState(false);
  const [isSendButtonVisible, setSendButtonVisible] = useState(true);
  const [guideTextType, setGuideTextType] = useState<'email' | 'code'>('email');

  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();

  useEffect(() => {
    // ✅ 화면에 들어오면 바텀 탭 숨기기
    navigation.getParent()?.setOptions({tabBarStyle: {display: 'none'}});

    return () => {
      // ✅ 화면을 떠나면 바텀 탭 다시 보이게 설정
      navigation.getParent()?.setOptions({tabBarStyle: undefined});
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.guideContainer}>
        {/* ✅ 상태에 따라 문구 변경 */}
        {guideTextType === 'email' ? (
          <>
            <Text style={styles.guideText}>비밀번호를 변경하기 위해</Text>
            <Text style={styles.guideText}>
              <Text style={styles.highlightedText}>가입 이메일</Text>을
              입력해주세요
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
            inValid={!emailcheak.isFormValid} // 폼이 유효하지 않으면 버튼 비활성화
            onPress={() => {
              console.log('📌 인증번호 전송 버튼 클릭됨'); // ✅ 로그 확인
              setModalVisible(true); // 모달 표시
              setSendButtonVisible(false); // 버튼 숨기기
              setGuideTextType('code'); // 안내 문구 변경
            }}
          />
        )}
        {/* ✅ 모달 (인증번호 전송 안내) */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalBox}>
              <Text style={styles.modalText}>인증번호가 전송되었습니다</Text>
              <CustomBotton
                label="확인"
                style={styles.confirmButton}
                onPress={() => {
                  setModalVisible(false); // 모달 닫기
                  setCodeFieldVisible(true); // 인증번호 입력란 보이기
                }}></CustomBotton>
            </View>
          </View>
        </Modal>
        {/* ✅ 인증번호 입력란 (모달 확인 버튼 클릭 시 표시됨) */}
        {isCodeFieldVisible && (
          <View style={styles.smallContainer}>
            <MiniInputField
              placeholder="인증번호"
              inputMode="text"
              focused={codemessagecheck.focused.codemessage}
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
              onPress={() => {
                if (codemessagecheck.isFormValid) {
                  navigation.navigate('ChangePw'); // ✅ ChangePwScreen으로 이동
                }
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // ✅ 반투명 배경
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
    marginTop: 15, // ✅ 버튼과 텍스트 간격 조정
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
