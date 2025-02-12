import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';

type SearchScreenNavigationProp = StackNavigationProp<
  MapStackParamList,
  'Search'
>;
type SearchScreenRouteProp = RouteProp<MapStackParamList, 'Search'>;

function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute<SearchScreenRouteProp>();

  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // 최근 검색 기록 불러오기
  useEffect(() => {
    const loadSearchHistory = async () => {
      const savedSearches = await AsyncStorage.getItem('recentSearches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    };
    loadSearchHistory();
  }, []);

  // 검색어 선택 시 기록 저장 후 이동
  const handleSelect = async (place: string) => {
    const newSearches = [
      place,
      ...recentSearches.filter(item => item !== place),
    ];
    setRecentSearches(newSearches);
    await AsyncStorage.setItem('recentSearches', JSON.stringify(newSearches));

    navigation.navigate('MapHome', {selectedPlace: place});
  };

  return (
    <View style={styles.container}>
      {/* 검색 입력창 */}
      <TextInput
        style={styles.input}
        placeholder="장소 검색"
        value={searchText}
        onChangeText={setSearchText}
        keyboardType="default" // ✅ 한국어 입력 가능하도록 설정
        multiline={false} // ✅ 한 줄 입력만 가능하도록 설정
      />

      {/* 최근 검색 목록 */}
      <FlatList
        data={recentSearches}
        keyExtractor={item => item}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSelect(item)}>
            <Text style={styles.itemText}>{item}</Text>
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
  itemText: {fontSize: 16},
});

export default SearchScreen;
