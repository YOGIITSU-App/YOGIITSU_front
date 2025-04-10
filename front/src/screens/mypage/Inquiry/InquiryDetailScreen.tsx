import React, {useLayoutEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import {StackNavigationProp} from '@react-navigation/stack';
import CustomBotton from '../../../components/CustomButton';
import {colors} from '../../../constants';
import {useInquiry} from '../../../contexts/InquiryContext';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

type Route = RouteProp<MypageStackParamList, 'InquiryDetail'>;

function InquiryDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();
  const {getInquiryById, deleteInquiry} = useInquiry();
  const inquiryId = route.params.inquiryId;
  const inquiry = getInquiryById(inquiryId);

  const [modalVisible, setModalVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Text
          onPress={() => {
            if (inquiry) {
              navigation.navigate('InquiryEdit', {inquiry});
            }
          }}
          style={{
            marginRight: 20,
            color: colors.BLUE_700,
            fontSize: 16,
            fontWeight: '600',
          }}>
          수정
        </Text>
      ),
    });
  }, [navigation, inquiry]);

  if (!inquiry) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{textAlign: 'center'}}>
          문의 데이터를 찾을 수 없어요 🥲
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{inquiry.title}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  inquiry.status === 'WAITING'
                    ? colors.GRAY_100
                    : colors.BLUE_100,
              },
            ]}>
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    inquiry.status === 'WAITING'
                      ? colors.GRAY_500
                      : colors.BLUE_700,
                },
              ]}>
              {inquiry.status === 'WAITING' ? '답변대기' : '답변완료'}
            </Text>
          </View>
        </View>

        <Text style={styles.meta}>
          {inquiry.date.replace(/-/g, '.')} | 작성자: {inquiry.author}
        </Text>

        <View style={styles.contentBox}>
          <Text style={styles.contentText}>{inquiry.content}</Text>
        </View>

        {inquiry.status === 'COMPLETE' && (
          <>
            <Text style={styles.answerLabel}>답변 드립니다</Text>
            <View style={styles.answerBox}>
              <Text style={styles.answerText}>
                안녕하세요.{'\n'}
                문의 주신 사항은 정상적으로 처리되었습니다.{'\n\n'}더 궁금하신
                점은 추가로 문의해주세요!
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* ✅ 삭제 버튼 */}
      <View style={styles.buttonContainer}>
        <CustomBotton
          label="문의 삭제하기"
          onPress={() => setModalVisible(true)}
        />
      </View>

      {/* ✅ 삭제 확인 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>문의를 삭제하시겠어요?</Text>
            <View style={styles.modalbuttonContainer}>
              <CustomBotton
                label="아니요"
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              />
              <CustomBotton
                label="네"
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  deleteInquiry(inquiry.id); // ✅ 삭제
                  setModalVisible(false);
                  navigation.navigate('Inquiry'); // ✅ 리스트로 이동
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
  container: {flex: 1, backgroundColor: colors.WHITE},
  scrollContent: {padding: 20},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 1,
    color: colors.BLACK_700,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    fontSize: 14,
    color: colors.GRAY_500,
    marginBottom: 20,
  },
  contentBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: 6,
    padding: 16,
    marginBottom: 30,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.BLACK_700,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.BLACK_700,
    marginBottom: 10,
  },
  answerBox: {
    backgroundColor: '#F6F6F6',
    padding: 16,
    borderRadius: 6,
    marginBottom: 30,
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.GRAY_800,
  },
  buttonContainer: {
    paddingBottom: 20,
    alignItems: 'center',
  },

  // ✅ 모달 스타일
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

export default InquiryDetailScreen;
