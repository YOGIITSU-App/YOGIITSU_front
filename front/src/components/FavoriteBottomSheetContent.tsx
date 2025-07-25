import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import favoriteApi from '../api/favoriteApi';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../constants/navigation';
import {colors} from '../constants';

type FavoriteItem = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

interface Props {
  favorites: FavoriteItem[];
  onRefresh: () => void; // 리스트 갱신
  onSelect: (item: FavoriteItem) => void;
  isLoading?: boolean;
}

export default function FavoriteBottomSheetContent({
  favorites,
  onRefresh,
  onSelect,
  isLoading = false,
}: Props) {
  const navigation = useNavigation<StackNavigationProp<MapStackParamList>>();

  const handleRemove = async (buildingId: number) => {
    try {
      await favoriteApi.removeFavorite(buildingId);
      onRefresh();
    } catch {
      Alert.alert('에러', '즐겨찾기 해제에 실패했어요');
    }
  };

  const handlePreview = (buildingId: number) => {
    navigation.navigate(mapNavigation.BUILDING_PREVIEW, {buildingId});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>즐겨찾기</Text>
      {isLoading ? (
        <View style={{alignItems: 'center', paddingVertical: 24}}>
          <ActivityIndicator size="large" color={colors.BLUE_500} />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../assets/favorite-bookmark-icon.png')}
              style={styles.warningIcon}
            />
          </View>
          <Text style={styles.emptyTitle}>즐겨찾기 내역이 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            관심있는 장소를 즐겨찾기 해보세요!
          </Text>
          <Text style={styles.emptySubtitle}>
            건물 정보에서 북마커를 눌러 추가할 수 있어요
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => handleRemove(item.id)}
                style={styles.iconBox}>
                <Image
                  source={require('../assets/favorite-bookmark-icon.png')}
                  style={styles.favoriteIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{flex: 1}}
                onPress={() => handlePreview(item.id)}>
                <Text style={styles.name}>{item.name}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onSelect(item)}
                style={styles.iconBox}>
                <Image
                  source={require('../assets/start-icon.png')}
                  style={styles.startIcon}
                />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 10},
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    borderRadius: 50,
    padding: 13,
    marginBottom: 10,
  },
  warningIcon: {
    width: 36,
    height: 36,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.BLACK_700,
    marginBottom: 13,
    lineHeight: 27,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.GRAY_500,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconBox: {
    paddingHorizontal: 10,
  },
  favoriteIcon: {
    width: 26,
    height: 26,
  },
  startIcon: {
    width: 28,
    height: 28,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.BLACK_700,
  },
});
