import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ImageSourcePropType,
} from 'react-native';
import {colors} from '../constants';

type Facility = {
  name: string;
  floor: string;
};

type Props = {
  facilities: Facility[];
};

const facilityIconMap: {[key: string]: ImageSourcePropType} = {
  카페: require('../assets/facilities-icon/cafe.png'),
  편의점: require('../assets/facilities-icon/convenience-store.png'),
  기숙사: require('../assets/facilities-icon/dormitory.png'),
  엘리베이터: require('../assets/facilities-icon/elevator.png'),
  헬스장: require('../assets/facilities-icon/gym.png'),
  주차장: require('../assets/facilities-icon/parking.png'),
  프린터기: require('../assets/facilities-icon/printer.png'),
  열람실: require('../assets/facilities-icon/reading-room.png'),
  식당: require('../assets/facilities-icon/restaurant.png'),
  스터디룸: require('../assets/facilities-icon/studyroom.png'),
  자판기: require('../assets/facilities-icon/vending-machine.png'),
  정수기: require('../assets/facilities-icon/water-purifier.png'),
};

const defaultIcon = require('../assets/facilities-icon/vending-machine.png');

export const FacilityBadge = ({facilities}: Props) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        {facilities.map(fac => {
          const icon = facilityIconMap[fac.name] || defaultIcon;
          return (
            <View key={fac.name} style={styles.badge}>
              <Image source={icon} style={styles.icon} />
              <Text style={styles.label} numberOfLines={1}>
                {fac.name}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
    // width: '100%',
    alignItems: 'flex-start',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BLUE_100,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 13,
    marginRight: 8,
    marginBottom: 10,
  },
  icon: {
    width: 13,
    height: 13,
    resizeMode: 'contain',
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    color: colors.BLUE_700,
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default FacilityBadge;
