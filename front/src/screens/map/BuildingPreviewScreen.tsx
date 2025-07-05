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
const deviceHeight = Dimensions.get('window').height;
const {height: WINDOW_HEIGHT} = Dimensions.get('window');

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
  const [isFavorite, setIsFavorite] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const mapHtmlUrl = `https://yogiitsu.s3.ap-northeast-2.amazonaws.com/map/map-preview.html?ts=${Date.now()}`;
  const mapWebViewRef = useRef<WebView>(null);
  const [bottomH, setBottomH] = useState(WINDOW_HEIGHT * 0.51);

  const [loading, setLoading] = useState(true);

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

    const {latitude, longitude} = buildingDetail.buildingInfo;

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
  const {buildingInfo} = buildingDetail;

  return (
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
        source={{uri: mapHtmlUrl}}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: bottomH,
        }}
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

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={['55%', '80%']}
        enableContentPanningGesture={true}
        enableHandlePanningGesture={true}
        enableOverDrag={false}
        style={{flex: 1}}
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
