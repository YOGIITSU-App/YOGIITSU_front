import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import searchApi, {SearchSuggestion} from '../../api/searchApi';
import buildingApi from '../../api/buildingApi';
import {colors} from '../../constants/colors';

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
  const [recentKeywords, setRecentKeywords] = useState<string[]>([]);

  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = async () => {
    try {
      const res = await searchApi.getRecentKeywords();
      setRecentKeywords(res.data.map(item => item.keyword));
    } catch (err) {
      console.warn('최근 검색어 로드 실패', err);
    }
  };

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
      await searchApi.saveKeyword(item.keyword);

      const buildingId = item.buildingId;
      const detailRes = await buildingApi.getBuildingDetail(buildingId);
      const info = detailRes.data.buildingInfo;
      const location = `${info.latitude},${info.longitude}`;
      const name = info.name;

      if (fromResultScreen) {
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
      Alert.alert('오류', '건물 정보를 불러오는 데 실패했어요 😢');
    }
  };

  const handleClearAll = () => {
    setRecentKeywords([]);
    // 서버에도 삭제 요청이 필요한 경우 API 추가예정
  };

  const handleClearOne = (keyword: string) => {
    setRecentKeywords(prev => prev.filter(item => item !== keyword));
    // 삭제 요청이 필요한 경우 API 추가예정
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBoxWrapper}>
        <View style={styles.searchBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            {/* <Text style={styles.backIcon}>{'<'}</Text> */}
            <Image
              source={require('../../assets/back-icon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="단과대 검색"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={text => {
              setSearchText(text);
              if (text.trim() === '') {
                setResults([]);
                return;
              }
              fetchSuggestions(text);
            }}
            onSubmitEditing={() => {
              if (searchText.trim()) {
                searchApi.saveKeyword(searchText);
                fetchSuggestions(searchText);
              }
            }}
            autoFocus
            autoCorrect={false}
          />
        </View>
      </View>
      <View style={styles.divider} />
      {loading && <ActivityIndicator size="large" color="#007AFF" />}
      <View style={styles.content}>
        {searchText.trim() === '' ? (
          recentKeywords.length > 0 ? (
            <FlatList
              data={recentKeywords}
              keyExtractor={(item, index) => `${item}-${index}`}
              ListHeaderComponent={
                <View style={styles.recentHeader}>
                  <Text style={styles.recentTitle}>최근검색</Text>
                  <TouchableOpacity onPress={handleClearAll}>
                    <Text style={styles.clearText}>전체삭제</Text>
                  </TouchableOpacity>
                </View>
              }
              renderItem={({item}) => (
                <View style={styles.recentItem}>
                  <TouchableOpacity
                    style={styles.recentKeyword}
                    onPress={() => {
                      setSearchText(item);
                      fetchSuggestions(item);
                    }}>
                    <Text style={styles.itemText}>{item}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleClearOne(item)}>
                    <Text style={styles.clearIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Image
                source={require('../../assets/Warning-icon-gray.png')}
                style={styles.warningIcon}
              />
              <Text style={styles.emptyText}>최근 검색어가 없습니다</Text>
            </View>
          )
        ) : (
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
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'white'},
  searchBoxWrapper: {
    backgroundColor: colors.GRAY_100,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  backIcon: {
    width: 9,
    height: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0, // 안드로이드 높이 보정
    color: colors.BLACK_500,
    textAlignVertical: 'center',
  },
  divider: {
    height: 1,
    marginTop: 15,
    backgroundColor: colors.GRAY_50,
  },
  content: {
    flex: 1,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.GRAY_800,
  },
  tagText: {fontSize: 12, color: colors.GRAY_800, marginTop: 4},

  // 최근 검색어 관련
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.BLACK_700,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.GRAY_800,
  },
  clearIcon: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.GRAY_450,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_100,
  },
  recentKeyword: {
    flex: 1,
  },

  // 비어있을 때
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  warningIcon: {
    width: 38,
    height: 38,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ccc',
  },
});

export default SearchScreen;
