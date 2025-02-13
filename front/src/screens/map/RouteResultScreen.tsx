import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MapView, {Polyline, Marker} from 'react-native-maps';
import axios from 'axios';
import {RouteProp, useRoute} from '@react-navigation/native';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import {TMAP_API_KEY} from '@env';

// ✅ 네비게이션 타입 정의
type RouteResultScreenRouteProp = RouteProp<
  MapStackParamList,
  typeof mapNavigation.ROUTE_RESULT
>;

function RouteResultScreen() {
  const route = useRoute<RouteResultScreenRouteProp>();

  // ✅ 출발 & 도착 정보
  const {startLocation, startLocationName, endLocation, endLocationName} =
    route.params;
  const [selectedMode, setSelectedMode] = useState<'transit' | 'car' | 'walk'>(
    'transit',
  );
  const [routePath, setRoutePath] = useState<
    {latitude: number; longitude: number}[]
  >([]);
  const [loading, setLoading] = useState(false);

  // ✅ 출발 & 도착 좌표 변환
  const [startLat, startLon] = startLocation.split(',').map(Number);
  const [endLat, endLon] = endLocation.split(',').map(Number);

  // ✅ Tmap 길찾기 API 호출
  const fetchRoute = async () => {
    setLoading(true);
    let url = '';
    let data = {};

    if (selectedMode === 'transit') {
      // 대중교통 경로
      url = 'https://apis.openapi.sk.com/transit/routes';
      data = {
        appKey: TMAP_API_KEY,
        startX: startLon,
        startY: startLat,
        endX: endLon,
        endY: endLat,
        reqCoordType: 'WGS84GEO',
        resCoordType: 'WGS84GEO',
        count: 10,
      };
    } else if (selectedMode === 'car') {
      // 자동차 경로
      url = 'https://apis.openapi.sk.com/tmap/routes';
      data = {
        startX: startLon,
        startY: startLat,
        endX: endLon,
        endY: endLat,
        appKey: TMAP_API_KEY,
      };
    } else if (selectedMode === 'walk') {
      // 도보 경로
      url = 'https://apis.openapi.sk.com/tmap/routes/pedestrian';
      data = {
        startX: startLon,
        startY: startLat,
        endX: endLon,
        endY: endLat,
        appKey: TMAP_API_KEY,
      };
    }

    try {
      const response = await axios.post(url, data);
      const path = response.data.features
        .filter((feature: any) => feature.geometry.type === 'LineString')
        .flatMap((feature: any) =>
          feature.geometry.coordinates.map(([lon, lat]: number[]) => ({
            latitude: lat,
            longitude: lon,
          })),
        );

      setRoutePath(path);
    } catch (error) {
      console.error('길찾기 API 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 모드 변경 시 길찾기 요청
  useEffect(() => {
    fetchRoute();
  }, [selectedMode]);

  return (
    <View style={styles.container}>
      {/* ✅ 지도 표시 */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: startLat,
          longitude: startLon,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}>
        {/* 출발지 & 도착지 마커 */}
        <Marker
          coordinate={{latitude: startLat, longitude: startLon}}
          title="출발지"
        />
        <Marker
          coordinate={{latitude: endLat, longitude: endLon}}
          title="도착지"
        />

        {/* 길찾기 경로 */}
        {routePath.length > 0 && (
          <Polyline
            coordinates={routePath}
            strokeWidth={5}
            strokeColor="blue"
          />
        )}
      </MapView>

      {/* ✅ 길찾기 모드 선택 버튼 */}
      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'transit' && styles.selectedMode,
          ]}
          onPress={() => setSelectedMode('transit')}>
          <Text style={styles.modeText}>🚌 대중교통</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'car' && styles.selectedMode,
          ]}
          onPress={() => setSelectedMode('car')}>
          <Text style={styles.modeText}>🚗 자동차</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'walk' && styles.selectedMode,
          ]}
          onPress={() => setSelectedMode('walk')}>
          <Text style={styles.modeText}>🚶 도보</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ 로딩 표시 */}
      {loading && (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'white',
  },
  modeButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#eee',
  },
  selectedMode: {
    backgroundColor: '#007AFF',
  },
  modeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
});

export default RouteResultScreen;
