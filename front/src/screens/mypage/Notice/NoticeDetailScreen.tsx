import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {MypageStackParamList} from '../../../navigations/stack/MypageStackNavigator';
import noticeApi, {
  NoticeDetail,
  mapToNoticeDetail,
} from '../../../api/noticeApi';
import {colors} from '../../../constants';
import AppScreenLayout from '../../../components/common/AppScreenLayout';

type RouteType = RouteProp<MypageStackParamList, 'NoticeDetail'>;

export default function NoticeDetailScreen() {
  const route = useRoute<RouteType>();
  const {noticeId} = route.params;

  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotice = async () => {
    try {
      const res = await noticeApi.getById(noticeId);
      const mapped = mapToNoticeDetail(res.data);
      setNotice(mapped);
    } catch (e) {
      console.error('공지사항 상세 조회 실패', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [noticeId]);

  if (isLoading || !notice) {
    return (
      <View style={styles.spinnerOverlay}>
        <ActivityIndicator size="large" color={colors.BLUE_500} />
      </View>
    );
  }

  return (
    <AppScreenLayout disableTopInset>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{notice.title}</Text>
        <Text style={styles.date}>{notice.date}</Text>
        <Text style={styles.content}>{notice.content}</Text>
      </ScrollView>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.BLACK_700,
    lineHeight: 30,
  },
  date: {
    fontSize: 14,
    color: colors.GRAY_500,
    lineHeight: 30,
  },
  content: {
    fontSize: 15,
    color: colors.BLACK_700,
    lineHeight: 22,
    marginTop: 22,
  },
});
