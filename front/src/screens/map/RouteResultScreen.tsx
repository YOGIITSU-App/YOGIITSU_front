import React, {useEffect, useState, useRef} from 'react';
import {View, ActivityIndicator, StyleSheet, Alert} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import axios from 'axios';
import {TMAP_API_KEY} from '@env';
import {RouteProp, useRoute} from '@react-navigation/native';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';

type RouteResultScreenRouteProp = RouteProp<
  MapStackParamList,
  typeof mapNavigation.ROUTE_RESULT
>;

interface Coordinate {
  latitude: number;
  longitude: number;
}

const GoogleMapWalkingRouteScreen: React.FC = () => {
  const route = useRoute<RouteResultScreenRouteProp>();
  const mapRef = useRef<MapView>(null);

  const {
    startLocation,
    endLocation,
    startLocationName = '출발지',
    endLocationName = '도착지',
  } = route.params;

  const [routePath, setRoutePath] = useState<Coordinate[]>([]);
  const [loading, setLoading] = useState(true);

  const parseCoord = (coordStr?: string): [number, number] | null => {
    if (!coordStr) return null;
    const [latStr, lonStr] = coordStr.split(',');
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    if (isNaN(lat) || isNaN(lon)) return null;
    return [lat, lon];
  };

  const startCoord = parseCoord(startLocation);
  const endCoord = parseCoord(endLocation);
  if (!startCoord || !endCoord) {
    Alert.alert('에러', '위치 정보가 올바르지 않습니다');
    return null;
  }

  const [startLat, startLon] = startCoord;
  const [endLat, endLon] = endCoord;

  const fetchWalkingRoute = async () => {
    setLoading(true);
    const url = `https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&appKey=${TMAP_API_KEY}`;
    const requestData = {
      startX: startLon,
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
      const response = await axios.post(url, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (response.data?.features) {
        const lineStrings = response.data.features.filter(
          (feature: any) => feature.geometry.type === 'LineString',
        );
        const coords: Coordinate[] = [];
        lineStrings.forEach((feature: any) => {
          feature.geometry.coordinates.forEach((coord: number[]) => {
            coords.push({latitude: coord[1], longitude: coord[0]});
          });
        });
        setRoutePath(coords);
      } else {
        Alert.alert('오류', '경로 데이터를 가져올 수 없습니다.');
      }
    } catch (error: any) {
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

  // ✅ 자동 줌
  const handleMapReady = () => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          {latitude: startLat, longitude: startLon},
          {latitude: endLat, longitude: endLon},
        ],
        {
          edgePadding: {top: 80, right: 80, bottom: 80, left: 80},
          animated: true,
        },
      );
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
      )}
      <MapView ref={mapRef} style={styles.map} onMapReady={handleMapReady}>
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
