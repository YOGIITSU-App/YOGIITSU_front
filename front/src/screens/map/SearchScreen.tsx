import React, {useState} from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {TMAP_API_KEY} from '@env'; // ✅ .env에서 API 키 가져오기!
import {mapNavigation} from '../../constants/navigation'; // ✅ 네비게이션 이름 상수 가져오기

// 네비게이션 타입 지정
type SearchScreenNavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.SEARCH
>;

function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Tmap 장소 검색 API 호출
  const fetchSearchResults = async (query: string) => {
    if (!query) return;
    setLoading(true);

    try {
      const response = await axios.get(
        `https://apis.openapi.sk.com/tmap/pois?version=1&searchKeyword=${query}&resCoordType=WGS84GEO&reqCoordType=WGS84GEO&count=10`,
        {
          headers: {appKey: TMAP_API_KEY},
        },
      );

      const pois = response.data?.searchPoiInfo?.pois?.poi || [];
      setSearchResults(pois);
    } catch (error) {
      console.error('Tmap API 호출 오류:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 장소 선택 시 `MapHomeScreen`으로 이동하여 BottomSheet 표시
  const handleSelectPlace = (place: any) => {
    if (!place.frontLat || !place.frontLon) return;

    navigation.navigate(mapNavigation.MAPHOME, {
      startLocation: `${place.frontLat},${place.frontLon}`, // ✅ 선택한 장소 좌표 전달
      selectedPlace: place.name, // ✅ 선택한 장소명 전달
    });
  };

  return (
    <View style={styles.container}>
      {/* ✅ 검색 입력창 */}
      <TextInput
        style={styles.input}
        placeholder="장소 검색"
        value={searchText}
        onChangeText={text => {
          setSearchText(text);
          fetchSearchResults(text);
        }}
        keyboardType="default"
        autoCorrect={false}
      />

      {/* ✅ 로딩 표시 */}
      {loading && <ActivityIndicator size="large" color="#007AFF" />}

      {/* ✅ 검색 결과 리스트 */}
      <FlatList
        data={searchResults}
        keyExtractor={(item, index) => `${item.id || item.name}-${index}`}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSelectPlace(item)}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.addressText}>
              {item.newAddressList?.newAddress[0]?.fullAddress ||
                `${item.upperAddrName} ${item.middleAddrName}`}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: 'white'},
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 18,
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {fontSize: 16, fontWeight: 'bold'},
  addressText: {fontSize: 14, color: '#666'},
});

export default SearchScreen;
