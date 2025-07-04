import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, {Region, PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import BottomSheet from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
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

const deviceWidth = Dimensions.get('screen').width;

const markerIconMap: {[key: string]: any} = {
  SHUTTLE_BUS: require('../../assets/category-tabs/shuttle-bus-marker.png'),
  PARKING: require('../../assets/category-tabs/parking-marker.png'),
  RESTAURANT: require('../../assets/category-tabs/restaurant-marker.png'),
  CONVENIENCE_CAFE: require('../../assets/category-tabs/cafe-marker.png'),
};

type NavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.MAPHOME
>;
type RoutePropType = RouteProp<MapStackParamList, typeof mapNavigation.MAPHOME>;

function MapHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();

  const [region, setRegion] = useState<Region | null>(null);
  const {visible, open, close, favorites} = useFavoriteBottomSheet();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const facilities = useFacilities(selectedCategory);
  const [shuttleSchedule, setShuttleSchedule] =
    useState<ShuttleSchedule | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [showShuttleBottomSheet, setShowShuttleBottomSheet] = useState(false);
  const shuttleSheetRef = useRef<BottomSheet>(null);

  const DEFAULT_REGION: Region = {
    latitude: 37.2087,
    longitude: 126.976,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const getCurrentLocation = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setRegion(DEFAULT_REGION);
        return;
      }
    }
    Geolocation.getCurrentPosition(
      position => {
        setRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      },
      () => setRegion(DEFAULT_REGION),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const handleSelectFavorite = (item: FavoriteItem) => {
    navigation.navigate(mapNavigation.ROUTE_SELECTION, {
      endLocation: item.id.toString(),
      endLocationName: item.name,
    });
    close();
  };

  useEffect(() => {
    const buildingId = route.params?.buildingId;
    if (typeof buildingId === 'number') {
      navigation.navigate(mapNavigation.BUILDING_PREVIEW, {buildingId});
    } else {
      getCurrentLocation();
    }

    globalThis.openFavoriteBottomSheet = open;
    return () => {
      globalThis.openFavoriteBottomSheet = undefined;
    };
  }, [open]);

  useEffect(() => {
    setShowShuttleBottomSheet(false);
    close(); // 즐겨찾기 바텀시트 닫기
  }, [selectedCategory, close]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        {loadingSchedule && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.BLUE_700} />
          </View>
        )}
        {/* 검색창 */}
        <TouchableOpacity
          style={styles.searchBox}
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
          </View>
        </TouchableOpacity>

        {/* 카테고리 탭 */}
        <FacilityFilterButtons
          selected={selectedCategory}
          onSelect={category =>
            setSelectedCategory(category === selectedCategory ? null : category)
          }
        />

        {/* 지도 */}
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region || DEFAULT_REGION}>
          {/* 시설 마커 */}
          {facilities.map((facility, idx) => (
            <Marker
              key={idx}
              coordinate={{
                latitude: facility.latitude,
                longitude: facility.longitude,
              }}
              onPress={async () => {
                if (selectedCategory === 'SHUTTLE_BUS') {
                  setLoadingSchedule(true);
                  try {
                    const res = await fetchShuttleSchedule();
                    setShuttleSchedule(res);
                    setShowShuttleBottomSheet(true);
                  } catch (e) {
                    console.error('셔틀버스 스케줄 조회 실패', e);
                    Alert.alert(
                      '오류',
                      '셔틀버스 스케줄을 불러올 수 없습니다.',
                    );
                  } finally {
                    setLoadingSchedule(false);
                  }
                } else {
                  navigation.navigate(mapNavigation.BUILDING_PREVIEW, {
                    buildingId: facility.buildingId,
                  });
                }
              }}>
              <Image
                source={markerIconMap[selectedCategory || 'PARKING']}
                style={styles.marker}
              />
            </Marker>
          ))}
        </MapView>

        {/* 바텀시트 */}
        {selectedCategory === 'SHUTTLE_BUS' &&
        showShuttleBottomSheet &&
        shuttleSchedule ? (
          <BottomSheet
            ref={shuttleSheetRef}
            index={0}
            snapPoints={['65%', '100%']}
            enablePanDownToClose
            onClose={() => setShowShuttleBottomSheet(false)}
            onChange={index => {
              // index가 1이면 100%로 올라간 상태
              if (index === 1) {
                // navigation.navigate(mapNavigation.SHUTTLE_DETAIL);
                // 시트 닫기
                shuttleSheetRef.current?.close();
              }
            }}>
            <ShuttleBottomSheetContent data={shuttleSchedule} />
          </BottomSheet>
        ) : visible ? (
          <BottomSheet
            index={0}
            snapPoints={['40%', '80%']}
            enablePanDownToClose
            onClose={close}>
            <FavoriteBottomSheetContent
              favorites={favorites}
              onRefresh={open}
              onSelect={handleSelectFavorite}
            />
          </BottomSheet>
        ) : null}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 5,
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
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  searchInput: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.GRAY_500,
  },
  marker: {
    width: 32,
    height: 32,
  },
});

export default MapHomeScreen;
