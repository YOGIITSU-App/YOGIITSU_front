import React, {useState, useEffect, useRef} from 'react';
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
import searchApi, {RecentKeyword, SearchSuggestion} from '../../api/searchApi';
import {useSelectBuilding} from '../../hooks/useSelectBuilding';
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
  const [searchText, setSearchText] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentKeywords, setRecentKeywords] = useState<RecentKeyword[]>([]);

  // 유틸 훅 가져오기
  const {onSelect} = useSelectBuilding();

  useEffect(() => {
    loadRecent();
  }, []);

  async function loadRecent() {
    try {
      const res = await searchApi.getRecentKeywords();
      setRecentKeywords(res.data);
    } catch (err) {
      console.warn('최근 검색어 로드 실패', err);
    }
  }

  const fetchSuggestionsDebounced = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 200);
  };

  async function fetchSuggestions(query: string) {
    if (!query) return;
    setLoading(true);
    try {
      const res = await searchApi.getSuggestions(query);
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBoxWrapper}>
        <View style={styles.searchBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
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
              if (text.trim()) {
                fetchSuggestionsDebounced(text);
              } else {
                setResults([]);
              }
            }}
            onSubmitEditing={() => {
              if (searchText.trim()) fetchSuggestions(searchText);
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
          // 검색어가 비어 있으면 '최근 검색어' 리스트
          recentKeywords.length ? (
            <FlatList
              data={recentKeywords}
              keyExtractor={(item, i) => `${item.keyword}-${i}`}
              ListHeaderComponent={
                <View style={styles.recentHeader}>
                  <Text style={styles.recentTitle}>최근검색</Text>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await searchApi.deleteAllRecentKeywords();
                        setRecentKeywords([]);
                      } catch (err) {
                        Alert.alert('전체 삭제 실패');
                      }
                    }}>
                    <Text style={styles.clearText}>전체삭제</Text>
                  </TouchableOpacity>
                </View>
              }
              renderItem={({item}) => (
                <View style={styles.recentItem}>
                  <TouchableOpacity
                    style={styles.recentKeyword}
                    onPress={() => {
                      setSearchText(item.keyword);
                      onSelect(item.buildingId);
                    }}>
                    <Text style={styles.itemText}>{item.keyword}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await searchApi.deleteRecentKeywordByBuildingId(
                          item.buildingId,
                        );
                        setRecentKeywords(prev =>
                          prev.filter(k => k.buildingId !== item.buildingId),
                        );
                      } catch (err) {
                        Alert.alert('삭제 실패');
                      }
                    }}>
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
          // 검색 텍스트가 있을 때는 추천 결과
          <FlatList
            data={results}
            keyExtractor={(item, i) => `${item.keyword}-${i}`}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => onSelect(item.buildingId)}>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 400,
  },
  warningIcon: {
    width: 32,
    height: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: colors.GRAY_450,
  },
});

export default SearchScreen;
