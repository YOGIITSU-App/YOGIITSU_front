import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {ShuttleSchedule} from '../api/shuttleApi';
import {colors} from '../constants';

type Props = {
  data: ShuttleSchedule;
  currentStopName: string;
};

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

const ShuttleBottomSheet = ({data, currentStopName}: Props) => {
  const nearestTime = data.nextShuttleTime[0];
  const extendedRoute = data.route;

  return (
    <View style={styles.container}>
      {/* 시간 선택 */}
      <View style={styles.timeSelector}>
        {data.nextShuttleTime.map(time => {
          const isNearest = time === nearestTime;
          return (
            <View
              key={time}
              style={[styles.timeButton, isNearest && styles.timeButtonActive]}>
              <View style={styles.timeButtonContent}>
                <Image
                  source={require('../assets/category-tabs/shuttle-bus.png')}
                  style={[styles.busIcon, isNearest && styles.busIconActive]}
                />
                <Text
                  style={[
                    styles.timeButtonText,
                    isNearest && styles.timeButtonTextActive,
                  ]}>
                  {time}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.message}>* 위의 시간은 인문대 승차시간 기준</Text>
      {/* 노선 타임라인 */}
      <FlatList
        data={extendedRoute}
        keyExtractor={(item, index) => `${index}-${item}`}
        contentContainerStyle={{paddingTop: 12}}
        renderItem={({item, index}) => {
          const isFirst = index === 0;
          const isLast = index === extendedRoute.length - 1;
          const isCurrentStop = item === currentStopName;

          return (
            <View style={styles.routeRow}>
              {/* 타임라인 선 + 점 */}
              <View style={styles.timeline}>
                {!isFirst && <View style={styles.lineTop} />}
                {isCurrentStop ? (
                  <Image
                    source={require('../assets/category-tabs/shuttle-bus-marker.png')}
                    style={styles.timelineImage}
                  />
                ) : (
                  <View style={styles.circle} />
                )}
                {!isLast && <View style={styles.lineBottom} />}
              </View>
              {/* 정류장 이름 */}
              <View style={styles.stopTextWrapper}>
                <Text
                  style={[styles.stopName, isCurrentStop && styles.departure]}>
                  {item}
                </Text>
                {isLast && <Text style={styles.arrival}> 회차</Text>}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
    gap: 12,
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
  circleActive: {
    borderColor: colors.BLUE_700,
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
  arrival: {
    marginLeft: 7,
    fontSize: 12,
    fontWeight: '500',
    color: colors.GRAY_500,
  },
});

export default ShuttleBottomSheet;
