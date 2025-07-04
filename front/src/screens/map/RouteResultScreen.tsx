import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import axios from 'axios';
import {TMAP_API_KEY} from '@env';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
} from '@gorhom/bottom-sheet';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import {colors} from '../../constants';
import buildingApi, {BuildingDetail} from '../../api/buildingApi';
import {getBoundingBox} from '../../utils/geoUtils';
import WebView from 'react-native-webview';

const {height: WINDOW_HEIGHT} = Dimensions.get('window');

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
  const webRef = useRef<WebView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [headerH, setHeaderH] = useState(0);
  const [bottomH, setBottomH] = useState(WINDOW_HEIGHT * 0.35); // 초기 35%
  const flatListRef = useRef<BottomSheetFlatListMethods>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);

  const handleSheetChange = (idx: number) => {
    setBottomH(idx === 0 ? WINDOW_HEIGHT * 0.35 : WINDOW_HEIGHT * 0.8);
  };

  const {
    startLocation,
    endLocation,
    startLocationName = '출발지',
    endLocationName = '도착지',
    startBuildingId,
    endBuildingId,
  } = route.params;

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

  const [startBuildingDetail, setStartBuildingDetail] =
    useState<BuildingDetail | null>(null);
  const [endBuildingDetail, setEndBuildingDetail] =
    useState<BuildingDetail | null>(null);
  const [routePath, setRoutePath] = useState<Coordinate[]>([]);
  const [routeFeatures, setRouteFeatures] = useState<any[]>([]);
  const [travelTime, setTravelTime] = useState<number | null>(null);
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

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     title: '길찾기 결과',
  //     headerLeft: () => null,
  //     headerRight: () => (
  //       <TouchableOpacity
  //         onPress={() => navigation.navigate(mapNavigation.MAPHOME)}>
  //         <Text style={{fontSize: 22, color: '#888', marginRight: 15}}>✕</Text>
  //       </TouchableOpacity>
  //     ),
  //     headerRightContainerStyle: {
  //       paddingRight: 10,
  //     },
  //   });
  // }, [navigation]);

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
        setRouteFeatures(response.data.features);
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
        .then(res => setStartBuildingDetail(res.data))
        .catch(err => console.error('출발지 건물 정보 로드 실패:', err));
    }

    if (endBuildingId) {
      buildingApi
        .getBuildingDetail(endBuildingId)
        .then(res => setEndBuildingDetail(res.data))
        .catch(err => console.error('도착지 건물 정보 로드 실패:', err));
    }

    fetchWalkingRoute();
  }, [startLocation, endLocation, startBuildingId, endBuildingId]);

  const handleMapReady = () => {
    if (mapRef.current && routePath.length > 0) {
      const bounds = getBoundingBox(routePath);

      mapRef.current.fitToCoordinates(routePath, {
        edgePadding: {
          top: bounds.deltaLat > 0.01 ? 40 : 80,
          right: bounds.deltaLon > 0.01 ? 40 : 80,
          bottom: 100,
          left: bounds.deltaLon > 0.01 ? 40 : 80,
        },
        animated: true,
      });
    }
  };

  useEffect(() => {
    handleMapReady();
  }, [routePath]);

  const routeSteps = useMemo(() => {
    const result: any[] = [];

    // 출발 Point
    result.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [startLon, startLat],
      },
      properties: {
        description: `${startLocationName} 출발`,
        pointType: 'SP',
        turnType: 200,
      },
    });

    // 중간 경로
    for (let i = 0; i < routeFeatures.length; i++) {
      const current = routeFeatures[i];
      const next = routeFeatures[i + 1];

      if (current.geometry.type === 'Point') {
        const isEnd = current.properties.pointType === 'EP';

        const step = {
          ...current,
          properties: {
            ...current.properties,
            description: isEnd
              ? `${endLocationName} 도착` // 도착 Point
              : current.properties.description,
            distance: next?.properties?.distance ?? null,
          },
        };
        result.push(step);
      }
    }

    return result;
  }, [routeFeatures, startLat, startLon, startLocationName, endLocationName]);

  const handleSwap = () => {
    navigation.replace(mapNavigation.ROUTE_RESULT, {
      startLocation: endLocation,
      startLocationName:
        endLocationName === '도착지 선택' ? '출발지 선택' : endLocationName,
      endLocation: startLocation,
      endLocationName:
        startLocationName === '출발지 선택' ? '도착지 선택' : startLocationName,
      startBuildingId: endBuildingId ?? undefined,
      endBuildingId: startBuildingId ?? undefined,
    });
  };

  const handleWebViewReady = () => {
    if (!webRef.current || routePath.length === 0) return;

    // 출발 마커
    webRef.current.postMessage(
      JSON.stringify({
        type: 'customMarker',
        lat: startLat,
        lng: startLon,
        imageUrl: startBuildingDetail?.buildingInfo?.imageUrl,
        zoom: 2,
        offsetY: 150,
      }),
    );

    // 도착 마커
    webRef.current.postMessage(
      JSON.stringify({
        type: 'customMarker',
        lat: endLat,
        lng: endLon,
        imageUrl: endBuildingDetail?.buildingInfo?.imageUrl,
        zoom: 2,
        offsetY: 150,
      }),
    );

    // 경로
    webRef.current.postMessage(
      JSON.stringify({
        type: 'drawRoute',
        path: routePath.map(p => ({lat: p.latitude, lng: p.longitude})),
      }),
    );

    // 확대 및 중심이동
    webRef.current.postMessage(
      JSON.stringify({
        type: 'fitBounds',
        path: [
          {lat: startLat, lng: startLon},
          {lat: endLat, lng: endLon},
          ...routePath.map(p => ({lat: p.latitude, lng: p.longitude})),
        ],
      }),
    );
  };

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={colors.BLUE_500}
        />
      )}
      <View
        style={styles.headerWrapper}
        onLayout={e => setHeaderH(e.nativeEvent.layout.height)}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.navigate(mapNavigation.MAPHOME)}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        {/* 걷기 아이콘 */}
        <View style={styles.modeIconWrapper}>
          <Image
            source={require('../../assets/walking-icon.png')}
            style={{width: 48, height: 30}}
            resizeMode="contain"
          />
        </View>

        {/* 출발지 / 도착지 입력 영역 */}
        <View style={styles.inputBox}>
          {/* 출발지 & 도착지 */}
          <View style={styles.inputCol}>
            <TouchableOpacity
              style={styles.inputRow}
              onPress={() => navigateToSearch('start')}>
              <Text style={styles.inputText}>{startLocationName}</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.inputRow}
              onPress={() => navigateToSearch('end')}>
              <Text style={styles.inputText}>{endLocationName}</Text>
            </TouchableOpacity>
          </View>

          {/* ⇅ 전환 버튼 */}
          <TouchableOpacity style={styles.switchBtn} onPress={handleSwap}>
            <Text style={{fontSize: 16, color: 'white'}}>⇅</Text>
          </TouchableOpacity>
        </View>
      </View>

      <WebView
        ref={webRef}
        source={{
          uri: `https://yogiitsu.s3.ap-northeast-2.amazonaws.com/map/map-route.html?ts=${Date.now()}`,
        }}
        style={{
          position: 'absolute',
          top: headerH, // 헤더 아래부터
          left: 0,
          right: 0,
          bottom: bottomH, // 바텀시트 위까지
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        injectedJavaScriptBeforeContentLoaded={`
    (function() {
      document.addEventListener("message", function(e) {
        window.dispatchEvent(new MessageEvent("message", { data: e.data }));
      });
    })();
    true;
  `}
        onLoadEnd={handleWebViewReady}
      />

      {/* 하단 바텀시트 */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['35%', '80%']}
        index={0}
        enableContentPanningGesture={true}
        enableHandlePanningGesture={true}
        enableOverDrag={false}
        style={{flex: 1}}
        onChange={index => {
          if (index === 0) {
            // 내려왔을 때만 스크롤 초기화
            flatListRef.current?.scrollToOffset({offset: 0, animated: true});
          }
        }}>
        <View style={styles.sheetHeader}>
          <Text style={styles.headerTitle}>경로 안내</Text>
          {travelTime !== null && (
            <Text style={styles.travelTime}>⏱ 약 {travelTime}분 소요</Text>
          )}
        </View>

        <BottomSheetFlatList
          ref={flatListRef}
          data={routeSteps}
          keyExtractor={(_, idx) => `step-${idx}`}
          scrollEnabled={true}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          renderItem={({item, index}) => {
            const {description, distance} = item.properties;
            const isFirst = index === 0;
            const isLast = index === routeSteps.length - 1;

            return (
              <View style={styles.stepRow}>
                {/* 타임라인 */}
                <View style={styles.timelineContainer}>
                  {!isFirst && <View style={styles.verticalLineTop} />}

                  {isFirst || isLast ? (
                    <View style={styles.circle}>
                      {isFirst && (
                        <Image
                          source={require('../../assets/direction-icon.png')}
                          style={styles.startIcon}
                        />
                      )}
                      {isLast && (
                        <Image // 도착 아이콘 변경 예정
                          source={require('../../assets/direction-icon.png')}
                          style={styles.startIcon}
                        />
                      )}
                    </View>
                  ) : (
                    <View style={styles.donutOuter}>
                      <View style={styles.donutInner} />
                    </View>
                  )}

                  {!isLast && <View style={styles.verticalLineBottom} />}
                </View>

                {/* 안내 내용 */}
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{description}</Text>
                  <Text style={styles.stepDistance}>
                    {distance != null ? `${distance}m` : ''}
                  </Text>

                  {/* 출발지 이미지 */}
                  {isFirst && startBuildingDetail?.buildingInfo.imageUrl && (
                    <Image
                      source={{uri: startBuildingDetail.buildingInfo.imageUrl}}
                      style={styles.stepImage}
                      resizeMode="cover"
                    />
                  )}

                  {/* 도착지 이미지 */}
                  {isLast && endBuildingDetail?.buildingInfo.imageUrl && (
                    <Image
                      source={{uri: endBuildingDetail.buildingInfo.imageUrl}}
                      style={styles.stepImage}
                      resizeMode="cover"
                    />
                  )}
                </View>
              </View>
            );
          }}
        />
      </BottomSheet>
    </View>
  );
};

