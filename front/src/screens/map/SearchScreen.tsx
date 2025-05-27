import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import searchApi, {SearchSuggestion} from '../../api/searchApi';
import {defaultTabOptions} from '../../constants/tabOptions';

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

  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({tabBarStyle: {display: 'none'}});

    return () => {
      parent?.setOptions({tabBarStyle: defaultTabOptions.tabBarStyle});
    };
  }, [navigation]);

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

  const handleSelectSuggestion = (item: SearchSuggestion) => {
    const commonParams = {
      buildingId: item.buildingId,
    };

    if (selectionType === 'start') {
      navigation.navigate(mapNavigation.BUILDING_PREVIEW, {
        ...commonParams,
        endLocation: route.params?.previousEndLocation ?? '',
        endLocationName: route.params?.previousEndLocationName ?? '',
      });
    } else {
      navigation.navigate(mapNavigation.BUILDING_PREVIEW, {
        ...commonParams,
        startLocation: route.params?.previousStartLocation ?? '',
        startLocationName: route.params?.previousStartLocationName ?? '',
      });
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
