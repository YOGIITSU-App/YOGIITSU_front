import React, {useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import InputField from '../../../components/inputField';
import CustomBotton from '../../../components/CustomButton';
import {colors} from '../../../constants';
import useForm from '../../../hooks/useForms';
import {validatePw} from '../../../utils';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import authApi from '../../../api/authApi';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

function DeleteAccountScreen() {
  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();

  const pwcheak = useForm({
    initialValue: {
      password: '',
    },
    validate: validatePw,
  });

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.guideContainer}>
        <Text style={styles.guideText}>회원탈퇴를 위해</Text>
        <Text style={styles.guideText}>
          <Text style={styles.highlightedText}>비밀번호</Text>를 입력해주세요
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.pwContainer}>
          <InputField
            placeholder="비밀번호 입력"
            inputMode="text"
            secureTextEntry
            {...pwcheak.getTextInputProps('password')}
          />
        </View>
        <CustomBotton
          label="확인"
          variant="filled"
          size="large"
          inValid={!pwcheak.isFormValid} // 폼이 유효하지 않으면 버튼 비활성화
          onPress={() => {
            setModalVisible(true); // 모달 표시
          }}
        />
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            {/* 아이콘 자리 */}
            <Image
              source={require('../../../assets/Warning-icon-gray.png')}
              style={styles.warningIcon}
            />
            {/* 안내 문구 */}
            <Text style={styles.modalTitle}>
              정말로 <Text style={styles.highlightText}>탈퇴</Text>하시겠어요?
            </Text>
            <Text style={styles.modalSubtitle}>
              탈퇴 시 계정 복구가 불가능합니다
            </Text>
            {/* 버튼 컨테이너 */}
            <View style={styles.buttonContainer}>
              {/* 취소 버튼 */}
              <CustomBotton
                label="아니요"
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              />
              {/* 탈퇴 버튼 */}
              <CustomBotton
                label="네"
                style={[styles.button, styles.confirmButton]}
                onPress={async () => {
                  setModalVisible(false);
                  try {
                    await authApi.deleteAccount(pwcheak.values.password);
                    navigation.navigate('DeleteAccountComplete');
                  } catch (error: any) {
                    const msg =
                      error.response?.data?.message ?? '회원 탈퇴 실패';
                    Alert.alert('에러', msg);
                  }
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  pwContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: '15%',
  },
  errorMessageContainer: {
    alignSelf: 'flex-start',
    marginLeft: deviceWidth * 0.05,
    marginTop: 58,
    marginBottom: '15%',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
  },
  modalBox: {
    width: deviceWidth * 0.844,
    height: deviceHeight * 0.2725,
    backgroundColor: colors.WHITE,
    borderRadius: 6,
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 0,
  },
  warningIcon: {
    width: 28,
    height: 28,
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.BLACK_500,
    marginBottom: 10,
    lineHeight: 21.6,
  },
  highlightText: {
    color: colors.BLUE_700,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.GRAY_500,
    lineHeight: 16.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    height: deviceHeight * 0.07, // 버튼 높이 설정 (모달 하단을 채우도록)
    position: 'absolute', // 모달 하단에 고정
    bottom: 0,
  },
  button: {
    flex: 1, // 버튼을 동일한 크기로 설정
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.GRAY_300,
    borderBottomLeftRadius: 6, // 왼쪽 모서리 둥글게
  },
  confirmButton: {
    backgroundColor: colors.BLUE_700,
    borderBottomRightRadius: 6, // 오른쪽 모서리 둥글게
  },
});

export default DeleteAccountScreen;
