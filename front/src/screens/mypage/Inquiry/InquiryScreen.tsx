import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import CustomButton from '../../../components/CustomButton';
import {colors} from '../../../constants';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import {StackNavigationProp} from '@react-navigation/stack';
import {defaultTabOptions} from '../../../constants/tabOptions';
import inquiryApi, {mapToInquiry, Inquiry} from '../../../api/inquiryApi';

function InquiryScreen() {
  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({tabBarStyle: {display: 'none'}});

    return () => {
      parent?.setOptions({tabBarStyle: defaultTabOptions.tabBarStyle});
    };
  }, [navigation]);

  const fetchInquiries = async () => {
    try {
      const res = await inquiryApi.getAll();
      const mapped = res.data.map(mapToInquiry);
      setInquiries(mapped);
    } catch (e) {
      console.error('문의 리스트 불러오기 실패', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInquiries();
    }, []),
  );

  const maskName = (name: string) => {
    return name[0] + '*'.repeat(name.length - 1);
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
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, {flex: 1}]}>상태</Text>
            <Text style={[styles.headerText, {flex: 3}]}>제목</Text>
            <Text style={[styles.headerText, {flex: 1}]}>작성자</Text>
          </View>

          <FlatList
            data={inquiries}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.itemRow}
                onPress={() =>
                  navigation.navigate('InquiryDetail', {inquiryId: item.id})
                }>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === 'PROCESSING'
                          ? colors.GRAY_100
                          : colors.BLUE_100,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.status === 'PROCESSING'
                            ? colors.GRAY_500
                            : colors.BLUE_700,
                      },
                    ]}>
                    {item.status === 'PROCESSING' ? '답변대기' : '답변완료'}
                  </Text>
                </View>

                <View style={styles.titleDateContainer}>
                  <Text numberOfLines={1} style={styles.titleText}>
                    {item.title}
                  </Text>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>

                <Text style={styles.authorText}>{maskName(item.author)}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <View style={styles.buttonContainer}>
        <CustomButton
          label="문의 등록하기"
          onPress={() => navigation.navigate('InquiryWrite')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.GRAY_100,
    borderBottomWidth: 1,
    borderColor: colors.GRAY_200,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.BLACK_600,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.BLACK_600,
    flexShrink: 1,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.GRAY_500,
  },
  authorText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.BLACK_600,
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
    padding: 15,
    alignItems: 'center',
  },
});

export default InquiryScreen;
