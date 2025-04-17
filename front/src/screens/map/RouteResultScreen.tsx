import React, {useEffect, useState} from 'react';
import {View, ActivityIndicator, StyleSheet, Alert} from 'react-native';
import MapView, {Marker, Polyline, Region} from 'react-native-maps';
import axios from 'axios';
import {TMAP_API_KEY} from '@env';
import {RouteProp, useRoute} from '@react-navigation/native';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';

// route.params의 타입 정의
type RouteResultScreenRouteProp = RouteProp<
  MapStackParamList,
  typeof mapNavigation.ROUTE_RESULT
>;

// 좌표 객체 타입
interface Coordinate {
  latitude: number;
  longitude: number;
}

const GoogleMapWalkingRouteScreen: React.FC = () => {
  const route = useRoute<RouteResultScreenRouteProp>();
  const {
    startLocation, // 예: "37.56520450,126.98702028"
    endLocation, // 예: "37.566158,126.988940"
    startLocationName = '출발지',
    endLocationName = '도착지',
  } = route.params;

  const [routePath, setRoutePath] = useState<Coordinate[]>([]);
  const [loading, setLoading] = useState(true);

  // 출발지와 도착지 좌표 파싱 (문자열 -> 숫자형 Coordinate)
  const [startLat, startLon] = startLocation.split(',').map(Number);
  const [endLat, endLon] = endLocation.split(',').map(Number);
  const region: Region = {
    latitude: startLat,
    longitude: startLon,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  // Tmap 보행자 길찾기 API 호출 함수 (도보모드 전용)
  const fetchWalkingRoute = async () => {
    setLoading(true);
    const url =
      'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json';
    const requestData = {
      appKey: TMAP_API_KEY,
      startX: startLon, // Tmap API는 [경도, 위도] 순서를 사용합니다.
      startY: startLat,
      endX: endLon,
      endY: endLat,
      reqCoordType: 'WGS84GEO',
      resCoordType: 'WGS84GEO',
      startName: startLocationName,
      endName: endLocationName,
      searchOption: '0',
      sort: 'index',
      angle: 20,
      speed: 4,
    };

    try {
      console.log(TMAP_API_KEY);
      const response = await axios.post(url, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      // 디버깅: 응답 전체 확인
      console.log('Tmap 응답 데이터:', response.data);
      if (response.data && response.data.features) {
        // GeoJSON 데이터 중 LineString 타입만 필터링
        const lineStrings = response.data.features.filter(
          (feature: any) => feature.geometry.type === 'LineString',
        );
        const coords: Coordinate[] = [];
        // 각 LineString의 좌표 배열을 추출 (각 coord: [경도, 위도])
        lineStrings.forEach((feature: any) => {
          feature.geometry.coordinates.forEach((coord: number[]) => {
            coords.push({latitude: coord[1], longitude: coord[0]});
          });
        });
        // 필요하다면, 중복 좌표 제거 등의 후처리 추가 가능
        setRoutePath(coords);
      } else {
        Alert.alert('오류', '경로 데이터를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      console.log('에러 status:', error.response?.status);
      console.log('에러 data:', error.response?.data);
      Alert.alert(
        '길찾기 오류',
        error.response?.data?.message || '길찾기 요청 실패',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalkingRoute();
  }, []);

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
      )}
      <MapView style={styles.map} region={region}>
        <Marker
          coordinate={{latitude: startLat, longitude: startLon}}
          title="출발지"
        />
        <Marker
          coordinate={{latitude: endLat, longitude: endLon}}
          title="도착지"
        />
        {routePath.length > 0 && (
          <Polyline
            coordinates={routePath}
            strokeWidth={5}
            strokeColor="blue"
          />
        )}
      </MapView>
    </View>
  );
};

export default GoogleMapWalkingRouteScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  loader: {position: 'absolute', top: '50%', left: '50%'},
});
