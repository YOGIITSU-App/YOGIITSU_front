import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../constants';
import {
  defaultFacilityIcon,
  getFacilityIcon,
} from '../constants/facilityIcons';

type Facility = {
  name: string;
  floor?: string;
  type?: string;
};

type Props = {
  facilities: Facility[];
};

const FacilityBadgeWithFloor = ({ facilities }: { facilities: Facility[] }) => (
  <View style={styles.wrapper}>
    <View style={styles.row}>
      {facilities.map(fac => {
        const icon = getFacilityIcon(fac);
        return (
          <View
            key={`${fac.type ?? fac.name}-${fac.floor ?? ''}`}
            style={styles.item}
          >
            <Image source={icon || defaultFacilityIcon} style={styles.icon} />
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
