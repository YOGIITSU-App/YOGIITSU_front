import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Modal,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MypageStackParamList } from '../../../navigations/stack/MypageStackNavigator';
import { colors } from '../../../constants';
import CustomButton from '../../../components/CustomButton';
import inquiryApi, { mapToInquiry } from '../../../api/inquiryApi';
import AppScreenLayout from '../../../components/common/AppScreenLayout';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

type Navigation = StackNavigationProp<MypageStackParamList, 'InquiryEdit'>;

function InquiryEditScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute();
  const { inquiry } = route.params as any;

  const [title, setTitle] = useState(inquiry.title);
  const [content, setContent] = useState(inquiry.content);
  const [modalVisible, setModalVisible] = useState(false);

  const handleConfirmEdit = async () => {
    try {
      await inquiryApi.update(inquiry.id, title, content);

      const res = await inquiryApi.getById(inquiry.id);
      const updatedInquiry = mapToInquiry(res.data);
      const updated = new Date(updatedInquiry.date).getTime();

      setModalVisible(false);
      navigation.navigate('InquiryDetail', {
        inquiryId: inquiry.id,
        updated,
      });
    } catch (err) {
      Alert.alert('오류', '수정에 실패했어요');
    }
  };

  return (
    <AppScreenLayout disableTopInset>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <TextInput
            style={styles.titleInput}
            placeholder="제목을 입력하세요"
            placeholderTextColor={colors.GRAY_500}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.dateText}>{inquiry.date.replace(/-/g, '.')}</Text>

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
            <CustomButton
              label="수정 완료하기"
              onPress={() => {
                if (!title || !content) {
                  Alert.alert('알림', '제목과 내용을 입력해주세요!');
                  return;
                }
                setModalVisible(true);
              }}
            />
          </View>

          <Modal
            animationType="fade"
            transparent
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <StatusBar
              backgroundColor="rgba(0,0,0,0.5)"
              barStyle="light-content"
            />
            <View style={styles.modalBackground}>
              <View style={styles.modalBox}>
                <Text style={styles.modalText}>수정 내용을 저장할까요?</Text>
                <View style={styles.modalbuttonContainer}>
                  <CustomButton
                    label="아니요"
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  />
                  <CustomButton
                    label="네"
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleConfirmEdit}
                  />
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </AppScreenLayout>
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
    backgroundColor: colors.WHITE,
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

export default InquiryEditScreen;
