import React, {useCallback, useLayoutEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import AppScreenLayout from '../../../components/common/AppScreenLayout';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import {StackNavigationProp} from '@react-navigation/stack';
import {colors} from '../../../constants';
import noticeApi, {mapToNotice, Notice} from '../../../api/noticeApi';
import {useTabOptions} from '../../../constants/tabOptions';

function NoticeListScreen() {
  const tabOptions = useTabOptions();

  const navigation = useNavigation<StackNavigationProp<MypageStackParamList>>();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({tabBarStyle: {display: 'none'}});

    return () => {
      parent?.setOptions({tabBarStyle: tabOptions.tabBarStyle});
    };
  }, [navigation]);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const res = await noticeApi.getAll();
      const data = Array.isArray(res.data) ? res.data : [];
      const mapped = data.map(mapToNotice);
      setNotices(mapped);
    } catch (e) {
      console.error('공지사항 목록 불러오기 실패', e);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotices();
    }, []),
  );

  return (
    <AppScreenLayout disableTopInset>
      {isLoading ? (
        <View style={styles.spinnerOverlay}>
          <ActivityIndicator size="large" color={colors.BLUE_500} />
        </View>
      ) : notices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../../assets/Warning-icon-gray.png')}
              style={styles.warningIcon}
            />
          </View>
          <Text style={styles.title}>등록된 게시글이 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={notices}
          keyExtractor={item => item.noticeId.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() =>
                navigation.navigate('NoticeDetail', {
                  noticeId: item.noticeId,
                })
              }>
              <Text style={styles.titleText} numberOfLines={1}>
                {item.noticeTitle}
              </Text>
              <Text style={styles.dateText}>{item.noticeAt}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
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
  warningIcon: {
    width: 38,
    height: 38,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.BLACK_700,
    marginBottom: 15,
    lineHeight: 30,
  },
  itemRow: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: colors.GRAY_100,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.BLACK_700,
    lineHeight: 30,
  },
  dateText: {
    fontSize: 12,
    color: colors.GRAY_500,
  },
});

export default NoticeListScreen;
