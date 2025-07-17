import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {colors} from '../constants';
import {defaultFacilityIcon, facilityIconMap} from '../constants/facilityIcons';

type Facility = {
  name: string;
  floor?: string;
};

type Props = {
  facilities: Facility[];
};

const FacilityBadgeWithFloor = ({facilities}: Props) => (
  <View style={styles.wrapper}>
    <View style={styles.row}>
      {facilities.map(fac => {
        const icon = facilityIconMap[fac.name] || defaultFacilityIcon;
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

export default FacilityBadgeWithFloor;