export default RouteResultScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {
    top: '20%',
    height: '55%',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 10,
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 5,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.BLUE_700,
    zIndex: 10,
  },
  closeBtn: {
    position: 'absolute',
    right: 13,
    padding: 5,
  },
  closeBtnText: {
    fontSize: 22,
    color: 'white',
  },
  modeIconWrapper: {
    alignItems: 'center',
    marginBottom: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BLUE_600,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputCol: {
    flex: 1,
  },
  switchBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 8,
  },
  inputText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  clearBtn: {
    marginLeft: 8,
    color: 'white',
    fontSize: 14,
  },
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
    borderRadius: 24,
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: colors.BLACK_900,
  },
  travelTime: {
    fontSize: 13,
    color: colors.GRAY_900,
    marginBottom: 5,
  },
  stepList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineContainer: {
    width: 24,
    alignItems: 'center',
    flexDirection: 'column',
    paddingTop: 20,
  },
  verticalLineTop: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 40,
    backgroundColor: '#007AFF',
  },
  verticalLineBottom: {
    width: 2,
    flex: 1,
    backgroundColor: '#007AFF',
    marginTop: -4,
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    zIndex: 1,
  },
  startIcon: {
    width: 26,
    height: 26,
  },
  iconText: {
    fontSize: 10,
    color: 'white',
  },
  donutOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.BLUE_700,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  donutInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },

  stepContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 14,
    paddingTop: 20,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.BLACK_900,
  },
  stepDistance: {
    fontSize: 12,
    color: colors.GRAY_500,
    marginTop: 2,
  },
  stepImage: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginTop: 8,
  },
});
