import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CustomBotton from '../../../components/CustomButton';
import {colors} from '../../../constants';
import {useInquiry} from '../../../contexts/InquiryContext';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import {StackNavigationProp} from '@react-navigation/stack';

function InquiryScreen() {
  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();
  const {inquiries} = useInquiry();

  useEffect(() => {
    navigation.getParent()?.setOptions({tabBarStyle: {display: 'none'}});
    return () => {
      navigation.getParent()?.setOptions({tabBarStyle: undefined});
    };
  }, [navigation]);

  const maskName = (name: string) => {
    return name.length > 1 ? name[0] + '**' : name;
  };

  return (
    <SafeAreaView style={styles.container}>
      {inquiries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../../assets/Warning-icon-gray.png')}
              style={styles.warningIcon}
            />
          </View>
          <Text style={styles.title}>문의 내용이 없습니다</Text>
          <Text style={styles.subtitle}>이용 중 불편한 점이 있으셨다면</Text>
          <Text style={styles.subtitle}>
            아래 등록 버튼을 눌러 문의를 접수해주세요
          </Text>
        </View>
      ) : (
        <>
          {/* 🔹 헤더 바 */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, {flex: 1}]}>상태</Text>
            <Text style={[styles.headerText, {flex: 3}]}>제목</Text>
            <Text style={[styles.headerText, {flex: 1}]}>작성자</Text>
          </View>

          {/* 🔹 목록 */}
          <FlatList
            data={inquiries}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.itemRow}
                onPress={() =>
                  navigation.navigate('InquiryDetail', {inquiry: item})
                }>
                {/* 상태 */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === 'WAITING'
                          ? '#eee'
                          : 'rgba(110,135,255,0.1)',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.status === 'WAITING'
                            ? colors.GRAY_500
                            : colors.BLUE_700,
                      },
                    ]}>
                    {item.status === 'WAITING' ? '답변대기' : '답변완료'}
                  </Text>
                </View>

                {/* 제목 + 날짜 */}
                <View style={styles.titleDateContainer}>
                  <Text numberOfLines={1} style={styles.titleText}>
                    🔒 {item.title}
                  </Text>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>

                {/* 작성자 */}
                <Text style={styles.authorText}>{maskName(item.author)}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {/* 등록 버튼 */}
      <View style={styles.buttonContainer}>
        <CustomBotton
          label="문의 등록하기"
          onPress={() => navigation.navigate('InquiryWrite')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F6F6F6',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.BLACK_700,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: 6,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  titleDateContainer: {
    flex: 3,
    flexDirection: 'row', // ✅ 수평 정렬
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6, // (선택) 제목과 날짜 간격
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.BLACK_700,
    flexShrink: 1, // 🔸 길어질 때 줄어들 수 있게
  },
  dateText: {
    fontSize: 12,
    color: colors.GRAY_500,
  },
  authorText: {
    fontSize: 13,
    color: colors.BLACK_700,
    textAlign: 'center',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
  },
  iconContainer: {
    borderRadius: 50,
    padding: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.BLACK_700,
    marginBottom: 15,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.GRAY_500,
    lineHeight: 26,
  },
  warningIcon: {
    width: 38,
    height: 38,
  },
  buttonContainer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
});

export default InquiryScreen;
