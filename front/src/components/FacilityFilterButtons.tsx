import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { colors } from '../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CategoryItem = {
  type: string;
  label: string;
  icon: ImageSourcePropType;
  activeColor: string; // 선택됐을 때 배경색
  iconSize?: {
    width: number;
    height: number;
  };
};

type Props = {
  selected: string | null;
  onSelect: (category: string | null) => void;
};

const deviceWidth = Dimensions.get('screen').width;

const categories: CategoryItem[] = [
  {
    type: 'SHUTTLE_BUS',
    label: '셔틀버스',
    icon: require('../assets/category-tabs/shuttle-bus.png'),
    activeColor: colors.BLUE_700,
    iconSize: { width: 16, height: 17 },
  },
  {
    type: 'PARKING',
    label: '주차',
    icon: require('../assets/category-tabs/parking.png'),
    activeColor: colors.YELLOW_700,
    iconSize: { width: 17, height: 17 },
  },
  {
    type: 'RESTAURANT',
    label: '식당',
    icon: require('../assets/category-tabs/restaurant.png'),
    activeColor: colors.BLUE_700,
    iconSize: { width: 16, height: 18 },
  },
  {
    type: 'CONVENIENCE_CAFE',
    label: '카페 및 편의점',
    icon: require('../assets/category-tabs/cafe.png'),
    activeColor: colors.YELLOW_700,
    iconSize: { width: 18, height: 16 },
  },
  {
    type: 'PRINTER',
    label: '프린터기',
    icon: require('../assets/category-tabs/printer.png'),
    activeColor: colors.BLUE_700,
    iconSize: { width: 16, height: 16 },
  },
];

export const FacilityFilterButtons = ({ selected, onSelect }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { top: insets.top + 80 }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {categories.map(({ type, label, icon, activeColor, iconSize }) => {
          const isSelected = selected === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => onSelect(selected === type ? null : type)}
              style={[
                styles.button,
                isSelected && { backgroundColor: activeColor },
              ]}
            >
              <Image
                key={`${type}-${isSelected ? 'on' : 'off'}`}
                source={icon}
                style={[
                  styles.icon,
                  iconSize,
                  isSelected && { tintColor: 'white' },
                ]}
              />
              <Text style={[styles.label, isSelected && { color: 'white' }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 80,
    width: '100%',
    zIndex: 10,
  },
  container: {
    paddingHorizontal: deviceWidth * 0.05,
    flexDirection: 'row',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    elevation: 3,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    color: colors.BLACK_700,
    fontWeight: '600',
  },
});
