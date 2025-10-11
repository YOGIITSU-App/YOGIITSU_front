import React, { useEffect, useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
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

export default function AmaranthMealContent({
  onDateChange,
}: {
  onDateChange: (d: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tz, setTz] = useState('Asia/Seoul');
  const [byIndex, setByIndex] = useState<Record<number, CafeteriaMenuItem[]>>(
    {},
  );
  const [available, setAvailable] = useState<number[]>([]);
  const [ptr, setPtr] = useState(0);
  const [indexToDate, setIndexToDate] = useState<Record<number, string>>({});
  const BUILDING_ID = 12;

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await getCafeteriaWeekly(BUILDING_ID, ac.signal);

        const grouped: Record<number, CafeteriaMenuItem[]> = {};
        res.menus.forEach(m => (grouped[m.dayIndex] ||= []).push(m));

        const av = (
          res.availableIndices || Object.keys(grouped).map(Number)
        ).sort((a, b) => a - b);
        const base = dayjs.tz(res.weekStart, res.tz || 'Asia/Seoul');
        const map: Record<number, string> = {};
        av.forEach(
          idx => (map[idx] = base.add(idx, 'day').format('YYYY-MM-DD')),
        );

        setByIndex(grouped);
        setAvailable(av);
        setIndexToDate(map);
        setTz(res.tz || 'Asia/Seoul');

        const todayIdx = res.todayIndex ?? 0;
        let initialPtr = 0;

        if (av.includes(todayIdx)) {
          initialPtr = av.indexOf(todayIdx);
        } else {
          const prev = av.filter(i => i < todayIdx).sort((a, b) => b - a)?.[0];
          if (prev !== undefined) initialPtr = av.indexOf(prev);
          else initialPtr = av.length - 1;
        }

        setPtr(initialPtr);
      } catch {
        setError('학식 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const selectedIndex = useMemo(
    () => (available.length ? available[ptr] : 0),
    [available, ptr],
  );
  const selectedDateISO = indexToDate[selectedIndex];
  const dateLabel = selectedDateISO
    ? dayjs.tz(selectedDateISO, tz).format('M/D (ddd)')
    : '';

  useEffect(() => {
    if (dateLabel) onDateChange(dateLabel);
  }, [dateLabel]);

  const meals = byIndex[selectedIndex] || [];
  const lunch = meals.filter(m => m.mealType?.includes('중식'));
  const dinner = meals.filter(m => m.mealType?.includes('석식'));

  const choiceList = lunch.find(m => m.mealType?.includes('선택'))?.items || [];
  const commonList = lunch.find(m => m.mealType?.includes('공통'))?.items || [];
  const lunchBody =
    lunch
      .find(
        m =>
          m.mealType?.includes('중식') &&
          !m.mealType?.includes('선택') &&
          !m.mealType?.includes('공통'),
      )
      ?.items?.join(', ') || '';

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
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>점심</Text>
          <Text style={styles.timeText}>11:00 - 14:00</Text>
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
              style={{
                width: 7,
                height: 11,
                transform: [{ scaleX: -1 }],
              }}
            />
          </Pressable>
        </View>
      </View>

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
            {lunchBody && <Text style={styles.menu}>{lunchBody}</Text>}
            {!choiceList.length && !commonList.length && !lunchBody && (
              <Text style={styles.menu}>메뉴 준비 중</Text>
            )}
          </View>

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
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  dateNavBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EBEDF0',
  },
  navBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  navDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#EBEDF0',
  },
  cardBox: { marginBottom: 46 },
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
