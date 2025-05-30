import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import {StackNavigationProp} from '@react-navigation/stack';
import CustomBotton from '../../../components/CustomButton';
import {colors} from '../../../constants';
import {useInquiry, Inquiry} from '../../../contexts/InquiryContext';
import {useUser} from '../../../contexts/UserContext';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

type Route = RouteProp<MypageStackParamList, 'InquiryDetail'>;

function InquiryDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();
  const {getInquiryFromServer, deleteInquiry} = useInquiry();
  const {user} = useUser();

  const {inquiryId, updated} = route.params;

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const isAuthor = user?.userId === inquiry?.authorId;

  const maskName = (name: string) => {
    return name[0] + '*'.repeat(name.length - 1);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getInquiryFromServer(inquiryId);
        setInquiry(data);
      } catch (error) {
        console.error('문의 상세 조회 실패:', error);
        setInquiry(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [inquiryId, updated]);

  useLayoutEffect(() => {
    if (isAuthor && inquiry) {
      navigation.setOptions({
        headerRight: () => (
          <Text
            onPress={() => navigation.navigate('InquiryEdit', {inquiry})}
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
    }
  }, [navigation, inquiry, isAuthor]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.BLUE_700} />
      </SafeAreaView>
    );
  }

  if (!inquiry) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{textAlign: 'center'}}>
          문의 데이터를 불러올 수 없어요
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
                  inquiry.status === 'PROCESSING'
                    ? colors.GRAY_100
                    : colors.BLUE_100,
              },
            ]}>
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    inquiry.status === 'PROCESSING'
                      ? colors.GRAY_500
                      : colors.BLUE_700,
                },
              ]}>
              {inquiry.status === 'PROCESSING' ? '답변대기' : '답변완료'}
            </Text>
          </View>
        </View>

        <Text style={styles.meta}>
          {inquiry.date.replace(/-/g, '.')} | 작성자:{' '}
          {inquiry.authorId === user?.userId
            ? inquiry.author
            : maskName(inquiry.author)}
        </Text>

        <View style={styles.contentBox}>
          <Text style={styles.contentText}>{inquiry.content}</Text>
        </View>

        {inquiry.status === 'COMPLETED' && inquiry.response && (
          <>
            <Text style={styles.answerLabel}>답변 드립니다</Text>
            <View style={styles.answerBox}>
              <Text style={styles.answerText}>{inquiry.response}</Text>
              {inquiry.responseDate && (
                <Text style={styles.answerDate}>
                  답변일자: {inquiry.responseDate}
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {isAuthor && (
        <View style={styles.buttonContainer}>
          <CustomBotton
            label="문의 삭제하기"
            onPress={() => setModalVisible(true)}
          />
        </View>
      )}

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
                onPress={async () => {
                  try {
                    await deleteInquiry(inquiry.id);
                    setModalVisible(false);
                    navigation.navigate('Inquiry');
                  } catch (error) {
                    console.error('문의 삭제 실패:', error);
                    setModalVisible(false);
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
  container: {flex: 1, backgroundColor: colors.WHITE},
  scrollContent: {padding: 20},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 1,
    color: colors.BLACK_900,
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
    backgroundColor: colors.GRAY_50,
    borderRadius: 6,
    padding: 16,
    marginBottom: 30,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.BLACK_500,
  },
  answerLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.BLACK_900,
    marginBottom: 10,
  },
  answerBox: {
    backgroundColor: colors.GRAY_50,
    borderRadius: 6,
    padding: 16,
    marginBottom: 30,
  },
  answerText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.BLACK_500,
  },
  answerDate: {
    fontSize: 14,
    color: colors.GRAY_500,
    marginTop: 10,
  },
  buttonContainer: {
    paddingBottom: 20,
    alignItems: 'center',
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

export default InquiryDetailScreen;
