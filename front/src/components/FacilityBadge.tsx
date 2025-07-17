import React from 'react';
import {View, Text, Image, StyleSheet, ScrollView} from 'react-native';
import {colors} from '../constants';
import {defaultFacilityIcon, facilityIconMap} from '../constants/facilityIcons';

type Facility = {
  name: string;
  floor: string;
};

type Props = {
  facilities: Facility[];
};

export const FacilityBadge = ({facilities}: Props) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        {facilities.map(fac => {
          const icon = facilityIconMap[fac.name] || defaultFacilityIcon;
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
