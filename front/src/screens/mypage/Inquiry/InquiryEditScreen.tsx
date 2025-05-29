import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  Text,
  View,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import CustomButton from '../../../components/CustomButton';
import {colors} from '../../../constants';
import {useInquiry} from '../../../contexts/InquiryContext';
import CustomBotton from '../../../components/CustomButton';

type Navigation = StackNavigationProp<MypageStackParamList, 'InquiryEdit'>;

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

function InquiryEditScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute();
  const {inquiry} = route.params as any;

  const [title, setTitle] = useState(inquiry.title);
  const [content, setContent] = useState(inquiry.content);
  const [modalVisible, setModalVisible] = useState(false);

  const {editInquiry} = useInquiry();

  const handleConfirmEdit = async () => {
    try {
      await editInquiry(inquiry.id, title, content);
      setModalVisible(false);
      navigation.goBack();
    } catch (err) {
      Alert.alert('오류', '수정에 실패했어요');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>제목</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="제목을 입력하세요"
      />

      <Text style={styles.label}>내용</Text>
      <TextInput
        style={[styles.input, {height: 200, textAlignVertical: 'top'}]}
        value={content}
        onChangeText={setContent}
        multiline
        placeholder="내용을 입력하세요"
      />

      <CustomButton
        label="저장하기"
        onPress={() => {
          if (!title || !content) {
            Alert.alert('알림', '제목과 내용을 입력해주세요!');
            return;
          }
          setModalVisible(true);
        }}
      />

      {/* ✅ 저장 확인 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>이대로 수정할까요?</Text>
            <CustomBotton
              label="확인"
              style={styles.confirmButton}
              onPress={handleConfirmEdit}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: colors.WHITE},
  label: {fontSize: 16, fontWeight: '600', marginBottom: 8},
  input: {
    borderWidth: 1,
    borderColor: colors.GRAY_300,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    marginTop: 15,
  },
});

export default InquiryEditScreen;
