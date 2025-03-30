import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useInquiry} from '../../../contexts/InquiryContext'; // ✅ context import!
import CustomBotton from '../../../components/CustomButton';
import {StackNavigationProp} from '@react-navigation/stack';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import {colors} from '../../../constants';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

function InquiryWriteScreen() {
  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();
  const {addInquiry} = useInquiry(); // ✅ 함수 받아오기!

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!title || !content) {
      Alert.alert('알림', '제목과 내용을 입력하세요!');
      return;
    }

    setModalVisible(true); // 모달 표시
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>제목</Text>
      <TextInput
        style={styles.input}
        placeholder="제목을 입력하세요"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>내용</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="문의 내용을 입력하세요"
        value={content}
        onChangeText={setContent}
        multiline
      />

      <View style={styles.buttonContainer}>
        <CustomBotton label="문의 등록하기" onPress={handleSubmit} />
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>문의를 등록하시겠어요?</Text>
            {/* 버튼 컨테이너 */}
            <View style={styles.modalbuttonContainer}>
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
                  const newInquiry = {
                    id: Date.now(),
                    title,
                    content,
                    date: new Date().toISOString().split('T')[0],
                  };
                  addInquiry(newInquiry); // ✅ context 함수로 추가!
                  setModalVisible(false); // 모달 닫기
                  navigation.navigate('InquiryComplete');
                }}></CustomBotton>
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
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
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
  modalbuttonContainer: {
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

export default InquiryWriteScreen;
