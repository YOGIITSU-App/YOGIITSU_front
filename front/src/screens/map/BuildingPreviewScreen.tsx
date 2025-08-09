import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import WebView from 'react-native-webview';
import { mapNavigation } from '../../constants/navigation';
import { MapStackParamList } from '../../navigations/stack/MapStackNavigator';
import buildingApi, { BuildingDetail } from '../../api/buildingApi';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../../constants';
import favoriteApi from '../../api/favoriteApi';
import BuildingHeader from '../../components/BuildingHeader';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import FacilityBadge from '../../components/FacilityBadge';
import Config from 'react-native-config';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('window').height;

type RouteType = RouteProp<
  MapStackParamList,
  typeof mapNavigation.BUILDING_PREVIEW
>;
type NavigationProp = StackNavigationProp<MapStackParamList>;

export default function BuildingPreviewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const [buildingDetail, setBuildingDetail] = useState<BuildingDetail | null>(
    null,
  );
  const [isFavorite, setIsFavorite] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const MAP_HTML_URL = Config.MAP_PREVIEW_HTML_URL ?? '';
  const mapWebViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  const [startLocation, setStartLocation] = useState('');
  const [startLocationName, setStartLocationName] = useState('');
  const [startBuildingId, setStartBuildingId] = useState<number | undefined>();
  const [endLocation, setEndLocation] = useState('');
  const [endLocationName, setEndLocationName] = useState('');
  const [endBuildingId, setEndBuildingId] = useState<number | undefined>();

  // bottom sheet snap points 계산
  const [headerHeight, setHeaderHeight] = useState(0);
  const snapPoints = useMemo(() => {
    const collapsed = 0.5 * deviceHeight;
    const expanded = deviceHeight - headerHeight;
    return [collapsed, expanded];
  }, [headerHeight]);

  useEffect(() => {
    const {
      startLocation,
      startLocationName,
      startBuildingId,
      endLocation,
      endLocationName,
      endBuildingId,
    } = route.params ?? {};

    if (startLocation) setStartLocation(startLocation);
    if (startLocationName) setStartLocationName(startLocationName);
    if (startBuildingId !== undefined) setStartBuildingId(startBuildingId);
    if (endLocation) setEndLocation(endLocation);
    if (endLocationName) setEndLocationName(endLocationName);
    if (endBuildingId !== undefined) setEndBuildingId(endBuildingId);
  }, [route.params]);

  useEffect(() => {
    const id = route.params?.buildingId;
    if (id) {
      buildingApi.getBuildingDetail(id).then(res => {
        setBuildingDetail(res.data);
        setIsFavorite(res.data.favorite ?? false);
      });
    }
  }, [route.params?.buildingId]);

  const toggleFavorite = async () => {
    const id = route.params?.buildingId;
    if (!buildingDetail || !id) return;

    try {
      if (isFavorite) {
        await favoriteApi.removeFavorite(id);
      } else {
        await favoriteApi.addFavorite(id);
      }
      setIsFavorite(prev => !prev);
    } catch (err) {
      Alert.alert('에러', '즐겨찾기 처리 중 문제 발생');
    }
  };

  const handleMapLoaded = () => {
    if (!buildingDetail || !mapWebViewRef.current) return;

    const { latitude, longitude } = buildingDetail.buildingInfo;

    const markerMsg = JSON.stringify({
      type: 'customMarker',
      lat: latitude,
      lng: longitude,
      zoom: 3,
    });

    mapWebViewRef.current.postMessage(markerMsg);

    setLoading(false);
  };

  const handleNavigateToRouteSelection = (type: 'start' | 'end') => {
    const lat = buildingDetail?.buildingInfo.latitude;
    const lon = buildingDetail?.buildingInfo.longitude;
    const name = buildingDetail?.buildingInfo.name;
    const locationStr = `${lat},${lon}`;
    const currentId = route.params?.buildingId;

    if (!lat || !lon || !name || !currentId) return;

    if (type === 'start') {
      navigation.navigate(mapNavigation.ROUTE_SELECTION, {
        startLocation: locationStr,
        startLocationName: name,
        startBuildingId: currentId,
        endLocation,
        endLocationName,
        endBuildingId,
      });
    } else {
      navigation.navigate(mapNavigation.ROUTE_SELECTION, {
        endLocation: locationStr,
        endLocationName: name,
        endBuildingId: currentId,
        startLocation,
        startLocationName,
        startBuildingId,
      });
    }
  };

  const handleSheetChange = (index: number) => {
    if (index === 1 && buildingDetail) {
      navigation.replace(mapNavigation.BUILDING_DETAIL, {
        buildingId: route.params.buildingId,
        startLocation: route.params.startLocation,
        startLocationName: route.params.startLocationName,
        startBuildingId: route.params.startBuildingId,
        endLocation: route.params.endLocation,
        endLocationName: route.params.endLocationName,
        endBuildingId: route.params.endBuildingId,
      });
    }
  };

  if (!buildingDetail) return null;
  const { buildingInfo } = buildingDetail;

  return (
    <AppScreenLayout disableTopInset>
      {!!buildingDetail && (
        <BuildingHeader buildingName={buildingDetail.buildingInfo.name} />
      )}
      <View style={styles.container}>
        {loading && (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color={colors.BLUE_500}
          />
        )}
        <WebView
          ref={mapWebViewRef}
          source={{ uri: MAP_HTML_URL }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: deviceHeight * 0.5,
          }}
          cacheEnabled={true}
          cacheMode="LOAD_DEFAULT"
          onLoadEnd={handleMapLoaded}
          injectedJavaScriptBeforeContentLoaded={`
            (function() {
              document.addEventListener("message", function(e) {
                window.dispatchEvent(new MessageEvent("message", { data: e.data }));
              });
            })();
            true;
          `}
        />

        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          // enableContentPanningGesture={true}
          enableContentPanningGesture={false}
          enableHandlePanningGesture={true}
          enableOverDrag={false}
          style={{ flex: 1 }}
          onChange={handleSheetChange}
        >
          <BottomSheetView style={styles.sheetContent}>
            <Image
              source={{ uri: buildingInfo.imageUrl }}
              style={styles.cardImage}
            />
            <View style={styles.cardContent}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{buildingInfo.name}</Text>
                <TouchableOpacity
                  onPress={toggleFavorite}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Image
                    source={require('../../assets/bookmark-icon.png')}
                    style={{
                      tintColor: isFavorite ? undefined : colors.GRAY_700,
                      width: 14,
                      height: 18,
                    }}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.tags}>
                {buildingInfo.tags.map(tag => `#${tag}`).join(' ')}
              </Text>

              <FacilityBadge facilities={buildingInfo.facilities} />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.startbutton}
                  onPress={() => handleNavigateToRouteSelection('start')}
                >
                  <Text style={styles.startbuttonText}>출발</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.finishbutton}
                  onPress={() => handleNavigateToRouteSelection('end')}
                >
                  <Text style={styles.finishbuttonText}>도착</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </AppScreenLayout>
  );
}

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
  sheetContent: {
    paddingBottom: 30,
  },
  cardImage: {
    width: deviceWidth * 0.92,
    height: deviceHeight * 0.2,
    borderRadius: 10,
    margin: 5,
    alignSelf: 'center',
  },
  cardContent: {
    paddingHorizontal: deviceWidth * 0.04,
    paddingVertical: 10,
  },
  cardTitle: {
    fontSize: 18,
    color: colors.BLACK_900,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tags: {
    fontSize: 14,
    color: colors.BLACK_700,
    fontWeight: '500',
    marginBottom: 14,
    flexWrap: 'wrap',
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  startbutton: {
    backgroundColor: colors.BLUE_400,
    width: '48%',
    height: deviceHeight * 0.0625,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishbutton: {
    backgroundColor: colors.BLUE_700,
    width: '48%',
    height: deviceHeight * 0.0625,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startbuttonText: {
    color: colors.BLUE_700,
    fontSize: 16,
    fontWeight: 'bold',
  },
  finishbuttonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
