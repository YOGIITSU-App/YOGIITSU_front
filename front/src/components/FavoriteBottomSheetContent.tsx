import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
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
}

export default function FavoriteBottomSheetContent({
  favorites,
  onRefresh,
  onSelect,
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
      {favorites.length === 0 ? (
        <Text style={{marginTop: 10}}>등록된 즐겨찾기가 없어요.</Text>
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
