import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { ShuttleSchedule } from '../api/shuttleApi';
import { colors } from '../constants';

type Props = {
  data: ShuttleSchedule;
  currentStopName: string; // 유지 (표시용), phase 계산은 selectedStopId로 처리
};

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

const ShuttleBottomSheet = ({ data, currentStopName }: Props) => {
  // 상단 시간 버튼에서 선택된 셔틀 인덱스
  const [selectedIdx, setSelectedIdx] = useState(0);

  // 선택된 셔틀
  const selected = data.upcomingShuttles?.[selectedIdx];

  // 선택 정류장 이후 구간의 도착예정시간을 stopId -> time 맵으로
  const arrivalMap = new Map<string, string>(
    (selected?.remainingRoute ?? []).map(r => [
      r.stopId,
      r.estimatedArrivalTime,
    ]),
  );

  // 선택 정류장의 인덱스 (전체 노선에서 위치 파악)
  const selIdx = data.fullRoute.findIndex(
    r => r.stopId === data.selectedStopId,
  );

  // 전체 노선 리스트 (fullRoute)를 기반으로 "이전/현재/이후" phase와 시간 머지
  const mergedRoute = data.fullRoute.map((r, idx) => {
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
      estimatedArrivalTime: arrivalMap.get(r.stopId) ?? null, // 이후 구간(+현재)에만 값이 생김
    };
  });

  return (
    <View style={styles.container}>
      {/* 상단: 선택 정류장 도착 예정 시간 목록 */}
      <View style={styles.timeSelector}>
        {data.upcomingShuttles.map((s, idx) => {
          const isActive = idx === selectedIdx;
          return (
            <TouchableOpacity
              key={s.arrivalTimeAtSelectedStop}
              activeOpacity={0.8}
              onPress={() => setSelectedIdx(idx)}
              style={[styles.timeButton, isActive && styles.timeButtonActive]}
            >
              <View style={styles.timeButtonContent}>
                <Image
                  source={require('../assets/category-tabs/shuttle-bus.png')}
                  style={[styles.busIcon, isActive && styles.busIconActive]}
                />
                <Text
                  style={[
                    styles.timeButtonText,
                    isActive && styles.timeButtonTextActive,
                  ]}
                >
                  {s.arrivalTimeAtSelectedStop}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.message}>
        * 도착 예정시간은 실시간이 아닌 예상 시간
      </Text>

      {/* 전체 노선 타임라인 (이전·현재·이후 모두 표시) */}
      <FlatList
        data={mergedRoute}
        keyExtractor={(item, index) => `${index}-${item.stopId}`}
        contentContainerStyle={{ paddingTop: 12 }}
        renderItem={({ item, index }) => {
          const isFirst = index === 0;
          const isLast = index === mergedRoute.length - 1;
          const isPast = item.phase === 'past';
          const isCurrent = item.phase === 'current';
          const isFuture = item.phase === 'future';

          return (
            <View style={styles.routeRow}>
              {/* 타임라인 선 + 점 */}
              <View style={styles.timeline}>
                {!isFirst && (
                  <View
                    style={[
                      styles.lineTop,
                      isPast && styles.dimmed, // 지난 구간 희미하게
                    ]}
                  />
                )}
                {isCurrent ? (
                  <Image
                    source={require('../assets/category-tabs/shuttle-bus-marker.png')}
                    style={styles.timelineImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.circle,
                      isPast && styles.dimmed, // 지난 구간 점도 희미하게
                    ]}
                  />
                )}
                {!isLast && (
                  <View style={[styles.lineBottom, isPast && styles.dimmed]} />
                )}
              </View>

              {/* 정류장명 + (이후/현재 구간만) 예측 시간 */}
              <View style={styles.stopTextWrapper}>
                <Text
                  style={[
                    styles.stopName,
                    isCurrent && styles.departure,
                    isPast && styles.pastStopText,
                  ]}
                >
                  {item.stopName}
                </Text>

                {(isFuture || isCurrent) && item.estimatedArrivalTime ? (
                  <Text style={styles.arrivalTime}>
                    {item.estimatedArrivalTime} 도착 예정
                  </Text>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  message: {
    fontSize: 11,
    fontWeight: '500',
    alignSelf: 'flex-end',
    color: colors.GRAY_700,
    marginBottom: 5,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
    gap: 12,
    flexWrap: 'wrap',
  },
  timeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    width: deviceWidth * 0.4416,
    height: deviceHeight * 0.0575,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButtonActive: {
    backgroundColor: colors.BLUE_100,
  },
  timeButtonText: {
    fontSize: 14,
    color: colors.GRAY_500,
    fontWeight: '600',
  },
  timeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  busIcon: {
    width: 14,
    height: 15,
    marginRight: 8,
    tintColor: colors.GRAY_500,
  },
  busIconActive: {
    tintColor: colors.BLUE_700,
  },
  timeButtonTextActive: {
    color: colors.BLUE_700,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  timeline: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 40,
  },
  lineTop: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.GRAY_400,
    zIndex: -1,
  },
  lineBottom: {
    position: 'absolute',
    top: 20,
    width: 2,
    bottom: 0,
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
    borderRadius: 10,
    borderWidth: 4,
    borderColor: colors.GRAY_450,
    backgroundColor: 'white',
  },
  stopTextWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  stopName: {
    paddingBottom: 6,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
    color: colors.BLACK_500,
  },
  departure: {
    fontWeight: '600',
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

export default ShuttleBottomSheet;
