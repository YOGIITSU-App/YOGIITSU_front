import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {colors} from '../../constants';
import {fetchShortcuts, ShortcutSummary} from '../../api/shortcutApi';

type NavigationProp = StackNavigationProp<MapStackParamList, 'ShortcutList'>;

export default function ShortcutListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [shortcuts, setShortcuts] = useState<ShortcutSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShortcuts()
      .then(setShortcuts)
      .catch(err => console.warn('지름길 리스트 불러오기 실패:', err))
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (shortcutId: number) => {
    switch (shortcutId) {
      case 1:
        return require('../../assets/shortcut/gym.png');
      case 2:
        return require('../../assets/shortcut/dormitory.png');
      case 3:
        return require('../../assets/shortcut/byway-root.png');
    }
  };

  const renderItem = ({item}: {item: ShortcutSummary}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        navigation.navigate('ShortcutDetail', {shortcutId: item.shortcutId});
        console.log(item.shortcutId);
      }}>
      <View style={styles.iconWrapper}>
        <Image source={getIcon(item.shortcutId)} style={styles.icon} />
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

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.BLUE_700} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={shortcuts}
        keyExtractor={item => item.shortcutId.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
