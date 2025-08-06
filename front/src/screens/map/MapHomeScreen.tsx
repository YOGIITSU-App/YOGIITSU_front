import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import FavoriteBottomSheetContent from '../../components/FavoriteBottomSheetContent';
import ShuttleBottomSheetContent from '../../components/ShuttleBottomSheetContent';
import {
  FavoriteItem,
  useFavoriteBottomSheet,
} from '../../hooks/useFavoriteBottomSheet';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import {colors} from '../../constants';
import {StackNavigationProp} from '@react-navigation/stack';
import {FacilityFilterButtons} from '../../components/FacilityFilterButtons';
import {useFacilities} from '../../hooks/useFacilities';
import {fetchShuttleSchedule, ShuttleSchedule} from '../../api/shuttleApi';
import WebView from 'react-native-webview';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import buildingApi from '../../api/buildingApi';
import {MAP_HOME_HTML_URL} from '@env';
import Geolocation from 'react-native-geolocation-service';
import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';
import BootSplash from 'react-native-bootsplash';

const deviceWidth = Dimensions.get('screen').width;

type NavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.MAPHOME
>;
type RoutePropType = RouteProp<MapStackParamList, typeof mapNavigation.MAPHOME>;

function MapHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const {open, close, favorites, isLoading} = useFavoriteBottomSheet();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const facilities = useFacilities(selectedCategory);
  const [shuttleSchedule, setShuttleSchedule] =
    useState<ShuttleSchedule | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [showShuttleBottomSheet, setShowShuttleBottomSheet] = useState(false);
  const shuttleSheetRef = useRef<BottomSheet>(null);
  const [selectedStopName, setSelectedStopName] = useState<string>('');
  const [openSheet, setOpenSheet] = useState<null | 'FAVORITE' | 'SHUTTLE'>(
    null,
  );
  const [pendingFavoriteSheet, setPendingFavoriteSheet] = useState(false);

  const mapWebViewRef = useRef<WebView>(null);
  const MAP_HTML_URL = MAP_HOME_HTML_URL;

  const backPressCount = useRef(0);
  const backPressTimer = useRef<NodeJS.Timeout | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS !== 'android') return;

      const onBackPress = () => {
        if (backPressCount.current === 0) {
          backPressCount.current = 1;
          ToastAndroid.show('한 번 더 누르면 종료됩니다.', ToastAndroid.SHORT);
          if (backPressTimer.current) clearTimeout(backPressTimer.current);
          backPressTimer.current = setTimeout(() => {
            backPressCount.current = 0;
          }, 2000);
          return true; // 뒤로가기 동작 막음
        } else {
          BackHandler.exitApp(); // 앱 종료
          return true;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        if (backPressTimer.current) clearTimeout(backPressTimer.current);
      };
    }, []),
  );

  async function checkLocationPermission() {
    let result;
    if (Platform.OS === 'ios') {
      result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (result !== RESULTS.GRANTED) {
        result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      }
    } else {
      result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (result !== RESULTS.GRANTED) {
        result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }
    }
    setPermissionGranted(result === RESULTS.GRANTED); // 권한 허용/거부 여부 저장

    if (result !== RESULTS.GRANTED) {
      Alert.alert(
        '위치 권한 필요',
        '길찾기 및 위치 기반 서비스를 위해 위치 권한을 허용해주세요.\n설정 > 앱에서 허용 가능합니다.',
      );
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!locationLoaded) {
        BootSplash.hide({fade: true});
        setLocationLoaded(true);
      }
    }, 10000); // 10초 후 강제 숨김

    return () => clearTimeout(timeout);
  }, [locationLoaded]);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    if (!permissionGranted) return;

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        mapWebViewRef.current?.postMessage(
          JSON.stringify({
            type: 'setMyLocation',
            lat: latitude,
            lng: longitude,
          }),
        );
      },
      error => {
        if (!locationLoaded) {
          BootSplash.hide({fade: true});
          setLocationLoaded(true);
        }
      },
      {enableHighAccuracy: false},
    );
  }, [permissionGranted]);

  useEffect(() => {
    if (!permissionGranted) return;

    const watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        mapWebViewRef.current?.postMessage(
          JSON.stringify({
            type: 'setMyLocation',
            lat: latitude,
            lng: longitude,
          }),
        );
      },
      error => {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 1,
        interval: 2000,
        fastestInterval: 1000,
        showsBackgroundLocationIndicator: false,
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [permissionGranted]);

  useEffect(() => {
    if (!mapWebViewRef.current) return;

    const filteredFacilities =
      selectedCategory && facilities.length > 0
        ? facilities.filter(f => f.type === selectedCategory)
        : [];

    const msgFacilities = JSON.stringify({
      type: 'setFacilities',
      data: filteredFacilities.map(f => ({...f, category: f.type})),
    });

    mapWebViewRef.current.postMessage(msgFacilities);

    if (selectedCategory) {
      const coords = filteredFacilities.map(f => ({
        lat: f.latitude,
        lng: f.longitude,
      }));
      mapWebViewRef.current.postMessage(
        JSON.stringify({type: 'fitBounds', coords}),
      );
    }
  }, [facilities, selectedCategory]);

  const handleWebViewMessage = async (e: any) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);

      if (data.type === 'currentLocationSet') {
        if (!locationLoaded) {
          BootSplash.hide({fade: true});
          setLocationLoaded(true);
        }
        return;
      }

      if (data.type === 'selectFacility' && data.buildingId) {
        navigation.navigate(mapNavigation.BUILDING_PREVIEW, {
          buildingId: data.buildingId,
        });
      } else if (data.type === 'shuttleClicked') {
        setLoadingSchedule(true);
        try {
          const res = await fetchShuttleSchedule();
          setShuttleSchedule(res);
          setSelectedStopName(data.name);
          setOpenSheet('SHUTTLE');
        } catch (err) {
          Alert.alert('오류', '셔틀버스 스케줄을 불러올 수 없습니다.');
        } finally {
          setLoadingSchedule(false);
        }
      }
    } catch (err) {
      console.error('웹뷰 메시지 처리 실패:', err);
    }
  };

  const handleWebViewLoad = () => {
    if (!mapWebViewRef.current) return;

    if (facilities.length > 0) {
      mapWebViewRef.current.postMessage(
        JSON.stringify({
          type: 'setFacilities',
          data: facilities.map(f => ({...f, category: f.type})),
        }),
      );
    }

    if (selectedCategory) {
      mapWebViewRef.current.postMessage(
        JSON.stringify({
          type: 'filterCategory',
          category: selectedCategory,
        }),
      );
    }
  };

  useEffect(() => {
    if (!mapWebViewRef.current) return;

    const msg = JSON.stringify({
      type: 'filterCategory',
      category: selectedCategory,
    });

    mapWebViewRef.current.postMessage(msg);
  }, [selectedCategory]);

  const handleTargetPress = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        navigation.navigate(mapNavigation.ROUTE_SELECTION, {
          startLocation: `${latitude},${longitude}`,
          startLocationName: '현재 위치',
          endLocation: '',
          endLocationName: '도착지 선택',
          startBuildingId: undefined,
          endBuildingId: undefined,
        });
      },
      error => {
        Alert.alert(
          '위치 오류',
          '현재 위치를 불러올 수 없습니다.\n위치 서비스를 확인해주세요.',
        );
      },
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 10000},
    );
  };

  const moveToMyLocation = async () => {
    try {
      const position = await new Promise<Geolocation.GeoPosition>(
        (resolve, reject) => {
          Geolocation.getCurrentPosition(
            pos => resolve(pos),
            err => reject(err),
            {enableHighAccuracy: true},
          );
        },
      );
      const {latitude, longitude} = position.coords;
      mapWebViewRef.current?.postMessage(
        JSON.stringify({
          type: 'moveTo',
          lat: latitude,
          lng: longitude,
        }),
      );
    } catch (error) {
      Alert.alert(
        '위치 오류',
        '현재 위치를 불러올 수 없습니다.\n위치 서비스를 확인해주세요.',
      );
    }
  };

  const handleSelectFavorite = async (item: FavoriteItem) => {
    try {
      const res = await buildingApi.getBuildingDetail(item.id);
      const info = res.data.buildingInfo;
      const location = `${info.latitude},${info.longitude}`;
      const name = info.name;

      navigation.navigate(mapNavigation.ROUTE_SELECTION, {
        endLocation: location,
        endLocationName: name,
        endBuildingId: item.id,
      });
      close();
    } catch (err) {
      Alert.alert('건물 위치 정보를 불러올 수 없습니다');
    }
  };

  useEffect(() => {
    const buildingId = route.params?.buildingId;
    if (typeof buildingId === 'number') {
      navigation.navigate(mapNavigation.BUILDING_PREVIEW, {buildingId});
    }
  }, [route.params]);

  useEffect(() => {
    globalThis.openFavoriteBottomSheet = () => {
      if (selectedCategory !== null) {
        setSelectedCategory(null);
        setPendingFavoriteSheet(true);
      } else {
        setOpenSheet('FAVORITE');
      }
    };
    globalThis.closeFavoriteBottomSheet = () => setOpenSheet(null);
    return () => {
      globalThis.openFavoriteBottomSheet = undefined;
      globalThis.closeFavoriteBottomSheet = undefined;
    };
  }, [selectedCategory]);

  useEffect(() => {
    if (openSheet === 'FAVORITE') {
      open();
    }
  }, [openSheet, open]);

  useFocusEffect(
    React.useCallback(() => {
      if (openSheet === 'FAVORITE') {
        open(); // 화면 복귀 시 즐겨찾기 바텀시트 열려 있으면 무조건 최신화
      }
    }, [openSheet, open]),
  );

  useEffect(() => {
    if (pendingFavoriteSheet && selectedCategory === null) {
      setOpenSheet('FAVORITE');
      setPendingFavoriteSheet(false);
    }
  }, [pendingFavoriteSheet, selectedCategory]);

  useEffect(() => {
    setShowShuttleBottomSheet(false);
    setOpenSheet(null);
  }, [selectedCategory]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AppScreenLayout disableTopInset>
        <View style={styles.container}>
          {loadingSchedule && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.BLUE_700} />
            </View>
          )}
          {/* 검색창 */}
          <TouchableOpacity
            style={[styles.searchBox, {top: insets.top + 10}]}
            onPress={() =>
              navigation.navigate(mapNavigation.SEARCH, {
                selectionType: 'start',
                fromResultScreen: false,
              })
            }>
            <View style={styles.searchBoxInput}>
              <Image
                source={require('../../assets/Search-icon.png')}
                style={styles.searchIcon}
              />
              <Text style={styles.searchInput}>어디로 떠나볼까요?</Text>
              <TouchableOpacity
                onPress={handleTargetPress}
                style={{marginLeft: 8}}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Image
                  source={require('../../assets/target-icon.png')}
                  style={styles.targetIcon}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* 카테고리 탭 */}
          <FacilityFilterButtons
            selected={selectedCategory}
            onSelect={category => {
              if (globalThis.setTabToHome) globalThis.setTabToHome();
              setSelectedCategory(
                category === selectedCategory ? null : category,
              );
            }}
          />

          {/* 지도 */}
          <WebView
            ref={mapWebViewRef}
            source={{uri: MAP_HTML_URL}}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            style={{flex: 1, marginTop: -insets.top}}
            cacheEnabled={true}
            cacheMode="LOAD_DEFAULT"
            onLoadEnd={handleWebViewLoad}
            onMessage={handleWebViewMessage}
            injectedJavaScriptBeforeContentLoaded={`
            (function() {
              document.addEventListener("message", function(e) {
                window.dispatchEvent(new MessageEvent("message", { data: e.data }));
              });
            })();
            true;
          `}
          />

          <TouchableOpacity
            style={styles.myLocationButton}
            onPress={moveToMyLocation}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Image
              source={require('../../assets/target-icon.png')} // 아이콘 경로 맞게 변경
              style={{width: 20, height: 20}}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutButton}
            onPress={() => navigation.navigate(mapNavigation.SHORTCUT_LIST)}>
            <Image
              source={require('../../assets/shortcut-icon.png')}
              style={{width: 24, height: 24, marginBottom: 4}}
              resizeMode="contain"
            />
            <Text style={styles.shortcutButtonText}>지름길</Text>
          </TouchableOpacity>
        </View>
      </AppScreenLayout>
      {openSheet === 'SHUTTLE' && shuttleSchedule && (
        <BottomSheet
          ref={shuttleSheetRef}
          index={0}
          snapPoints={['60%', '100%']}
          enablePanDownToClose
          onClose={() => setOpenSheet(null)}
          onChange={index => {
            // index가 1이면 100%로 올라간 상태
            if (index === 1) {
              setOpenSheet(null);
              navigation.navigate(mapNavigation.SHUTTLE_DETAIL, {
                shuttleSchedule: shuttleSchedule,
                selectedTime: shuttleSchedule?.nextShuttleTime?.[0],
                currentStopName: selectedStopName,
              });
            }
          }}>
          <ShuttleBottomSheetContent
            data={shuttleSchedule}
            currentStopName={selectedStopName}
          />
        </BottomSheet>
      )}
      {openSheet === 'FAVORITE' && (
        <BottomSheet
          index={0}
          snapPoints={['40%', '75%']}
          enablePanDownToClose
          onClose={() => setOpenSheet(null)}>
          <FavoriteBottomSheetContent
            favorites={favorites}
            onRefresh={open}
            onSelect={handleSelectFavorite}
            isLoading={isLoading}
          />
        </BottomSheet>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  map: {flex: 1},
  searchBox: {
    position: 'absolute',
    top: 30,
    left: '5%',
    width: deviceWidth * 0.9,
    height: 50,
    paddingHorizontal: 18,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
    justifyContent: 'center',
  },
  searchBoxInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.GRAY_1000,
    lineHeight: 20,
  },
  targetIcon: {
    width: 16,
    height: 16,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    width: 40,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  shortcutButton: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    width: 56,
    height: 70,
    backgroundColor: colors.BLUE_700,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortcutButtonText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default MapHomeScreen;
