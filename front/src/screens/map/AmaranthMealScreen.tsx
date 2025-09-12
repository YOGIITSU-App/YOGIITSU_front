import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { colors } from '../../constants';
import { getCafeteriaWeekly, CafeteriaMenuItem } from '../../api/cafeteriaApi';

dayjs.locale('ko');
dayjs.extend(utc);
dayjs.extend(timezone);

const BUILDING_ID = 12;

export default function AmaranthMealScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tz, setTz] = useState('Asia/Seoul');

  const [byIndex, setByIndex] = useState<Record<number, CafeteriaMenuItem[]>>(
    {},
  );
  const [available, setAvailable] = useState<number[]>([]);
  const [ptr, setPtr] = useState(0);
  const [indexToDate, setIndexToDate] = useState<Record<number, string>>({});
  const [buildingTitle, setBuildingTitle] = useState('아마란스홀');

  useEffect(() => {
    const ac = new AbortController();
    let canceled = false;

    (async () => {
      if (canceled) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getCafeteriaWeekly(BUILDING_ID, ac.signal);

        const grouped: Record<number, CafeteriaMenuItem[]> = {};
        res.menus.forEach(m => {
          (grouped[m.dayIndex] ||= []).push(m);
        });

        const av = (
          res.availableIndices || Object.keys(grouped).map(Number)
        ).sort((a, b) => a - b);

        const todayPos = av.indexOf(res.todayIndex);
        setPtr(todayPos >= 0 ? todayPos : 0);

        setTz(res.tz || 'Asia/Seoul');

        const map: Record<number, string> = {};
        if (res.indexToDate) {
          Object.entries(res.indexToDate).forEach(([k, v]) => (map[+k] = v));
        } else {
          const base = dayjs.tz(res.weekStart, res.tz || 'Asia/Seoul'); // ← 여기!
          av.forEach(idx => {
            map[idx] = base.add(idx, 'day').format('YYYY-MM-DD');
          });
        }
        setIndexToDate(map);

        if (canceled || ac.signal.aborted) return;
        setByIndex(grouped);
        setAvailable(av);
        setIndexToDate(map);
        const name =
          res.menus.find(m => !!m.buildingName)?.buildingName || buildingTitle;
        setBuildingTitle(name);
      } catch (e) {
        if (!canceled && !ac.signal.aborted) {
          setError('학식 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!canceled && !ac.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      canceled = true;
      ac.abort();
    };
  }, []);

  const selectedIndex = useMemo(
    () => (available.length ? available[ptr] : 0),
    [available, ptr],
  );
  const selectedDateISO = indexToDate[selectedIndex];
  const dateLabel = selectedDateISO
    ? dayjs.tz(selectedDateISO, tz).format('M월 D일 dddd')
    : '';
  const mealsForSelected = byIndex[selectedIndex] || [];

  // 아마란스: 점심(선택메뉴/공통찬) + 저녁
  const lunch = mealsForSelected.filter(m => m.mealType?.includes('중식'));
  const dinner = mealsForSelected.filter(m => m.mealType?.includes('석식'));

  // 선택/공통 분리(점심)
  const choiceList = lunch.flatMap(m => m.itemsChoice || []);
  const commonList = lunch.flatMap(m => m.itemsCommon || []);
  const lunchBody =
    lunch.length && (choiceList.length || commonList.length)
      ? null
      : lunch.flatMap(m => m.items).join(', '); // 선택/공통이 없으면 items로 대체

  const onPrev = () => {
    if (ptr > 0) setPtr(p => p - 1);
  };
  const onNext = () => {
    if (ptr < available.length - 1) setPtr(p => p + 1);
  };

  const leftDisabled = ptr <= 0;
  const rightDisabled = ptr >= available.length - 1;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.buildingTitle}>{buildingTitle}</Text>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
        </View>
        <View style={styles.dateNavBox}>
          <Pressable
            style={[styles.navBtn, leftDisabled && { opacity: 0.4 }]}
            onPress={onPrev}
            disabled={leftDisabled}
          >
            <Image
              source={require('../../assets/back-icon.png')}
              style={{ width: 7, height: 11 }}
            />
          </Pressable>
          <View style={styles.navDivider} />
          <Pressable
            style={[styles.navBtn, rightDisabled && { opacity: 0.4 }]}
            onPress={onNext}
            disabled={rightDisabled}
          >
            <Image
              source={require('../../assets/back-icon.png')}
              style={{ width: 7, height: 11, transform: [{ scaleX: -1 }] }}
            />
          </Pressable>
        </View>
      </View>

      {/* 점심 */}
      <Text style={styles.sectionTitle}>점심</Text>
      <Text style={styles.timeText}>11:00 - 14:00</Text>

      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
      {error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}

      {!loading && !error && (
        <>
          <View style={styles.card}>
            {choiceList.length > 0 && (
              <>
                <Text style={styles.subTitle}>선택메뉴</Text>
                <Text style={styles.menu}>{choiceList.join(', ')}</Text>
                <View style={styles.divider} />
              </>
            )}
            {commonList.length > 0 && (
              <>
                <Text style={styles.subTitle}>공통찬</Text>
                <Text style={styles.menu}>{commonList.join(', ')}</Text>
              </>
            )}
            {lunchBody && (
              <>
                <Text style={styles.menu}>{lunchBody}</Text>
              </>
            )}
            {!choiceList.length && !commonList.length && !lunchBody && (
              <Text style={styles.menu}>메뉴 준비 중</Text>
            )}
          </View>

          {/* 저녁 */}
          <View style={{ height: 32 }} />
          <View style={styles.cardBox}>
            <Text style={styles.sectionTitle}>저녁</Text>
            <Text style={styles.timeText}>18:00 - 19:00</Text>

            <View style={styles.card}>
              <Text style={styles.menu}>
                {dinner.length
                  ? dinner.flatMap(m => m.items).join(', ')
                  : '메뉴 준비 중'}
              </Text>
            </View>
          </View>

          {/* 이용 안내(고정) */}
          <Text style={styles.infoTitle}>이용안내</Text>
          <Text style={styles.infoSubTitle}>학생식당</Text>
          <Text style={styles.infoText}>Mom’s Cook : 6,500원</Text>
          <Text style={styles.infoText}>돈까스코너 : 6,500원</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  buildingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.BLACK_900,
  },
  dateLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: colors.GRAY_500,
  },
  dateNavBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EBEDF0',
  },
  navBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  navDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#EBEDF0',
  },
  sectionTitle: {
    color: colors.BLUE_700,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.GRAY_500,
    marginBottom: 18,
  },
  cardBox: {
    marginBottom: 46,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.GRAY_500,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#EBEDF0',
    marginVertical: 12,
  },
  menu: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    color: colors.BLACK_900,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK_900,
    marginBottom: 12,
  },
  infoSubTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.BLACK_500,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.GRAY_500,
    marginBottom: 4,
  },
});
