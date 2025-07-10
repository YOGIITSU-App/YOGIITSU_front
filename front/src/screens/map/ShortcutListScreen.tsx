import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {colors} from '../../constants';

type Shortcut = {
  shortcutId: number;
  pointA: string;
  pointB: string;
  distance: number;
  duration: number;
  icon: any;
};

type NavigationProp = StackNavigationProp<MapStackParamList, 'ShortcutList'>;

const mockShortcuts: Shortcut[] = [
  {
    shortcutId: 1,
    pointA: '학군단',
    pointB: '법정대학',
    distance: 500,
    duration: 360, // 초 단위 (분으로 나눌거니까!)
    icon: require('../../assets/shortcut/rotc.png'),
  },
  {
    shortcutId: 2,
    pointA: '기숙사',
    pointB: 'IT 3층',
    distance: 480,
    duration: 300,
    icon: require('../../assets/shortcut/dormitory.png'),
  },
  {
    shortcutId: 3,
    pointA: '알촌 입구',
    pointB: 'IT 샛길',
    distance: 450,
    duration: 300,
    icon: require('../../assets/shortcut/byway-root.png'),
  },
  {
    shortcutId: 4,
    pointA: '쪽문',
    pointB: '미래 2층',
    distance: 300,
    duration: 240,
    icon: require('../../assets/shortcut/side-door.png'),
  },
  {
    shortcutId: 5,
    pointA: '체대',
    pointB: '계단으로 미혁',
    distance: 420,
    duration: 360,
    icon: require('../../assets/shortcut/gym.png'),
  },
  {
    shortcutId: 6,
    pointA: '외부(예담)',
    pointB: '공대 입구',
    distance: 520,
    duration: 420,
    icon: require('../../assets/shortcut/engineering.png'),
  },
];

export default function ShortcutListScreen() {
  const navigation = useNavigation<NavigationProp>();

  const renderItem = ({item}: {item: Shortcut}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('ShortcutDetail', {shortcutId: item.shortcutId})
      }>
      <View style={styles.iconWrapper}>
        <Image source={item.icon} style={styles.icon} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>
          {item.pointA} ↔ {item.pointB}
        </Text>
        <Text style={styles.sub}>
          {item.distance}m · 약 {item.duration}분 소요
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockShortcuts}
        keyExtractor={item => item.shortcutId.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  list: {padding: 16},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrapper: {
    width: 55,
    height: 55,
    backgroundColor: colors.BLUE_100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  info: {
    flex: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK_900,
    marginBottom: 6,
  },
  sub: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.BLUE_700,
  },
});
