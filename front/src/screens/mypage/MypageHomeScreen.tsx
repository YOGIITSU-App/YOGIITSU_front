import React, {useState} from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../constants';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MypageStackParamList} from '../../navigations/stack/MypageStackNavigator';
import CustomBotton from '../../components/CustomButton';
import {RootStackParamList} from '../../navigations/root/Rootnavigator';
import {logoutEmitter} from '../../utils/logoutEmitter';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

// 두 네비게이터 타입을 합친 Composite 타입 정의
type MypageNavigationProp = CompositeNavigationProp<
  StackNavigationProp<MypageStackParamList>,
  StackNavigationProp<RootStackParamList>
>;

function MypageHomeScreen() {
  const navigation = useNavigation<MypageNavigationProp>();

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.subContainer}>
        <Text style={styles.subTitleText}>계정</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ChangePwCodeConfirm')}>
          <Text style={styles.text}>비밀번호 변경</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('CurrentEmailCodeConfirm')}>
          <Text style={styles.text}>이메일 설정</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subContainer}>
        <Text style={styles.subTitleText}>이용안내</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Notice')}>
          <Text style={styles.text}>공지사항</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Inquiry')}>
          <Text style={styles.text}>문의</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subContainer}>
        <Text style={styles.subTitleText}>기타</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('DeleteAccountWarning')}>
          <Text style={styles.text}>회원탈퇴</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setModalVisible(true);
          }}>
          <Text style={styles.text}>로그아웃</Text>
          <Text style={styles.arrow}>〉</Text>
        </TouchableOpacity>

        {/* 로그아웃 모달 */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalBox}>
              <Text style={styles.modalText}>로그아웃 하시겠어요?</Text>
              {/* 버튼 컨테이너 */}
              <View style={styles.buttonContainer}>
                {/* 취소 버튼 */}
                <CustomBotton
                  label="아니요"
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}></CustomBotton>
                {/* 탈퇴 버튼 */}
                <CustomBotton
                  label="네"
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => {
                    setModalVisible(false);
                    logoutEmitter.emit('force-logout');
                  }}></CustomBotton>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  subContainer: {
    marginTop: 20,
    paddingHorizontal: deviceWidth * 0.04,
    gap: 3,
    marginBottom: '5%',
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_100,
  },
  subTitleText: {
    fontSize: 20,
    color: colors.BLACK_900,
    fontWeight: '600',
    marginBottom: 10,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  text: {
    fontSize: 16,
    color: colors.GRAY_800,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 16,
    color: colors.GRAY_800,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
  },
  modalBox: {
    width: deviceWidth * 0.844,
    height: deviceHeight * 0.19375,
    backgroundColor: colors.WHITE,
    borderRadius: 6,
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 0,
  },
  modalText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK_500,
    marginBottom: 20,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    height: deviceHeight * 0.07,
    position: 'absolute',
    bottom: 0,
  },
  modalButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.GRAY_300,
    borderBottomLeftRadius: 6,
  },
  confirmButton: {
    backgroundColor: colors.BLUE_700,
    borderBottomRightRadius: 6,
  },
});

export default MypageHomeScreen;
