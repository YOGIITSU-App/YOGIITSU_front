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
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {TMAP_API_KEY} from '@env';
import {mapNavigation} from '../../constants/navigation';

type SearchScreenNavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.SEARCH
>;

// 검색 화면의 파라미터 타입을 정의 (selectionType 전달)
type SearchScreenRouteProp = RouteProp<
  MapStackParamList,
  typeof mapNavigation.SEARCH
>;

function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute<SearchScreenRouteProp>();

  // 전달된 selectionType (없으면 기본 'start')
  const selectionType = route.params?.selectionType || 'start';

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSearchResults = async (query: string) => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://apis.openapi.sk.com/tmap/pois?version=1&searchKeyword=${query}&resCoordType=WGS84GEO&reqCoordType=WGS84GEO&count=10`,
        {headers: {appKey: TMAP_API_KEY}},
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

  const handleSelectPlace = (place: any) => {
    if (!place.frontLat || !place.frontLon) return;
    // 전달받은 selectionType을 그대로 사용
    navigation.navigate(mapNavigation.MAPHOME, {
      startLocation: `${place.frontLat},${place.frontLon}`,
      selectedPlace: place.name,
      selectionType: selectionType, // 'start' 또는 'end'
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="장소 검색"
        value={searchText}
        onChangeText={text => {
          setSearchText(text);
          fetchSearchResults(text);
        }}
        autoCorrect={false}
      />
      {loading && <ActivityIndicator size="large" color="#007AFF" />}
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
  item: {padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee'},
  itemText: {fontSize: 16, fontWeight: 'bold'},
  addressText: {fontSize: 14, color: '#666'},
});

export default SearchScreen;
