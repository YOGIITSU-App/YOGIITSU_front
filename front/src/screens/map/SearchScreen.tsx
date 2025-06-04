import React, {useState} from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import searchApi, {SearchSuggestion} from '../../api/searchApi';
import buildingApi from '../../api/buildingApi';

type SearchScreenNavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.SEARCH
>;

type SearchScreenRouteProp = RouteProp<
  MapStackParamList,
  typeof mapNavigation.SEARCH
>;

function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute<SearchScreenRouteProp>();
  const selectionType = route.params?.selectionType || 'start';
  const fromResultScreen = route.params?.fromResultScreen || false;

  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (query: string) => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await searchApi.getSuggestions(query);
      setResults(res.data);
    } catch (err) {
      console.error('검색 오류:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = async (item: SearchSuggestion) => {
    try {
      const buildingId = item.buildingId;
      const detailRes = await buildingApi.getBuildingDetail(buildingId);
      const info = detailRes.data.buildingInfo;
      const location = `${info.latitude},${info.longitude}`;
      const name = info.name;

      if (fromResultScreen) {
        // 결과 화면에서 왔을 경우: replace로 갱신
        if (selectionType === 'start') {
          navigation.replace(mapNavigation.ROUTE_RESULT, {
            startLocation: location,
            startLocationName: name,
            startBuildingId: buildingId,
            endLocation: route.params?.previousEndLocation ?? '',
            endLocationName: route.params?.previousEndLocationName ?? '',
            endBuildingId: route.params?.endBuildingId,
          });
        } else {
          navigation.replace(mapNavigation.ROUTE_RESULT, {
            endLocation: location,
            endLocationName: name,
            endBuildingId: buildingId,
            startLocation: route.params?.previousStartLocation ?? '',
            startLocationName: route.params?.previousStartLocationName ?? '',
            startBuildingId: route.params?.startBuildingId,
          });
        }
      } else {
        // 일반 흐름: 프리뷰로 이동 + 고유 key
        if (selectionType === 'start') {
          navigation.navigate({
            name: mapNavigation.BUILDING_PREVIEW,
            key: `preview-${buildingId}`,
            params: {
              buildingId,
              endLocation: route.params?.previousEndLocation ?? '',
              endLocationName: route.params?.previousEndLocationName ?? '',
            },
          });
        } else {
          navigation.navigate({
            name: mapNavigation.BUILDING_PREVIEW,
            key: `preview-${buildingId}`,
            params: {
              buildingId,
              startLocation: route.params?.previousStartLocation ?? '',
              startLocationName: route.params?.previousStartLocationName ?? '',
            },
          });
        }
      }
    } catch (error) {
      Alert.alert('오류', '건물 정보를 불러오는 데 실패했습니다');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="건물명 또는 키워드 입력"
        value={searchText}
        onChangeText={text => {
          setSearchText(text);
          if (text.trim() === '') {
            setResults([]);
            return;
          }
          fetchSuggestions(text);
        }}
        autoCorrect={false}
      />
      {loading && <ActivityIndicator size="large" color="#007AFF" />}
      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.keyword}-${index}`}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSelectSuggestion(item)}>
            <Text style={styles.itemText}>{item.keyword}</Text>
            <Text style={styles.tagText}>
              {Array.isArray(item.tags)
                ? item.tags.map(t => `#${t}`).join(' ')
                : ''}
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
  tagText: {fontSize: 14, color: '#999', marginTop: 4},
});

export default SearchScreen;
