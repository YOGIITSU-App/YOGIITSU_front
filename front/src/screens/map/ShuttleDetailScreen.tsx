import React from 'react';
import {View, Text, StyleSheet, Image, ScrollView} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import {colors} from '../../constants';
import AppScreenLayout from '../../components/common/AppScreenLayout';

type RouteParams = RouteProp<
  MapStackParamList,
  typeof mapNavigation.SHUTTLE_DETAIL
>;

const ShuttleDetailScreen = () => {
  const route = useRoute<RouteParams>();
  const {shuttleSchedule, selectedTime, currentStopName} = route.params;

  // 2열 그리드 데이터 변환
  const timeTableRows: (string | null)[][] = [];
  const {timeTable, route: routeList} = shuttleSchedule;
  for (let i = 0; i < timeTable.length; i += 2) {
    timeTableRows.push([timeTable[i], timeTable[i + 1] ?? null]);
  }

  return (
    <AppScreenLayout disableTopInset>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* 운행 시간표 헤더 */}
          <View style={styles.timeHeader}>
            <Text style={styles.sectionTitle}>운행 시간표</Text>
            <Text style={styles.noticeText}>
              * 각 시간별로 인문대 앞에서 출발
            </Text>
          </View>
          {/* 시간표 그리드 */}
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
                      ]}>
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
                          ]}>
                          {time}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.timeCell, {opacity: 0}]} key={j} />
                  ),
                )}
              </View>
            ))}
          </View>
          {/* 승차장/노선 타임라인 */}
          <Text style={styles.stationTitle}>승차장</Text>
          <View style={styles.routeList}>
            {routeList.map((item, index) => {
              const isCurrent = item === currentStopName;
              const isFirst = index === 0;
              const isLast = index === routeList.length - 1;
              return (
                <View style={styles.routeRow} key={item + index}>
                  <View style={styles.timeline}>
                    {!isFirst && <View style={styles.lineTop} />}
                    {isCurrent ? (
                      <Image
                        source={require('../../assets/category-tabs/shuttle-bus-marker.png')}
                        style={styles.timelineImage}
                      />
                    ) : (
                      <View style={styles.circle} />
                    )}
                    {!isLast && <View style={styles.lineBottom} />}
                  </View>
                  <Text
                    style={[styles.stopName, isCurrent && styles.departure]}>
                    {item}
                    {isLast && <Text style={styles.arrival}> 회차</Text>}
                  </Text>
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
  scrollContent: {flexGrow: 1},
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
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
    // paddingHorizontal: 8,
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
  arrival: {
    marginLeft: 7,
    fontSize: 12,
    fontWeight: '500',
    color: colors.GRAY_500,
  },
});

export default ShuttleDetailScreen;
