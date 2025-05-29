import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useInquiry} from '../../../contexts/InquiryContext';
import CustomBotton from '../../../components/CustomButton';
import {StackNavigationProp} from '@react-navigation/stack';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import {colors} from '../../../constants';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

function InquiryWriteScreen() {
  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();
  const {addInquiry} = useInquiry();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!title || !content) {
      Alert.alert('알림', '제목과 내용을 입력하세요!');
      return;
    }

    setModalVisible(true);
  };

  const handleConfirm = async () => {
    try {
      await addInquiry(title, content);
      setModalVisible(false);
      navigation.navigate('InquiryComplete');
    } catch (error) {
      Alert.alert('등록 실패', '잠시 후 다시 시도해주세요');
    }
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
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>문의를 등록하시겠어요?</Text>
            <View style={styles.modalbuttonContainer}>
              <CustomBotton
                label="아니요"
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              />
              <CustomBotton
                label="네"
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirm}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ✅ 스타일은 그대로~
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.WHITE,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  modalbuttonContainer: {
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

export default InquiryWriteScreen;
