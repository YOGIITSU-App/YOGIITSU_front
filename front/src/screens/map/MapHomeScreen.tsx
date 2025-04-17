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
  Image,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker, Region} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import {colors} from '../../constants';

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

  // 전달된 파라미터 (SearchScreen 또는 RouteSelectionScreen에서 전달)
  // 선택된 장소 좌표는 항상 startLocation로 전달되지만, selectionType이 함께 오면 'start' 또는 'end'로 구분합니다.
  const selectedLocation = route.params?.startLocation;
  const selectionType = route.params?.selectionType; // 'start' 또는 'end'
  const selectedPlace = route.params?.selectedPlace || '선택한 장소';

  // 출발지와 도착지 좌표를 분리해서 관리
  const [startCoords, setStartCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [endCoords, setEndCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  // 지도에 표시할 영역(region)
  const [region, setRegion] = useState<Region | null>(null);

  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const bottomSheetHeight = useState(new Animated.Value(0))[0];

  // 기본 위치 (서울)
  const DEFAULT_REGION: Region = {
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

  // 현재 위치 가져오기 (초기 로드 시)
  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      Geolocation.getCurrentPosition(
        position => {
          const currentRegion: Region = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(currentRegion);
          // 초기에는 출발지로 사용
          if (!startCoords) {
            setStartCoords({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        },
        error => {
          console.log('위치 가져오기 실패:', error);
          setRegion(DEFAULT_REGION);
          if (!startCoords) {
            setStartCoords({
              latitude: DEFAULT_REGION.latitude,
              longitude: DEFAULT_REGION.longitude,
            });
          }
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } else {
      setRegion(DEFAULT_REGION);
      if (!startCoords) {
        setStartCoords({
          latitude: DEFAULT_REGION.latitude,
          longitude: DEFAULT_REGION.longitude,
        });
      }
    }
  };

  // 선택된 검색 결과를 받아서 좌표 업데이트
  useEffect(() => {
    if (selectedLocation && selectionType) {
      const coords = selectedLocation.split(',').map(Number);
      if (!isNaN(coords[0]) && !isNaN(coords[1])) {
        const newRegion: Region = {
          latitude: coords[0],
          longitude: coords[1],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        if (selectionType === 'start') {
          setStartCoords({latitude: coords[0], longitude: coords[1]});
        } else if (selectionType === 'end') {
          setEndCoords({latitude: coords[0], longitude: coords[1]});
        }
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
  }, [selectedLocation, selectionType]);

  // 출발/도착 버튼 클릭 시 RouteSelectionScreen으로 이동
  const handleNavigateToRouteSelection = (type: 'start' | 'end') => {
    if (type === 'start' && !startCoords) return;
    if (type === 'end' && !endCoords) return;

    navigation.navigate(mapNavigation.ROUTE_SELECTION, {
      startLocation: startCoords
        ? `${startCoords.latitude},${startCoords.longitude}`
        : '',
      endLocation: endCoords
        ? `${endCoords.latitude},${endCoords.longitude}`
        : '',
      startLocationName:
        route.params?.startLocationName ||
        (type === 'start' ? selectedPlace : '출발지 선택'),
      endLocationName:
        route.params?.endLocationName ||
        (type === 'end' ? selectedPlace : '도착지 선택'),
    });
    handleCloseBottomSheet();
  };

  // BottomSheet 닫기
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
      {/* 검색창: 기본적으로 출발지 검색으로 호출 */}
      <TouchableOpacity
        style={styles.searchBox}
        onPress={() =>
          navigation.navigate(mapNavigation.SEARCH, {selectionType: 'start'})
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
      {/* 지도 */}
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
      {/* BottomSheet: 검색 결과가 있을 때 표시 */}
      {bottomSheetVisible && (
        <Animated.View
          style={[styles.bottomSheet, {height: bottomSheetHeight}]}>
          <Text style={styles.title}>{selectedPlace}</Text>
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
    top: 30,
    left: '5%',
    width: deviceWidth * 0.9,
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
  searchBoxInput: {flexDirection: 'row', alignItems: 'center'},
  searchIcon: {width: 20, height: 20, marginRight: 8},
  searchInput: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.GRAY_500,
    flex: 1,
  },
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
