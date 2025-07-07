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
import useForm from '../../hooks/useForms';
import {validateEmail} from '../../utils';
import CustomText from '../../components/CustomText';
import authApi from '../../api/authApi';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigations/stack/AuthStackNavigator';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

function FindIdScreen() {
  const emailcheak = useForm({
    initialValue: {
      email: '',
    },
    validate: validateEmail,
  });

  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

  const [correctModalVisible, setCorrectModalVisible] = useState(false);
  const [wrongModalVisible, setWrongModalVisible] = useState(false);
  const [foundId, setFoundId] = useState('');

  const handleCheckEmail = async () => {
    try {
      const res = await authApi.findId(emailcheak.values.email);
      const {status, id} = res.data;

      if (status?.toLowerCase() === 'error' || !id) {
        setWrongModalVisible(true);
      } else {
        setFoundId(id);
        setCorrectModalVisible(true);
      }
    } catch (error) {
      setWrongModalVisible(true);
    }
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
        <View style={styles.emailContainer}>
          <InputField
            placeholder="이메일 입력"
            inputMode="email"
            touched={emailcheak.touched.email}
            error={emailcheak.errors.email}
            focused={emailcheak.focused.email}
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
        <CustomBotton
          label="확인"
          inValid={!emailcheak.isFormValid}
          onPress={handleCheckEmail}
        />

        {/* 아이디 없음 모달 */}
        <Modal
          transparent
          visible={wrongModalVisible}
          animationType="fade"
          onRequestClose={() => setWrongModalVisible(false)}>
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
                  setWrongModalVisible(false);
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
                이메일 정보와{'\n'} 일치하는 아이디가 있습니다
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
    paddingTop: 20,
    paddingHorizontal: 20,
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
    marginBottom: '15%',
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
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  warningIcon: {
    width: 28,
    height: 28,
    marginBottom: 18,
  },
  wrongTitle: {
    color: colors.BLACK_700,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 30,
  },
  correctTitle: {
    color: colors.BLACK_700,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 25,
  },
  idBox: {
    backgroundColor: colors.GRAY_100,
    marginVertical: 25,
    padding: 12,
    width: deviceWidth * 0.7277,
    height: deviceHeight * 0.06125,
    marginHorizontal: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  idText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLUE_700,
  },
  button: {
    backgroundColor: colors.BLUE_700,
    width: deviceWidth * 0.7277,
    height: deviceHeight * 0.06125,
    marginHorizontal: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FindIdScreen;
