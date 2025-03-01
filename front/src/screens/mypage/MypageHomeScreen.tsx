import React, {useContext, useState} from 'react';
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
import {colors} from '../../constants';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MypageStackParamList} from '../../navigations/stack/MypageStackNavigator';
import CustomBotton from '../../components/CustomButton';
import {AuthContext} from '../../navigations/root/Rootnavigator';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

function MypageHomeScreen() {
  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();

  const authContext = useContext(AuthContext); // ✅ Context 가져오기
  if (!authContext) return null; // ✅ null 체크 (안전한 코드)

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
            setModalVisible(true); // 모달 표시
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
                  onPress={
                    () => setModalVisible(false) // 모달 닫기
                  }></CustomBotton>
                {/* 탈퇴 버튼 */}
                <CustomBotton
                  label="네"
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => {
                    setModalVisible(false); // 모달 닫기
                    authContext.setIsLoggedIn(false); // ✅ 로그아웃 처리
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
    color: colors.BLACK_700,
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
    paddingTop: 30, // ✅ 상단 패딩
    paddingBottom: 0, // ✅ 하단 패딩 제거
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
    height: deviceHeight * 0.07, // ✅ 버튼 높이 설정 (모달 하단을 채우도록)
    position: 'absolute', // ✅ 모달 하단에 고정
    bottom: 0,
  },
  modalButton: {
    flex: 1, // ✅ 버튼을 동일한 크기로 설정
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.GRAY_300,
    borderBottomLeftRadius: 6, // ✅ 왼쪽 모서리 둥글게
  },
  confirmButton: {
    backgroundColor: colors.BLUE_700,
    borderBottomRightRadius: 6, // ✅ 오른쪽 모서리 둥글게
  },
});

export default MypageHomeScreen;
