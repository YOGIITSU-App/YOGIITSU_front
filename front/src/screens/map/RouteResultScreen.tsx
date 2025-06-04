import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import axios from 'axios';
import {TMAP_API_KEY} from '@env';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import {colors} from '../../constants';
import buildingApi, {BuildingDetail} from '../../api/buildingApi';

const deviceHeight = Dimensions.get('screen').height;

type RouteResultScreenRouteProp = RouteProp<
  MapStackParamList,
  typeof mapNavigation.ROUTE_RESULT
>;

type RouteResultScreenNavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.ROUTE_RESULT
>;

interface Coordinate {
  latitude: number;
  longitude: number;
}

const RouteResultScreen: React.FC = () => {
  const route = useRoute<RouteResultScreenRouteProp>();
  const navigation = useNavigation<RouteResultScreenNavigationProp>();
  const mapRef = useRef<MapView>(null);

  const {
    startLocation,
    endLocation,
    startLocationName = '출발지',
    endLocationName = '도착지',
    startBuildingId,
    endBuildingId,
  } = route.params;

  const [startBuildingDetail, setStartBuildingDetail] =
    useState<BuildingDetail | null>(null);
  const [endBuildingDetail, setEndBuildingDetail] =
    useState<BuildingDetail | null>(null);
  const [routePath, setRoutePath] = useState<Coordinate[]>([]);
  const [loading, setLoading] = useState(true);
  const [travelTime, setTravelTime] = useState<number | null>(null);

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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '길찾기 결과',

      // 뒤로가기 버튼 제거
      headerLeft: () => null,

      // 우측 상단 X 버튼
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate(mapNavigation.MAPHOME)}>
          <Text style={{fontSize: 22, color: '#888', marginRight: 15}}>✕</Text>
        </TouchableOpacity>
      ),

      headerRightContainerStyle: {
        paddingRight: 10,
      },
    });
  }, [navigation]);

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
    };

    try {
      const response = await axios.post(url, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (response.data?.features) {
        const props = response.data.features[0].properties;
        setTravelTime(Math.ceil(props.totalTime / 60));

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
    if (startBuildingId) {
      buildingApi
        .getBuildingDetail(startBuildingId)
        .then(res => {
          setStartBuildingDetail(res.data);
        })
        .catch(err => {
          console.error('출발지 건물 정보 로드 실패:', err);
        });
    }

    if (endBuildingId) {
      buildingApi
        .getBuildingDetail(endBuildingId)
        .then(res => {
          setEndBuildingDetail(res.data);
        })
        .catch(err => {
          console.error('도착지 건물 정보 로드 실패:', err);
        });
    }

    fetchWalkingRoute();
  }, [startLocation, endLocation, startBuildingId, endBuildingId]);

  const handleMapReady = () => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          {latitude: startLat, longitude: startLon},
          {latitude: endLat, longitude: endLon},
        ],
        {
          edgePadding: {top: 80, right: 80, bottom: 220, left: 80},
          animated: true,
        },
      );
    }
  };

  const navigateToSearch = (type: 'start' | 'end') => {
    navigation.push(mapNavigation.SEARCH, {
      selectionType: type,
      fromResultScreen: true,
      previousStartLocation: startLocation,
      previousStartLocationName: startLocationName,
      previousEndLocation: endLocation,
      previousEndLocationName: endLocationName,
      startBuildingId,
      endBuildingId,
    });
  };

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
      )}
      <MapView ref={mapRef} style={styles.map} onMapReady={handleMapReady}>
        {/* 출발 마커 */}
        {startBuildingDetail?.buildingInfo.imageUrl ? (
          <Marker
            key={`startMarker-${startBuildingId}`}
            coordinate={{latitude: startLat, longitude: startLon}}>
            <View style={styles.imageMarker}>
              <Image
                source={{uri: startBuildingDetail.buildingInfo.imageUrl}}
                style={styles.image}
              />
            </View>
          </Marker>
        ) : (
          <Marker
            key="startMarker-default"
            coordinate={{latitude: startLat, longitude: startLon}}
            title="출발지"
          />
        )}

        {/* 도착 마커 */}
        {endBuildingDetail?.buildingInfo.imageUrl ? (
          <Marker
            key={`endMarker-${endBuildingId}`}
            coordinate={{latitude: endLat, longitude: endLon}}>
            <View style={styles.imageMarker}>
              <Image
                source={{uri: endBuildingDetail.buildingInfo.imageUrl}}
                style={styles.image}
              />
            </View>
          </Marker>
        ) : (
          <Marker
            key="endMarker-default"
            coordinate={{latitude: endLat, longitude: endLon}}
            title="도착지"
          />
        )}

        {/* 경로 */}
        {routePath.length > 0 && (
          <Polyline
            coordinates={routePath}
            strokeWidth={5}
            strokeColor={colors.BLUE_500}
          />
        )}
      </MapView>

      {/* 하단 박스 */}
      <View style={styles.bottomBox}>
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => navigateToSearch('start')}>
          <Text style={styles.pointLabel}>🚩</Text>
          <Text style={styles.locationName}>{startLocationName}</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => navigateToSearch('end')}>
          <Text style={styles.pointLabel}>🎯</Text>
          <Text style={styles.locationName}>{endLocationName}</Text>
        </TouchableOpacity>

        {travelTime !== null && (
          <Text style={styles.timeText}>⏱ 예상 소요 시간: {travelTime}분</Text>
        )}
      </View>
    </View>
  );
};

export default RouteResultScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  loader: {position: 'absolute', top: '50%', left: '50%'},
  imageMarker: {
    borderWidth: 3,
    borderColor: colors.WHITE,
    borderRadius: 30,
    overflow: 'hidden',
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 27,
  },
  bottomBox: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: colors.WHITE,
    padding: 16,
    borderRadius: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    height: deviceHeight * 0.065,
  },
  pointLabel: {
    fontSize: 18,
    marginRight: 8,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.BLACK_900,
    flexShrink: 1,
  },
  separator: {
    height: 1,
    backgroundColor: colors.GRAY_400,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 13,
    color: colors.BLACK_500,
    marginTop: 4,
  },
});
