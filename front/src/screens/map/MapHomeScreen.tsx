import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Animated,
  Text,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker, Region} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

// 네비게이션 타입 지정
type MapHomeScreenNavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.MAPHOME
>;
type MapHomeScreenRouteProp = RouteProp<
  MapStackParamList,
  typeof mapNavigation.MAPHOME
>;

function MapHomeScreen() {
  const navigation = useNavigation<MapHomeScreenNavigationProp>();
  const route = useRoute<MapHomeScreenRouteProp>();

  // ✅ selectedPlace가 없을 경우 기본값 설정
  const selectedLocation = route.params?.startLocation;
  const selectedPlace = route.params?.selectedPlace || '선택한 장소';

  const [location, setLocation] = useState<Region | null>(null);
  const [markerLocation, setMarkerLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const bottomSheetHeight = useState(new Animated.Value(0))[0];

  // 기본 위치 (서울)
  const DEFAULT_LOCATION: Region = {
    latitude: 37.5665,
    longitude: 126.978,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // 위치 권한 요청 함수
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // 현재 위치 가져오기
  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      Geolocation.getCurrentPosition(
        position => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          setMarkerLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          console.log('위치 가져오기 실패:', error);
          setLocation(DEFAULT_LOCATION);
          setMarkerLocation({
            latitude: DEFAULT_LOCATION.latitude,
            longitude: DEFAULT_LOCATION.longitude,
          });
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } else {
      setLocation(DEFAULT_LOCATION);
      setMarkerLocation({
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
      });
    }
  };

  // ✅ 검색 결과 받아서 지도 이동 & 마커 추가 & BottomSheet 표시
  useEffect(() => {
    if (selectedLocation) {
      const coords = selectedLocation.split(',').map(Number);

      if (!isNaN(coords[0]) && !isNaN(coords[1])) {
        setLocation({
          latitude: coords[0],
          longitude: coords[1],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setMarkerLocation({latitude: coords[0], longitude: coords[1]});

        setBottomSheetVisible(true);
        Animated.timing(bottomSheetHeight, {
          toValue: 250,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    } else {
      getCurrentLocation();
    }
  }, [selectedLocation]);

  // ✅ 출발/도착 버튼 클릭 시 `RouteSelectionScreen`으로 이동
  const handleNavigateToRouteSelection = (type: 'start' | 'end') => {
    if (!markerLocation) return;

    navigation.navigate(mapNavigation.ROUTE_SELECTION, {
      startLocation:
        type === 'start'
          ? `${markerLocation.latitude},${markerLocation.longitude}`
          : route.params?.startLocation,
      endLocation:
        type === 'end'
          ? `${markerLocation.latitude},${markerLocation.longitude}`
          : route.params?.endLocation,
      startLocationName:
        type === 'start' ? selectedPlace : route.params?.startLocationName,
      endLocationName:
        type === 'end' ? selectedPlace : route.params?.endLocationName,
    });

    handleCloseBottomSheet(); // ✅ BottomSheet 닫기
  };

  // ✅ BottomSheet 닫기
  const handleCloseBottomSheet = () => {
    Animated.timing(bottomSheetHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setBottomSheetVisible(false);
    });
  };

  return (
    <View style={styles.container}>
      {/* ✅ 검색창 (올바른 `selectionType` 전달) */}
      <TouchableOpacity
        style={styles.searchBox}
        onPress={
          () =>
            navigation.navigate(mapNavigation.SEARCH, {selectionType: 'start'}) // ✅ 타입 오류 해결
        }>
        <TextInput
          style={styles.searchInput}
          placeholder="어디로 떠나볼까요?"
          editable={false}
        />
      </TouchableOpacity>

      {/* ✅ 지도 */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={location || DEFAULT_LOCATION}>
        {markerLocation && (
          <Marker coordinate={markerLocation} title={selectedPlace} />
        )}
      </MapView>

      {/* ✅ BottomSheet (검색했을 때만 표시) */}
      {bottomSheetVisible && (
        <Animated.View
          style={[styles.bottomSheet, {height: bottomSheetHeight}]}>
          <Text style={styles.title}>{selectedPlace}</Text>

          {/* 출발 / 도착 버튼 */}
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
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  searchBox: {
    position: 'absolute',
    top: 20,
    left: '10%',
    width: deviceWidth * 0.8,
    height: deviceHeight * 0.06,
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
  searchInput: {fontSize: 16, color: '#999'},
  map: {flex: 1},
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
  },
  title: {fontSize: 24, fontWeight: 'bold'},
  buttonContainer: {flexDirection: 'row', justifyContent: 'space-around'},
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: 100,
    alignItems: 'center',
  },
  buttonText: {color: 'white', fontSize: 16},
});

export default MapHomeScreen;
