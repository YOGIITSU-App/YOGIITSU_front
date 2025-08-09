import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  BackHandler,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MapStackParamList } from '../../navigations/stack/MapStackNavigator';
import { mapNavigation } from '../../constants/navigation';
import searchApi, { RecentKeyword } from '../../api/searchApi';
import { colors } from '../../constants/colors';
import buildingApi from '../../api/buildingApi';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import AlertModal from '../../components/AlertModal';
import Geolocation from 'react-native-geolocation-service';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RouteSelectionScreenNavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.ROUTE_SELECTION
>;
type RouteSelectionScreenRouteProp = RouteProp<
  MapStackParamList,
  typeof mapNavigation.ROUTE_SELECTION
>;

function RouteSelectionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RouteSelectionScreenNavigationProp>();
  const route = useRoute<RouteSelectionScreenRouteProp>();
  const hasNavigated = useRef(false);
  const isSwappedRef = useRef(false);

  const [startLocation, setStartLocation] = useState('');
  const [startLocationName, setStartLocationName] = useState('출발지 선택');
  const [endLocation, setEndLocation] = useState('');
  const [endLocationName, setEndLocationName] = useState('도착지 선택');
  const [startBuildingId, setStartBuildingId] = useState<number | null>(null);
  const [endBuildingId, setEndBuildingId] = useState<number | null>(null);
  const [recentKeywords, setRecentKeywords] = useState<RecentKeyword[]>([]);
  const [sameLocationModalVisible, setSameLocationModalVisible] =
    useState(false);
  const [lastSelectedType, setLastSelectedType] = useState<
    'start' | 'end' | null
  >(null);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate(mapNavigation.MAPHOME);
        return true; // 기본 뒤로가기 막음
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => {
        backHandler.remove();
      };
    }, [navigation]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      // "뒤로가기"로 나갈 때만 막기, 그 외(push/replace 등)는 허용
      if (e.data.action.type === 'POP') {
        e.preventDefault();
      }
    });
    return unsubscribe;
  }, [navigation]);

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

  useEffect(() => {
    // 출발지가 없고 도착지만 있을 때
    if (!startLocation && endLocation) {
      // 🔥 swap 이후면 무시
      if (isSwappedRef.current) {
        isSwappedRef.current = false; // 한 번만 막고 바로 false로 돌림
        return;
      }
      Geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          const curLoc = `${latitude},${longitude}`;
          setStartLocation(curLoc);
          setStartLocationName('현재 위치');
          setStartBuildingId(null);

          // 결과 화면으로 바로 이동
          navigation.replace(mapNavigation.ROUTE_RESULT, {
            startLocation: curLoc,
            startLocationName: '현재 위치',
            endLocation,
            endLocationName,
            endBuildingId: endBuildingId ?? undefined,
          });
        },
        err => {
          Alert.alert(
            '위치 오류',
            '현재 위치를 가져올 수 없습니다.\n위치 서비스를 확인해주세요.',
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 },
      );
    }
  }, [startLocation, endLocation]);

  // 출발지/도착지 둘 다 있으면 결과화면으로 이동
  useEffect(() => {
    if (!startLocation || !endLocation) return;

    if (startLocation === endLocation) {
      if (!sameLocationModalVisible) {
        setSameLocationModalVisible(true);
      }
      return;
    }

    if (hasNavigated.current) return;

    hasNavigated.current = true;
    navigation.replace(mapNavigation.ROUTE_RESULT, {
      startLocation,
      startLocationName,
      endLocation,
      endLocationName,
      startBuildingId: startBuildingId ?? undefined,
      endBuildingId: endBuildingId ?? undefined,
    });
  }, [startLocation, endLocation]);

  useEffect(() => {
    const { locationsAreSame = false, lastSelectedType } = route.params ?? {};

    if (locationsAreSame) {
      hasNavigated.current = false;
      if (lastSelectedType) {
        setLastSelectedType(lastSelectedType);
      }
      setSameLocationModalVisible(true);

      navigation.setParams({
        ...route.params,
        locationsAreSame: false,
        lastSelectedType: undefined,
      });
    }
  }, [route.params]);

  // 최근 검색어 불러오기
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const res = await searchApi.getRecentKeywords();
        setRecentKeywords(res.data);
      } catch (err) {
        console.warn('최근 검색어 로드 실패', err);
      }
    };
    loadRecent();
  }, []);

  // 검색화면 이동
  const handleSearchLocation = (type: 'start' | 'end') => {
    setLastSelectedType(type);
    navigation.reset({
      index: 1,
      routes: [
        {
          name: mapNavigation.ROUTE_SELECTION,
          params: {
            startLocation,
            startLocationName,
            startBuildingId: startBuildingId ?? undefined,
            endLocation,
            endLocationName,
            endBuildingId: endBuildingId ?? undefined,
          },
        },
        {
          name: mapNavigation.SEARCH,
          params: {
            selectionType: type,
            fromResultScreen: false,
            previousStartLocation: startLocation,
            previousStartLocationName: startLocationName,
            previousEndLocation: endLocation,
            previousEndLocationName: endLocationName,
            startBuildingId: startBuildingId ?? undefined,
            endBuildingId: endBuildingId ?? undefined,
          },
        },
      ],
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

    // 🔥 스왑 직후 플래그 ON
    isSwappedRef.current = true;
  };

  return (
    <AppScreenLayout disableTopInset>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
          <View style={styles.headerTop}>
            <View style={styles.placeholder} />
            <View style={styles.modeIconWrapper}>
              <Image
                source={require('../../assets/walking-icon2.png')}
                style={{ width: 48, height: 30 }}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => navigation.navigate(mapNavigation.MAPHOME)}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.selectBoxWrapper}>
          {/* 출발지 */}
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => handleSearchLocation('start')}
          >
            <View style={styles.inputInner}>
              <Text
                style={[
                  styles.inputText,
                  startLocationName === '출발지 선택' && styles.placeholderText,
                ]}
              >
                {startLocationName}
              </Text>
              {startLocation && !endLocation && (
                <TouchableOpacity onPress={swapLocations}>
                  <Text style={{ fontSize: 16, color: colors.GRAY_450 }}>
                    ⇅
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>

          {/* 도착지 */}
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => handleSearchLocation('end')}
          >
            <View style={styles.inputInner}>
              <Text
                style={[
                  styles.inputText,
                  endLocationName === '도착지 선택' && styles.placeholderText,
                ]}
              >
                {endLocationName}
              </Text>
              {endLocation && !startLocation && (
                <TouchableOpacity onPress={swapLocations}>
                  <Text style={{ fontSize: 16, color: colors.GRAY_450 }}>
                    ⇅
                  </Text>
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
                  onPress={async () => {
                    if (!item.buildingId) {
                      Alert.alert('건물 정보가 없는 검색어예요!');
                      return;
                    }

                    try {
                      const detailRes = await buildingApi.getBuildingDetail(
                        item.buildingId,
                      );
                      const info = detailRes.data.buildingInfo;
                      const location = `${info.latitude},${info.longitude}`;
                      const name = info.name;

                      // 출발지 선택이 안된 경우
                      if (!startLocation) {
                        setStartLocation(location);
                        setStartLocationName(name);
                        setStartBuildingId(item.buildingId);

                        if (endLocation === location) {
                          setLastSelectedType('start');
                          setSameLocationModalVisible(true);
                          return;
                        }

                        navigation.navigate(mapNavigation.ROUTE_RESULT, {
                          startLocation: location,
                          startLocationName: name,
                          startBuildingId: item.buildingId,
                          endLocation,
                          endLocationName,
                          endBuildingId: endBuildingId ?? undefined,
                        });

                        // 도착지 선택이 안된 경우
                      } else if (!endLocation) {
                        setEndLocation(location);
                        setEndLocationName(name);
                        setEndBuildingId(item.buildingId);

                        if (startLocation === location) {
                          setLastSelectedType('end');
                          setSameLocationModalVisible(true);
                          return;
                        }

                        navigation.navigate(mapNavigation.ROUTE_RESULT, {
                          startLocation,
                          startLocationName,
                          startBuildingId: startBuildingId ?? undefined,
                          endLocation: location,
                          endLocationName: name,
                          endBuildingId: item.buildingId,
                        });
                      }
                    } catch (err) {
                      Alert.alert('건물 정보를 불러오는 데 실패했습니다');
                    }
                  }}
                >
                  <Text style={styles.recentText}>{item.keyword}</Text>
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
                  }}
                >
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
      <AlertModal
        visible={sameLocationModalVisible}
        onRequestClose={() => setSameLocationModalVisible(false)}
        message={`출발지와 도착지가 같아요`}
        buttons={[
          {
            label: '다시 입력',
            onPress: () => {
              setSameLocationModalVisible(false);

              if (
                startLocation &&
                endLocation &&
                startLocation === endLocation
              ) {
                if (lastSelectedType === 'start') {
                  setStartLocation('');
                  setStartLocationName('출발지 선택');
                  setStartBuildingId(null);
                } else if (lastSelectedType === 'end') {
                  setEndLocation('');
                  setEndLocationName('도착지 선택');
                  setEndBuildingId(null);
                }
              }
            },
            style: { backgroundColor: colors.BLUE_700 },
          },
        ]}
      />
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerWrapper: {
    position: 'relative',
    paddingHorizontal: 16,
    backgroundColor: colors.WHITE,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  closeBtnText: {
    color: colors.GRAY_500,
    fontSize: 20,
    padding: 5,
  },
  placeholder: {
    width: 30,
  },
  modeIconWrapper: {
    alignItems: 'center',
  },
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
    color: colors.BLACK_700,
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
