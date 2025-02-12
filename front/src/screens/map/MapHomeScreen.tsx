import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker, Region} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

// 네비게이션 타입 지정
type MapHomeScreenNavigationProp = StackNavigationProp<
  MapStackParamList,
  'MapHome'
>;

function MapHomeScreen() {
  const navigation = useNavigation<MapHomeScreenNavigationProp>();
  const [location, setLocation] = useState<Region | null>(null);

  // 기본 위치 (서울)
  const DEFAULT_LOCATION: Region = {
    latitude: 37.5665, // 서울 위도
    longitude: 126.978, // 서울 경도₩
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
        },
        error => {
          console.log('위치 가져오기 실패:', error);
          setLocation(DEFAULT_LOCATION); // 위치 가져오기 실패 시 서울로 설정
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } else {
      setLocation(DEFAULT_LOCATION); // 권한 거부 시 서울로 설정
    }
  };

  // 컴포넌트가 처음 렌더링될 때 위치 가져오기 실행
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <View style={styles.container}>
      {/* ✅ 검색창 */}
      <TouchableOpacity
        style={styles.searchBox}
        onPress={() => navigation.navigate('Search')}>
        <TextInput
          style={styles.searchInput}
          placeholder="어디로 떠나볼까요?"
          editable={false}
        />
      </TouchableOpacity>

      {/* ✅ 지도 (초기 위치를 현재 위치 또는 서울로 설정) */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={location || DEFAULT_LOCATION} // 현재 위치가 없으면 기본값(서울) 사용
      >
        {/* 현재 위치 마커 표시 */}
        {location && <Marker coordinate={location} title="내 위치" />}
      </MapView>
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
  searchInput: {
    fontSize: 16,
    color: '#999',
  },
  map: {flex: 1},
});

export default MapHomeScreen;
