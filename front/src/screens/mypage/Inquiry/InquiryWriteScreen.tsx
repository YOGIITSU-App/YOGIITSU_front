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
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CustomBotton from '../../../components/CustomButton';
import {StackNavigationProp} from '@react-navigation/stack';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import {colors} from '../../../constants';
import inquiryApi from '../../../api/inquiryApi';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

function InquiryWriteScreen() {
  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();

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
      await inquiryApi.create(title, content);
      setModalVisible(false);
      navigation.navigate('InquiryComplete');
    } catch (error) {
      Alert.alert('등록 실패', '잠시 후 다시 시도해주세요');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <TextInput
          style={styles.titleInput}
          placeholder="제목을 입력하세요"
          placeholderTextColor={colors.GRAY_500}
          value={title}
          onChangeText={setTitle}
        />
        <Text style={styles.dateText}>
          {new Date().toISOString().slice(0, 10).replace(/-/g, '.')}
        </Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder={`내용 입력\n(tip. 내용을 구체적으로 작성할수록 빠르고 원활한 답변이 가능해요)`}
            placeholderTextColor={colors.GRAY_500}
            value={content}
            onChangeText={setContent}
          />
        </View>
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
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.WHITE,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.BLACK_700,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 14,
    color: colors.GRAY_500,
    marginHorizontal: 5,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: colors.GRAY_100,
    paddingBottom: 15,
  },
  textAreaContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  buttonContainer: {
    padding: 15,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.TRANSLUCENT,
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
