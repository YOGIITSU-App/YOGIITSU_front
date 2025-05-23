import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  Text,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import {colors} from '../../constants';
import FavoriteBottomSheetContent from '../../components/FavoriteBottomSheetContent';
import favoriteApi from '../../api/favoriteApi';
import buildingApi, {BuildingDetail} from '../../api/buildingApi';

const deviceWidth = Dimensions.get('screen').width;

type NavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.MAPHOME
>;
type RoutePropType = RouteProp<MapStackParamList, typeof mapNavigation.MAPHOME>;

type FavoriteItem = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

const facilityIconMap: {[key: string]: any} = {
  엘리베이터: require('../../assets/elevator-icon.png'),
  프린터기: require('../../assets/printer-icon.png'),
  자판기: require('../../assets/vending-icon.png'),
};

declare global {
  interface Global {
    openFavoriteBottomSheet?: () => void;
  }
}

function MapHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();

  const [startCoords, setStartCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [endCoords, setEndCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [buildingDetail, setBuildingDetail] = useState<BuildingDetail | null>(
    null,
  );
  const [selectedDeptIndex, setSelectedDeptIndex] = useState(0);
  const [searchVisible, setSearchVisible] = useState(true);
  const [favoriteVisible, setFavoriteVisible] = useState(false);
  const [favoriteList, setFavoriteList] = useState<FavoriteItem[]>([]);

  const searchOpacity = useRef(new Animated.Value(1)).current;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%', '100%'], []);

  const DEFAULT_REGION: Region = {
    latitude: 37.2983,
    longitude: 127.0047,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const getCurrentLocation = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
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
    } else {
      setRegion(DEFAULT_REGION);
    }
  };

  const openBuildingDetailSheet = async (buildingId: number) => {
    try {
      const res = await buildingApi.getBuildingDetail(buildingId);
      setBuildingDetail(res.data);

      const lat = res.data.buildingInfo.latitude || DEFAULT_REGION.latitude;
      const lon = res.data.buildingInfo.longitude || DEFAULT_REGION.longitude;

      setRegion({
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      if (route.params?.selectionType === 'start') {
        setStartCoords({latitude: lat, longitude: lon});
      } else {
        setEndCoords({latitude: lat, longitude: lon});
      }

      setBottomSheetVisible(true);
    } catch (err) {
      console.error('건물 상세 정보 로딩 실패:', err);
      getCurrentLocation();
    }
  };

  const handleSelectFavorite = (item: FavoriteItem) => {
    openBuildingDetailSheet(item.id);
    setFavoriteVisible(false);
  };

  useEffect(() => {
    globalThis.openFavoriteBottomSheet = () => {
      favoriteApi.getFavorites().then(res => {
        setFavoriteList(
          res.data.buildings.map((b: any) => ({
            id: b.buildingId,
            name: b.buildingName,
            latitude: b.latitude ?? 0,
            longitude: b.longitude ?? 0,
          })),
        );
        setFavoriteVisible(true);
      });
    };
  }, []);

  useEffect(() => {
    const buildingId = route.params?.buildingId;
    if (typeof buildingId === 'number' && buildingId > 0) {
      openBuildingDetailSheet(buildingId);
    } else {
      getCurrentLocation();
    }
  }, [route.params?.buildingId]);

  const handleSheetChange = (index: number) => {
    setSearchVisible(index !== 1);
  };

  const isValidCoords = (
    coords: {latitude: number; longitude: number} | null | undefined,
  ): boolean =>
    !!coords &&
    typeof coords.latitude === 'number' &&
    typeof coords.longitude === 'number' &&
    !isNaN(coords.latitude) &&
    !isNaN(coords.longitude);

  const handleNavigateToRouteSelection = (type: 'start' | 'end') => {
    const startValid = isValidCoords(startCoords);
    const endValid = isValidCoords(endCoords);

    if ((type === 'start' && !startValid) || (type === 'end' && !endValid)) {
      return; // 유효하지 않으면 아무 것도 안함
    }

    navigation.navigate(mapNavigation.ROUTE_SELECTION, {
      startLocation: startValid
        ? `${startCoords!.latitude},${startCoords!.longitude}`
        : '',
      endLocation: endValid
        ? `${endCoords!.latitude},${endCoords!.longitude}`
        : '',
      startLocationName:
        type === 'start' ? buildingDetail?.buildingInfo.name : '출발지 선택',
      endLocationName:
        type === 'end' ? buildingDetail?.buildingInfo.name : '도착지 선택',
    });

    bottomSheetRef.current?.close();
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        {searchVisible && (
          <Animated.View
            style={[
              styles.searchBox,
              {
                opacity: searchOpacity,
                transform: [
                  {
                    translateY: searchOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(mapNavigation.SEARCH, {
                  selectionType: 'start',
                })
              }>
              <View style={styles.searchBoxInput}>
                <Image
                  source={require('../../assets/Search-icon.png')}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="어디로 떠나볼까요?"
                  editable={false}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region || DEFAULT_REGION}>
          {startCoords && (
            <Marker coordinate={startCoords} title="출발지" pinColor="green" />
          )}
          {endCoords && (
            <Marker coordinate={endCoords} title="도착지" pinColor="red" />
          )}
        </MapView>

        <BottomSheet
          ref={bottomSheetRef}
          index={bottomSheetVisible ? 0 : -1}
          snapPoints={snapPoints}
          enablePanDownToClose
          onChange={handleSheetChange}
          onClose={() => setBottomSheetVisible(false)}>
          {buildingDetail && (
            <BottomSheetScrollView>
              <BottomSheetView style={{padding: 20}}>
                <Image
                  source={{uri: buildingDetail.buildingInfo.imageUrl}}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.title}>
                    {buildingDetail.buildingInfo.name}
                  </Text>
                  <TouchableOpacity onPress={() => {}}>
                    <Image
                      source={require('../../assets/bookmark-icon.png')}
                      style={{width: 24, height: 24}}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.tags}>
                  {buildingDetail.buildingInfo.tags
                    .map(tag => `#${tag}`)
                    .join(' ')}
                </Text>

                <View style={styles.facilityContainer}>
                  {buildingDetail.buildingInfo.facilities.map(facility => {
                    const name = facility.name.trim();
                    return (
                      facilityIconMap[name] && (
                        <View key={name} style={styles.facilityItem}>
                          <Image
                            source={facilityIconMap[name]}
                            style={styles.facilityIcon}
                          />
                        </View>
                      )
                    );
                  })}
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.tabContainer}>
                  {buildingDetail.departments.map((dep, index) => (
                    <TouchableOpacity
                      key={dep.id}
                      style={[
                        styles.tabItem,
                        index === selectedDeptIndex && styles.activeTabItem,
                      ]}
                      onPress={() => setSelectedDeptIndex(index)}>
                      <Text
                        style={[
                          styles.tabText,
                          index === selectedDeptIndex && styles.activeTabText,
                        ]}>
                        {dep.departmentName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.section}>학과정보</Text>
                <View style={{marginTop: 10}}>
                  <Text style={styles.detailText}>
                    학과위치:{' '}
                    {buildingDetail.departments[selectedDeptIndex]?.location}
                  </Text>
                  <Text style={styles.detailText}>
                    대표전화:{' '}
                    {buildingDetail.departments[selectedDeptIndex]?.phone}
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleNavigateToRouteSelection('start')}>
                    <Text style={styles.buttonText}>출발</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleNavigateToRouteSelection('end')}>
                    <Text style={styles.buttonText}>도착</Text>
                  </TouchableOpacity>
                </View>

                <View style={{height: 300}} />
              </BottomSheetView>
            </BottomSheetScrollView>
          )}
        </BottomSheet>

        <BottomSheet
          index={favoriteVisible ? 0 : -1}
          snapPoints={['40%', '90%']}
          enablePanDownToClose
          onClose={() => setFavoriteVisible(false)}>
          <FavoriteBottomSheetContent
            favorites={favoriteList}
            onSelect={handleSelectFavorite}
          />
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
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
  },
  searchBoxInput: {flexDirection: 'row', alignItems: 'center'},
  searchIcon: {width: 20, height: 20, marginRight: 8},
  searchInput: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.GRAY_500,
    flex: 1,
  },
  title: {fontSize: 20, fontWeight: 'bold'},
  tags: {color: '#666', marginVertical: 4},
  section: {marginTop: 20, fontSize: 16, fontWeight: 'bold'},
  facilityContainer: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 10,
    flexWrap: 'wrap',
  },
  facilityItem: {
    alignItems: 'center',
    width: 70,
  },
  facilityIcon: {
    // width: 36,
    // height: 36,
    marginBottom: 10,
  },
  facilityText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#555',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginVertical: 10,
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    width: 100,
    alignItems: 'center',
  },
  buttonText: {color: 'white', fontSize: 16},
});

export default MapHomeScreen;
