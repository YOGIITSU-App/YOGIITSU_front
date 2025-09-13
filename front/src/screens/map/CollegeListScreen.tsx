import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAllBuildings, CollegeBuilding } from '../../api/collegeApi';
import { useNavigation } from '@react-navigation/native';
import { colors, mapNavigation } from '../../constants';
import favoriteApi from '../../api/favoriteApi';

export default function CollegeListScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CollegeBuilding[]>([]);
  const nav = useNavigation<any>();

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllBuildings();
        setData(res);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleFavorite = async (id: number, current: boolean) => {
    try {
      if (current) {
        await favoriteApi.removeFavorite(id);
      } else {
        await favoriteApi.addFavorite(id);
      }
      // UI 갱신
      setData(prev =>
        prev.map(item =>
          item.buildingId === id ? { ...item, isFavorite: !current } : item,
        ),
      );
    } catch (e) {
      Alert.alert('에러', '즐겨찾기 처리 중 문제가 발생했습니다.');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={{ height: 12 }} />
      <FlatList
        data={data}
        keyExtractor={i => String(i.buildingId)}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              nav.navigate(mapNavigation.BUILDING_PREVIEW, {
                buildingId: item.buildingId,
              })
            }
          >
            {/* 상단 이미지 */}
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />

            {/* 하단 정보 영역 */}
            <View style={styles.cardFooter}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.buildingName}</Text>
              </View>

              {/* 즐겨찾기 버튼 */}
              <TouchableOpacity
                onPress={() => toggleFavorite(item.buildingId, item.isFavorite)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={styles.bookmarkBtn}
              >
                <Image
                  source={require('../../assets/bookmark-icon.png')}
                  style={[
                    styles.bookmarkIcon,
                    !item.isFavorite && { tintColor: colors.GRAY_700 },
                  ]}
                />
              </TouchableOpacity>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.GRAY_100,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.GRAY_200,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 3 / 1.3,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK_900,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A8F98',
  },
  bookmarkBtn: {
    marginLeft: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  bookmarkIcon: {
    width: 14,
    height: 18,
  },
});
