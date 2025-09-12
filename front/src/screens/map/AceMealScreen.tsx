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

const BUILDING_ID = 5;

export default function AceMealScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tz, setTz] = useState('Asia/Seoul');

  // index → 메뉴목록
  const [byIndex, setByIndex] = useState<Record<number, CafeteriaMenuItem[]>>(
    {},
  );
  // 이동 가능한 인덱스들 [0,1,2,3,4]
  const [available, setAvailable] = useState<number[]>([]);
  // available 배열에서의 포인터
  const [ptr, setPtr] = useState(0);
  // index → ISO date
  const [indexToDate, setIndexToDate] = useState<Record<number, string>>({});
  // 헤더 타이틀(응답 없을 때 대비)
  const [buildingTitle, setBuildingTitle] = useState('ACE교육관');

  useEffect(() => {
    const ac = new AbortController();
    let canceled = false;

    (async () => {
      if (canceled) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getCafeteriaWeekly(BUILDING_ID, ac.signal);

        // 인덱스별 그룹핑
        const grouped: Record<number, CafeteriaMenuItem[]> = {};
        res.menus.forEach(m => {
          (grouped[m.dayIndex] ||= []).push(m);
        });

        // 이동 가능한 요일
        const av = (
          res.availableIndices || Object.keys(grouped).map(Number)
        ).sort((a, b) => a - b);

        // index → date 매핑 (tz 반영)
        const map: Record<number, string> = {};
        if (res.indexToDate) {
          Object.entries(res.indexToDate).forEach(
            ([k, v]) => (map[Number(k)] = v),
          );
        } else {
          const base = dayjs.tz(res.weekStart, res.tz || 'Asia/Seoul'); // ← 여기!
          av.forEach(idx => {
            map[idx] = base.add(idx, 'day').format('YYYY-MM-DD');
          });
        }

        // 초기 포인터: todayIndex가 없거나 주말이면 가까운 평일로 클램프
        const todayPos = av.indexOf((res.todayIndex as number) ?? -999);
        const initialPtr = (() => {
          if (todayPos >= 0) return todayPos;
          const dates = av.map(i => map[i]).sort(); // ISO 문자열 정렬
          if (dates.length === 0) return 0;
          const todayISO = (res.serverTime || new Date().toISOString()).slice(
            0,
            10,
          );
          if (todayISO <= dates[0]) return 0;
          if (todayISO >= dates[dates.length - 1]) return dates.length - 1;
          const k = dates.findIndex(d => d >= todayISO);
          return k === -1 ? dates.length - 1 : k;
        })();

        if (canceled || ac.signal.aborted) return;

        setByIndex(grouped);
        setAvailable(av);
        setIndexToDate(map);
        setPtr(initialPtr);
        setTz(res.tz || 'Asia/Seoul');

        // 빌딩명(첫 항목 기준)
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

  // ACE 화면: 점심(중식) × [학생식당, 교직원식당]
  const lunchStudent = mealsForSelected.filter(
    m => m.mealType?.includes('중식') && m.place?.includes('학생'),
  );
  const lunchStaff = mealsForSelected.filter(
    m => m.mealType?.includes('중식') && m.place?.includes('교직원'),
  );

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

      <Text style={styles.sectionTitle}>점심</Text>
      <Text style={styles.timeText}>11:30 - 14:00</Text>

      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
      {error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}

      {!loading && !error && (
        <>
          <View style={styles.card}>
            <Text style={styles.subTitle}>학생 식당</Text>
            <Text style={styles.menu}>
              {lunchStudent.length
                ? lunchStudent
                    .map(m =>
                      [...(m.items || []), ...(m.itemsCommon || [])].join(', '),
                    )
                    .join('\n')
                : '메뉴 준비 중'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.subTitle}>교직원 식당</Text>
            <Text style={styles.menu}>
              {lunchStaff.length
                ? lunchStaff
                    .map(m =>
                      [...(m.items || []), ...(m.itemsCommon || [])].join(', '),
                    )
                    .join('\n')
                : '메뉴 준비 중'}
            </Text>
          </View>

          <View style={{ height: 46 }} />

          {/* 이용 안내 (고정문구) */}
          <Text style={styles.infoTitle}>이용안내</Text>
          <Text style={styles.infoSubTitle}>학생식당</Text>
          <Text style={styles.infoText}>
            일품코너 : 6,500원 (돈까스, 덮밥류)
          </Text>
          <Text style={styles.infoText}>간편식 샐러드 : 5,800원</Text>
          <Text style={styles.infoText}>
            즉석 셀프 라면 : 4,500원 (밥, 토핑 포함)
          </Text>

          <View style={{ height: 18 }} />
          <Text style={styles.infoSubTitle}>교직원식당</Text>
          <Text style={styles.infoText}>한식과 직화 일품뚝배기 : 9,000원</Text>
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
