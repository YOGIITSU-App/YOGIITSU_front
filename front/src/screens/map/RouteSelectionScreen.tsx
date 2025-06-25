import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import searchApi from '../../api/searchApi';
import {colors} from '../../constants/colors';

type RouteSelectionScreenNavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.ROUTE_SELECTION
>;
type RouteSelectionScreenRouteProp = RouteProp<
  MapStackParamList,
  typeof mapNavigation.ROUTE_SELECTION
>;

function RouteSelectionScreen() {
  const navigation = useNavigation<RouteSelectionScreenNavigationProp>();
  const route = useRoute<RouteSelectionScreenRouteProp>();

  const [startLocation, setStartLocation] = useState('');
  const [startLocationName, setStartLocationName] = useState('출발지 선택');
  const [endLocation, setEndLocation] = useState('');
  const [endLocationName, setEndLocationName] = useState('도착지 선택');
  const [startBuildingId, setStartBuildingId] = useState<number | null>(null);
  const [endBuildingId, setEndBuildingId] = useState<number | null>(null);

  const [recentKeywords, setRecentKeywords] = useState<string[]>([]);

  // 초기 파라미터 세팅
  useEffect(() => {
    const {
      startLocation,
      startLocationName,
      startBuildingId,
      endLocation,
      endLocationName,
      endBuildingId,
    } = route.params ?? {};

    if (startLocation !== undefined) {
      setStartLocation(startLocation);
      setStartLocationName(startLocationName || '출발지 선택');
    }
    if (startBuildingId !== undefined) setStartBuildingId(startBuildingId);

    if (endLocation !== undefined) {
      setEndLocation(endLocation);
      setEndLocationName(endLocationName || '도착지 선택');
    }
    if (endBuildingId !== undefined) setEndBuildingId(endBuildingId);
  }, [route.params]);

  // 출발지/도착지 둘 다 있으면 결과화면으로 이동
  useEffect(() => {
    if (startLocation && endLocation) {
      requestAnimationFrame(() => {
        navigation.navigate(mapNavigation.ROUTE_RESULT, {
          startLocation,
          startLocationName,
          endLocation,
          endLocationName,
          startBuildingId: startBuildingId ?? undefined,
          endBuildingId: endBuildingId ?? undefined,
        });
      });
    }
  }, [startLocation, endLocation]);

  // 최근 검색어 불러오기
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const res = await searchApi.getRecentKeywords();
        setRecentKeywords(res.data.map(item => item.keyword));
      } catch (err) {
        console.warn('최근 검색어 로드 실패', err);
      }
    };
    loadRecent();
  }, []);

  // 검색화면 이동
  const handleSearchLocation = (type: 'start' | 'end') => {
    navigation.push(mapNavigation.SEARCH, {
      selectionType: type,
      fromResultScreen: false,
      previousStartLocation: startLocation,
      previousStartLocationName: startLocationName,
      previousEndLocation: endLocation,
      previousEndLocationName: endLocationName,
      startBuildingId: startBuildingId ?? undefined,
      endBuildingId: endBuildingId ?? undefined,
    });
  };

  // 출발지/도착지 swap
  const swapLocations = () => {
    const swappedStartLocation = endLocation;
    const swappedEndLocation = startLocation;

    const swappedStartName =
      endLocation === '' || endLocationName === '도착지 선택'
        ? '출발지 선택'
        : endLocationName;

    const swappedEndName =
      startLocation === '' || startLocationName === '출발지 선택'
        ? '도착지 선택'
        : startLocationName;

    setStartLocation(swappedStartLocation);
    setStartLocationName(swappedStartName);
    setStartBuildingId(endBuildingId);

    setEndLocation(swappedEndLocation);
    setEndLocationName(swappedEndName);
    setEndBuildingId(startBuildingId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.selectBoxWrapper}>
        {/* 출발지 */}
        <TouchableOpacity
          style={styles.inputWrapper}
          onPress={() => handleSearchLocation('start')}>
          <View style={styles.inputInner}>
            <Text
              style={[
                styles.inputText,
                startLocationName === '출발지 선택' && styles.placeholderText,
              ]}>
              {startLocationName}
            </Text>
            {startLocation && !endLocation && (
              <TouchableOpacity onPress={swapLocations}>
                <Image
                  source={require('../../assets/swap.png')}
                  style={styles.swapIcon}
                />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        {/* 도착지 */}
        <TouchableOpacity
          style={styles.inputWrapper}
          onPress={() => handleSearchLocation('end')}>
          <View style={styles.inputInner}>
            <Text
              style={[
                styles.inputText,
                endLocationName === '도착지 선택' && styles.placeholderText,
              ]}>
              {endLocationName}
            </Text>
            {endLocation && !startLocation && (
              <TouchableOpacity onPress={swapLocations}>
                <Image
                  source={require('../../assets/swap.png')}
                  style={styles.swapIcon}
                />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* 최근 검색어 리스트 */}
      {recentKeywords.length > 0 && (
        <View style={styles.recentWrapper}>
          <Text style={styles.recentTitle}>최근 검색어</Text>
          {recentKeywords.map((item, index) => (
            <View key={`${item}-${index}`} style={styles.recentItem}>
              <TouchableOpacity
                style={styles.recentKeyword}
                onPress={() => {
                  if (!startLocation) {
                    setStartLocation(item);
                    setStartLocationName(item);
                  } else if (!endLocation) {
                    setEndLocation(item);
                    setEndLocationName(item);
                  }
                }}>
                <Text style={styles.recentText}>{item}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setRecentKeywords(prev =>
                    prev.filter(keyword => keyword !== item),
                  )
                }>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  selectBoxWrapper: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.BLACK_500,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.GRAY_700,
  },
  swapIcon: {
    width: 15,
    height: 17,
    tintColor: colors.GRAY_450,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.GRAY_50,
  },

  // 최근 검색어 스타일
  recentWrapper: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: colors.GRAY_800,
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
  recentText: {
    fontSize: 15,
    color: colors.GRAY_800,
  },
  clearIcon: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.GRAY_450,
  },
});

export default RouteSelectionScreen;
