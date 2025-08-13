import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  BackHandler,
  Platform,
} from 'react-native';
import axios from 'axios';
import Config from 'react-native-config';
import {
  RouteProp,
  useRoute,
  useNavigation,
  useFocusEffect,
  CommonActions,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
} from '@gorhom/bottom-sheet';
import { MapStackParamList } from '../../navigations/stack/MapStackNavigator';
import { mapNavigation } from '../../constants/navigation';
import { colors } from '../../constants';
import buildingApi, { BuildingDetail } from '../../api/buildingApi';
import WebView from 'react-native-webview';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Geolocation from 'react-native-geolocation-service';

const { height: deviceHeight } = Dimensions.get('window');

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

function RouteResultScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteResultScreenRouteProp>();
  const navigation = useNavigation<RouteResultScreenNavigationProp>();
  const {
    startLocation,
    endLocation,
    startLocationName = '출발지',
    endLocationName = '도착지',
    startBuildingId,
    endBuildingId,
  } = route.params;

  // WebView 레퍼런스 & 로딩 상태 관리
  const webRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);

  // 바텀시트 내부 FlatList ref
  const flatListRef = useRef<BottomSheetFlatListMethods>(null);

  // 경로 API / 건물 상세 로딩 상태
  const [routePath, setRoutePath] = useState<Coordinate[]>([]);
  const [routeFeatures, setRouteFeatures] = useState<any[]>([]);
  const [travelTime, setTravelTime] = useState<number | null>(null);
  const [routeLoading, setRouteLoading] = useState(true);
  const [startBuildingDetail, setStartBuildingDetail] =
    useState<BuildingDetail | null>(null);
  const [endBuildingDetail, setEndBuildingDetail] =
    useState<BuildingDetail | null>(null);

  // bottom sheet snap points 계산
  const [headerHeight, setHeaderHeight] = useState(0);

  const expanded = useMemo(() => {
    return Platform.select({
      ios: deviceHeight - headerHeight,
      android: deviceHeight + insets.top - headerHeight,
    })!;
  }, [deviceHeight, headerHeight, insets.top]);

  const snapPoints = useMemo(
    () => [deviceHeight * 0.35, expanded],
    [deviceHeight, expanded],
  );

  useFocusEffect(
    React.useCallback(() => {
      const onBack = () => {
        goHomeSafely();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [navigation]),
  );

  const goHomeSafely = () => {
    const state = navigation.getState();
    const canPop = (state?.index ?? 0) > 0;

    if (canPop) {
      // 스택에 히스토리가 있으면 정상 pop
      navigation.popToTop();
    } else {
      // 히스토리가 없으면(루트가 결과화면) 스택을 홈으로 재구성
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: mapNavigation.MAPHOME }],
        }),
      );
    }
  };

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('beforeRemove', e => {
  //     // "뒤로가기"로 나갈 때만 막기, 그 외(push/replace 등)는 허용
  //     if (e.data.action.type === 'POP') {
  //       e.preventDefault();
  //     }
  //   });
  //   return unsubscribe;
  // }, [navigation]);

  const handleWebViewMessage = (e: any) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setMapReady(true);
      }
    } catch (err) {}
  };

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        webRef.current?.postMessage(
          JSON.stringify({
            type: 'setMyLocation',
            lat: latitude,
            lng: longitude,
          }),
        );
      },
      error => {
        console.log('위치 추적 에러:', error.code, error.message);

        // 권한 거부(예: error.code === 1) 혹은 기타 오류일 때 안내하기
        if (error.code === 1) {
          Alert.alert(
            '위치 권한 필요',
            '길찾기 및 위치 기반 서비스를 이용하려면 위치 권한을 허용해주세요.\n설정 > 앱에서 위치 권한을 활성화할 수 있습니다.',
          );
        } else {
          Alert.alert(
            '위치 오류',
            '현재 위치를 가져올 수 없습니다. 위치 서비스 설정을 확인해주세요.',
          );
        }
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 1,
        interval: 2000,
        fastestInterval: 1000,
        showsBackgroundLocationIndicator: false,
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

  const isLoading = routeLoading || !mapReady;

  // 출발/도착지 재검색으로 이동
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

  // 좌표 파싱
  const parseCoord = (str?: string): [number, number] | null => {
    if (!str) return null;
    const [lat, lon] = str.split(',').map(Number);
    return isNaN(lat) || isNaN(lon) ? null : [lat, lon];
  };
  const startCoord = parseCoord(startLocation);
  const endCoord = parseCoord(endLocation);
  if (!startCoord || !endCoord) {
    Alert.alert('에러', '위치 정보가 올바르지 않습니다');
    return null;
  }
  const [startLat, startLon] = startCoord;
  const [endLat, endLon] = endCoord;

  // 맵 페이지 URL
  const MAP_HTML_URL = Config.MAP_RESULT_HTML_URL ?? '';

  // 1) 경로 API 호출
  useEffect(() => {
    setRouteLoading(true);
    axios
      .post(
        `https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&appKey=${Config.TMAP_API_KEY}`,
        {
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
        },
      )
      .then(res => {
        const features = res.data.features;
        const totalTime = features[0].properties.totalTime;
        setTravelTime(Math.ceil(totalTime / 60));
        setRouteFeatures(features);
        const coords: Coordinate[] = [];
        features
          .filter((f: any) => f.geometry.type === 'LineString')
          .forEach((f: any) =>
            f.geometry.coordinates.forEach((c: number[]) =>
              coords.push({ latitude: c[1], longitude: c[0] }),
            ),
          );
        setRoutePath(coords);
      })
      .catch(() => Alert.alert('오류', '경로 데이터를 가져올 수 없습니다.'))
      .finally(() => setRouteLoading(false));
  }, [startLocation, endLocation]);

  // 1-1) 출발/도착 건물 상세 정보 로드
  useEffect(() => {
    if (startBuildingId) {
      buildingApi
        .getBuildingDetail(startBuildingId)
        .then(res => setStartBuildingDetail(res.data))
        .catch(() => console.error('출발지 정보 로드 실패'));
    }
    if (endBuildingId) {
      buildingApi
        .getBuildingDetail(endBuildingId)
        .then(res => setEndBuildingDetail(res.data))
        .catch(() => console.error('도착지 정보 로드 실패'));
    }
  }, [startBuildingId, endBuildingId]);

  /** 2) WebView 로드 완료 시 */

  /** 3) mapLoaded && routePath 준비되면 지도에 그리기 */
  useEffect(() => {
    if (!mapReady || routePath.length === 0) return;
    webRef.current?.postMessage(
      JSON.stringify({ type: 'customMarker', lat: startLat, lng: startLon }),
    );
    webRef.current?.postMessage(
      JSON.stringify({ type: 'customMarker', lat: endLat, lng: endLon }),
    );
    webRef.current?.postMessage(
      JSON.stringify({
        type: 'drawRoute',
        path: routePath.map(p => ({ lat: p.latitude, lng: p.longitude })),
      }),
    );
  }, [mapReady, routePath]);

  /** 4) 출발/도착 swap (params 갱신만) */
  const handleSwap = () => {
    navigation.setParams({
      startLocation: endLocation,
      startLocationName:
        endLocationName === '도착지' ? '출발지' : endLocationName,
      endLocation: startLocation,
      endLocationName:
        startLocationName === '출발지' ? '도착지' : startLocationName,
      startBuildingId: endBuildingId,
      endBuildingId: startBuildingId,
    });
  };

  /** BottomSheet 단계별 안내 리스트 */
  const routeSteps = useMemo(() => {
    const steps: any[] = [];
    steps.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [startLon, startLat] },
      properties: {
        description: `${startLocationName} 출발`,
        pointType: 'SP',
        turnType: 200,
      },
    });
    for (let i = 0; i < routeFeatures.length; i++) {
      const cur = routeFeatures[i];
      const nxt = routeFeatures[i + 1];
      if (cur.geometry.type === 'Point') {
        const isEnd = cur.properties.pointType === 'EP';
        steps.push({
          ...cur,
          properties: {
            ...cur.properties,
            description: isEnd
              ? `${endLocationName} 도착`
              : cur.properties.description,
            distance: nxt?.properties?.distance ?? null,
          },
        });
      }
    }
    return steps;
  }, [routeFeatures]);

  return (
    <AppScreenLayout disableTopInset>
      <View style={styles.container}>
        {isLoading && (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color={colors.BLUE_500}
          />
        )}

        {/* 헤더 */}
        <View
          style={[styles.headerWrapper, { paddingTop: insets.top }]}
          onLayout={e => setHeaderHeight(e.nativeEvent.layout.height)}
        >
          <View style={styles.headerTop}>
            <View style={styles.placeholder} />
            <View style={styles.modeIconWrapper}>
              <Image
                source={require('../../assets/walking-icon.png')}
                style={{ width: 48, height: 30 }}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={goHomeSafely}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputBox}>
            <View style={styles.inputCol}>
              <TouchableOpacity
                style={styles.inputRow}
                onPress={() => navigateToSearch('start')}
              >
                <Text style={styles.inputText}>{startLocationName}</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.inputRow}
                onPress={() => navigateToSearch('end')}
              >
                <Text style={styles.inputText}>{endLocationName}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.switchBtn} onPress={handleSwap}>
              <Text style={{ fontSize: 16, color: 'white' }}>⇅</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WebView */}
        <WebView
          ref={webRef}
          source={{ uri: MAP_HTML_URL }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: deviceHeight * 0.35,
          }}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          cacheEnabled={true}
          cacheMode="LOAD_DEFAULT"
          onMessage={handleWebViewMessage}
          injectedJavaScriptBeforeContentLoaded={`
          (function() {
            document.addEventListener("message", function(e) {
              window.dispatchEvent(new MessageEvent("message", { data: e.data }));
            });
          })();
          true;
        `}
        />

        {/* 경로 단계별 안내 */}
        <BottomSheet
          snapPoints={snapPoints}
          index={0}
          enableContentPanningGesture
          enableHandlePanningGesture
          enableOverDrag={false}
          maxDynamicContentSize={expanded}
          style={{ flex: 1 }}
          onChange={idx => {
            if (idx === 0)
              flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: true,
              });
          }}
        >
          <View style={styles.sheetHeader}>
            <Text style={styles.headerTitle}>경로 안내</Text>
            {travelTime !== null && (
              <Text style={styles.travelTime}>⏱ 약 {travelTime}분 소요</Text>
            )}
          </View>
          <BottomSheetFlatList
            ref={flatListRef}
            data={routeSteps}
            bounces={false}
            overScrollMode="never"
            keyExtractor={(_, i) => `step-${i}`}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 20,
              flexGrow: 1,
            }}
            renderItem={({ item, index }) => {
              const { description, distance } = item.properties;
              const isFirst = index === 0;
              const isLast = index === routeSteps.length - 1;
              return (
                <View style={styles.stepRow}>
                  {/* 타임라인 아이콘 */}
                  <View style={styles.timelineContainer}>
                    {!isFirst && <View style={styles.verticalLineTop} />}
                    {isFirst || isLast ? (
                      <View style={styles.circle}>
                        <Image
                          source={
                            isFirst
                              ? require('../../assets/start-icon.png')
                              : require('../../assets/arrival-icon.png')
                          }
                          style={styles.startIcon}
                        />
                      </View>
                    ) : (
                      <View style={styles.donutOuter}>
                        <View style={styles.donutInner} />
                      </View>
                    )}
                    {!isLast && <View style={styles.verticalLineBottom} />}
                  </View>
                  {/* 안내 텍스트 & 거리 & 이미지 */}
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{description}</Text>
                    {distance != null && (
                      <Text style={styles.stepDistance}>{distance}m</Text>
                    )}
                    {isFirst && startBuildingDetail?.buildingInfo.imageUrl && (
                      <Image
                        source={{
                          uri: startBuildingDetail.buildingInfo.imageUrl,
                        }}
                        style={styles.stepImage}
                        resizeMode="cover"
                      />
                    )}
                    {isLast && endBuildingDetail?.buildingInfo.imageUrl && (
                      <Image
                        source={{
                          uri: endBuildingDetail.buildingInfo.imageUrl,
                        }}
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
    </AppScreenLayout>
  );
}

export default RouteResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 10,
  },
  headerWrapper: {
    position: 'relative',
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.BLUE_700,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  closeBtnText: {
    color: 'white',
    fontSize: 20,
    padding: 5,
  },
  placeholder: {
    width: 30,
  },
  modeIconWrapper: {
    alignItems: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BLUE_600,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
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
