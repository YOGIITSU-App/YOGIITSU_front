import React from 'react';
import {View, Text, Image, StyleSheet, ImageSourcePropType} from 'react-native';
import {colors} from '../constants';

type Facility = {
  name: string;
  floor?: string;
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

const FacilityList = ({facilities}: Props) => (
  <View style={styles.wrapper}>
    <View style={styles.row}>
      {facilities.map(fac => {
        const icon = facilityIconMap[fac.name] || defaultIcon;
        return (
          <View key={fac.name + (fac.floor || '')} style={styles.item}>
            <Image source={icon} style={styles.icon} />
            <Text style={styles.label}>
              {fac.name}
              {fac.floor && fac.floor !== 'NULL' && (
                <Text style={styles.label}> ({fac.floor})</Text>
              )}
            </Text>
          </View>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    width: '100%',
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 20,
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    color: colors.BLUE_700,
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default FacilityList;
