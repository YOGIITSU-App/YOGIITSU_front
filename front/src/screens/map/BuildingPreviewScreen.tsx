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
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import WebView from 'react-native-webview';
import {mapNavigation} from '../../constants/navigation';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import buildingApi, {BuildingDetail} from '../../api/buildingApi';
import {StackNavigationProp} from '@react-navigation/stack';
import {colors} from '../../constants';
import favoriteApi from '../../api/favoriteApi';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

const facilityIconMap: {[key: string]: any} = {
  엘리베이터: require('../../assets/elevator-icon.png'),
  프린터기: require('../../assets/printer-icon.png'),
  자판기: require('../../assets/vending-icon.png'),
};

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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapWebViewRef = useRef<WebView>(null);
  const snapPoints = useMemo(() => ['55%', '100%'], []);
  const [isFavorite, setIsFavorite] = useState(false);

  const mapHtmlUrl =
    'https://yogiitsu.s3.ap-northeast-2.amazonaws.com/map/map.html';

  const [startLocation, setStartLocation] = useState('');
  const [startLocationName, setStartLocationName] = useState('');
  const [startBuildingId, setStartBuildingId] = useState<number | undefined>();
  const [endLocation, setEndLocation] = useState('');
  const [endLocationName, setEndLocationName] = useState('');
  const [endBuildingId, setEndBuildingId] = useState<number | undefined>();

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

  useLayoutEffect(() => {
    if (buildingDetail?.buildingInfo?.name) {
      navigation.setOptions({
        title: buildingDetail.buildingInfo.name,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{fontSize: 22}}>{'←'}</Text>
          </TouchableOpacity>
        ),
        headerLeftContainerStyle: {
          paddingLeft: 15,
          marginRight: 5,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate(mapNavigation.MAPHOME)}>
            <Text style={{fontSize: 22, color: '#888', marginRight: 15}}>
              ✕
            </Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, buildingDetail]);

  useEffect(() => {
    const id = route.params?.buildingId;
    if (id) {
      buildingApi.getBuildingDetail(id).then(res => {
        setBuildingDetail(res.data);
        setIsFavorite(res.data.favorite ?? false);
      });
    }
  }, [route.params?.buildingId]);

  useEffect(() => {
    if (buildingDetail && mapWebViewRef.current) {
      const {latitude, longitude, imageUrl} = buildingDetail.buildingInfo;

      const zoomLevel = 2; // 적절한 줌 값 (1~5 권장)
      const offsetY = 90 + deviceHeight * 0.55 + 20; // 바텀시트 높이에 따라 조정!

      const markerMsg = JSON.stringify({
        type: 'customMarker',
        lat: latitude,
        lng: longitude,
        imageUrl: imageUrl,
        zoom: zoomLevel,
        offsetY: offsetY,
      });

      mapWebViewRef.current.postMessage(markerMsg);
    }
  }, [buildingDetail]);

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
    if (buildingDetail && mapWebViewRef.current) {
      const {latitude, longitude, imageUrl} = buildingDetail.buildingInfo;
      const zoomLevel = 0;
      const offsetY = -500;

      const markerMsg = JSON.stringify({
        type: 'customMarker',
        lat: latitude,
        lng: longitude,
        imageUrl: imageUrl,
        zoom: zoomLevel,
        offsetY: offsetY,
      });
      mapWebViewRef.current.postMessage(markerMsg);
    }
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
  const {buildingInfo} = buildingDetail;

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView
          ref={mapWebViewRef}
          source={{uri: mapHtmlUrl}}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          style={{flex: 1}}
          injectedJavaScriptBeforeContentLoaded={`
    (function() {
      document.addEventListener("message", function(e) {
        window.dispatchEvent(new MessageEvent("message", { data: e.data }));
      });
    })();
    true;
  `}
          onLoadEnd={handleMapLoaded}
        />
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        onChange={handleSheetChange}>
        <BottomSheetView style={styles.sheetContent}>
          <Image
            source={{uri: buildingInfo.imageUrl}}
            style={styles.cardImage}
          />
          <View style={styles.cardContent}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{buildingInfo.name}</Text>
              <TouchableOpacity onPress={toggleFavorite}>
                <Image
                  source={require('../../assets/bookmark-icon.png')}
                  style={{tintColor: isFavorite ? undefined : colors.GRAY_700}}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.tags}>
              {buildingInfo.tags.map(tag => `#${tag}`).join(' ')}
            </Text>

            <View style={styles.facilityRow}>
              {buildingInfo.facilities.map(fac => {
                const icon = facilityIconMap[fac.name.trim()];
                return icon ? (
                  <Image
                    key={fac.name}
                    source={icon}
                    style={styles.facilityIcon}
                  />
                ) : null;
              })}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.startbutton}
                onPress={() => handleNavigateToRouteSelection('start')}>
                <Text style={styles.startbuttonText}>출발</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.finishbutton}
                onPress={() => handleNavigateToRouteSelection('end')}>
                <Text style={styles.finishbuttonText}>도착</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  mapContainer: {flex: 1, height: 250, width: '100%'},
  sheetContent: {paddingBottom: 30},
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
  facilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  facilityIcon: {
    resizeMode: 'contain',
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
