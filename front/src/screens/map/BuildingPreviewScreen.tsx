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
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
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
  const snapPoints = useMemo(() => ['55%', '100%'], []);
  const mapOffsetLatitude = 0.002;
  const [isFavorite, setIsFavorite] = useState(false);

  // 상단 헤더 // 추후에 vector-icon라이브러리로 대체 예정
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
          paddingLeft: 15, // 왼쪽 여백만 주고 기본 넓이 제거
          marginRight: 5, // ➡️ title 과의 간격 좁히기
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
    if (!buildingDetail) return;

    const id = route.params?.buildingId;
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

  const handleNavigateToRouteSelection = (type: 'start' | 'end') => {
    const lat = buildingDetail?.buildingInfo.latitude;
    const lon = buildingDetail?.buildingInfo.longitude;
    const name = buildingDetail?.buildingInfo.name;

    if (!lat || !lon || !name) return;

    const locationStr = `${lat},${lon}`;

    navigation.navigate(mapNavigation.ROUTE_SELECTION, {
      startLocation:
        type === 'start' ? locationStr : route.params?.startLocation || '',

      startLocationName:
        type === 'start'
          ? name
          : route.params?.startLocationName || '출발지 선택',

      endLocation:
        type === 'end' ? locationStr : route.params?.endLocation || '',

      endLocationName:
        type === 'end' ? name : route.params?.endLocationName || '도착지 선택',
    });
  };

  const handleSheetChange = (index: number) => {
    if (index === 1 && buildingDetail) {
      navigation.replace(mapNavigation.BUILDING_DETAIL, {
        buildingId: route.params.buildingId,
      });
    }
  };

  if (!buildingDetail) return null;

  const {buildingInfo} = buildingDetail;

  return (
    <View style={styles.container}>
      {/* 지도 */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialCamera={{
            center: {
              latitude: buildingInfo.latitude - mapOffsetLatitude, // 중심을 위로 이동
              longitude: buildingInfo.longitude,
            },
            zoom: 17,
            pitch: 0,
            heading: 0,
            altitude: 1000,
          }}
          pointerEvents="none">
          <Marker
            coordinate={{
              latitude: buildingInfo.latitude,
              longitude: buildingInfo.longitude,
            }}
            title={buildingInfo.name}
          />
        </MapView>
      </View>

      {/* 바텀시트 */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false} // 바텀시트 하단끌기 막기
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
                  style={{
                    tintColor: isFavorite ? undefined : colors.GRAY_700,
                  }}
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
                style={styles.button}
                onPress={() => handleNavigateToRouteSelection('start')}>
                <Text style={styles.buttonText}>출발</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleNavigateToRouteSelection('end')}>
                <Text style={styles.buttonText}>도착</Text>
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
  backBtn: {
    fontSize: 30,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    height: 250,
    width: '100%',
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
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: colors.BLUE_700,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
