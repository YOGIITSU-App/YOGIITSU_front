import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MapStackParamList } from '../../navigations/stack/MapStackNavigator';
import { mapNavigation } from '../../constants/navigation';
import { colors } from '../../constants';
import AppScreenLayout from '../../components/common/AppScreenLayout';

type RouteParams = RouteProp<
  MapStackParamList,
  typeof mapNavigation.SHUTTLE_DETAIL
>;

const ShuttleDetailScreen = () => {
  const route = useRoute<RouteParams>();
  const { shuttleSchedule, selectedTime, currentStopName } = route.params;

  // ================== 상단 시간표 (2열 그리드) ==================
  const timeTableRows: (string | null)[][] = [];
  const fullTimeTable: string[] = shuttleSchedule.fullTimeTable ?? [];
  for (let i = 0; i < fullTimeTable.length; i += 2) {
    timeTableRows.push([fullTimeTable[i], fullTimeTable[i + 1] ?? null]);
  }

  // ================== 노선 타임라인 (전체 + 예상시간 머지) ==================
  // 선택된 시간대의 셔틀(없으면 첫 번째)에서 remainingRoute를 꺼낸다
  const selectedShuttle =
    shuttleSchedule.upcomingShuttles?.find(
      s => s.arrivalTimeAtSelectedStop === selectedTime,
    ) ?? shuttleSchedule.upcomingShuttles?.[0];

  // 이후 구간(선택 정류장 포함)의 도착예정 시간을 맵으로 (stopId -> time)
  const arrivalMap = new Map<string, string>(
    (selectedShuttle?.remainingRoute ?? []).map(r => [
      r.stopId,
      r.estimatedArrivalTime,
    ]),
  );

  // 선택 정류장의 인덱스
  const selIdx = shuttleSchedule.fullRoute.findIndex(
    r => r.stopId === shuttleSchedule.selectedStopId,
  );

  // 전체 노선을 기준으로 이전/현재/이후 phase 및 시간 머지
  const mergedRoute = shuttleSchedule.fullRoute.map((r, idx) => {
    const phase =
      selIdx >= 0
        ? idx < selIdx
          ? 'past'
          : idx === selIdx
          ? 'current'
          : 'future'
        : 'future';
    return {
      stopId: r.stopId,
      stopName: r.stopName,
      phase, // 'past' | 'current' | 'future'
      estimatedArrivalTime: arrivalMap.get(r.stopId) ?? null, // 이후/현재만 값 존재
    };
  });

  return (
    <AppScreenLayout disableTopInset>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* 운행 시간표 헤더 */}
          <View style={styles.timeHeader}>
            <Text style={styles.sectionTitle}>운행 시간표</Text>
            <Text style={styles.noticeText}>
              * 도착 예정시간은 실시간이 아닌 예상 시간
            </Text>
          </View>

          {/* 시간표 그리드 (2열) */}
          <View style={styles.timeTable}>
            {timeTableRows.map((row, i) => (
              <View style={styles.timeRow} key={i}>
                {row.map((time, j) =>
                  time ? (
                    <View
                      key={time}
                      style={[
                        styles.timeCell,
                        time === selectedTime && styles.timeCellActive,
                      ]}
                    >
                      <View style={styles.timeCellContent}>
                        {time === selectedTime && (
                          <Image
                            source={require('../../assets/category-tabs/shuttle-bus.png')}
                            style={styles.busIconActive}
                          />
                        )}
                        <Text
                          style={[
                            styles.timeText,
                            time === selectedTime && styles.timeTextActive,
                          ]}
                        >
                          {time}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.timeCell, { opacity: 0 }]} key={j} />
                  ),
                )}
              </View>
            ))}
          </View>

          {/* 승차장/노선 타임라인 (전체 표시 + 이후 구간만 시간 표기) */}
          <Text style={styles.stationTitle}>승차장</Text>
          <View style={styles.routeList}>
            {mergedRoute.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === mergedRoute.length - 1;
              const isCurrent = item.phase === 'current';
              const isPast = item.phase === 'past';

              return (
                <View style={styles.routeRow} key={`${item.stopId}-${index}`}>
                  <View style={styles.timeline}>
                    {!isFirst && (
                      <View style={[styles.lineTop, isPast && styles.dimmed]} />
                    )}
                    {isCurrent ? (
                      <Image
                        source={require('../../assets/category-tabs/shuttle-bus-marker.png')}
                        style={styles.timelineImage}
                      />
                    ) : (
                      <View style={[styles.circle, isPast && styles.dimmed]} />
                    )}
                    {!isLast && (
                      <View
                        style={[styles.lineBottom, isPast && styles.dimmed]}
                      />
                    )}
                  </View>

                  <View style={styles.stopTextRow}>
                    <Text
                      style={[
                        styles.stopName,
                        isCurrent && styles.departure,
                        isPast && styles.pastStopText,
                      ]}
                    >
                      {item.stopName}
                      {isLast && <Text style={styles.arrival}> 회차</Text>}
                    </Text>

                    {/* 현재/이후 구간에만 예측 시간 표기 */}
                    {(item.phase === 'current' || item.phase === 'future') &&
                      item.estimatedArrivalTime && (
                        <Text style={styles.arrivalTime}>
                          {item.estimatedArrivalTime} 도착 예정
                        </Text>
                      )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </AppScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 25,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.BLACK_700,
  },
  noticeText: {
    fontSize: 11,
    color: colors.GRAY_700,
    fontWeight: '500',
  },
  timeTable: {
    width: '100%',
    gap: 10,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  timeCell: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeCellActive: {
    backgroundColor: colors.BLUE_100,
  },
  timeCellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  busIconActive: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: colors.BLUE_700,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.GRAY_500,
  },
  timeTextActive: {
    color: colors.BLUE_700,
    fontWeight: '600',
  },
  stationTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 14,
    color: colors.GRAY_700,
    fontWeight: '500',
  },
  routeList: {
    paddingTop: 2,
    paddingBottom: 10,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
  },
  timeline: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    position: 'relative',
  },
  lineTop: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.GRAY_400,
    zIndex: -1,
  },
  lineBottom: {
    position: 'absolute',
    top: 18,
    width: 2,
    height: 18,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.GRAY_400,
    zIndex: -1,
  },
  timelineImage: {
    width: 32,
    height: 32,
    zIndex: 1,
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 4,
    borderColor: colors.GRAY_450,
    backgroundColor: 'white',
  },
  stopTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  stopName: {
    fontSize: 14,
    marginLeft: 14,
    color: colors.BLACK_500,
    fontWeight: '500',
    paddingBottom: 4,
  },
  departure: {
    fontWeight: '700',
    color: colors.BLACK_900,
  },
  pastStopText: {
    color: '#9AA0A6',
  },
  dimmed: {
    opacity: 0.4,
  },
  arrival: {
    marginLeft: 7,
    fontSize: 12,
    fontWeight: '500',
    color: colors.GRAY_500,
  },
  arrivalTime: {
    marginLeft: 8,
    fontSize: 10,
    color: colors.GRAY_500,
    fontWeight: '500',
    lineHeight: 14,
  },
});

export default ShuttleDetailScreen;
