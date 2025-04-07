import React from 'react';
import {SafeAreaView, StyleSheet, Text, View, ScrollView} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import {StackNavigationProp} from '@react-navigation/stack';
import CustomBotton from '../../../components/CustomButton';
import {colors} from '../../../constants';

type Route = RouteProp<MypageStackParamList, 'InquiryDetail'>;

function InquiryDetailScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();
  const {inquiry} = route.params;

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
                    ? '#eee'
                    : 'rgba(110,135,255,0.1)',
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

        {/* 날짜 + 작성자 */}
        <Text style={styles.meta}>
          {inquiry.date.replace(/-/g, '.')} | 작성자: {inquiry.author}
        </Text>

        {/* 본문 */}
        <View style={styles.contentBox}>
          <Text style={styles.contentText}>{inquiry.content}</Text>
        </View>

        {/* 답변 (임시 고정 예시) */}
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
      {/* 삭제 버튼 */}
      <View style={styles.buttonContainer}>
        <CustomBotton
          label="문의 삭제하기"
          onPress={() => {
            // 삭제 처리 (추후 구현 가능)
            navigation.goBack();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  scrollContent: {
    padding: 20,
  },
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
});

export default InquiryDetailScreen;
