import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  Image,
  Text,
  Platform,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import BottomSheet from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import {colors} from '../../constants';
import FavoriteBottomSheetContent from '../../components/FavoriteBottomSheetContent';
import favoriteApi from '../../api/favoriteApi';

const deviceWidth = Dimensions.get('screen').width;

type NavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.MAPHOME
>;
type RoutePropType = RouteProp<MapStackParamList, typeof mapNavigation.MAPHOME>;

type FavoriteItem = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

declare global {
  interface Global {
    openFavoriteBottomSheet?: () => void;
  }
}

function MapHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const [region, setRegion] = useState<Region | null>(null);
  const [favoriteVisible, setFavoriteVisible] = useState(false);
  const [favoriteList, setFavoriteList] = useState<FavoriteItem[]>([]);

  const DEFAULT_REGION: Region = {
    latitude: 37.2983,
    longitude: 127.0047,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const getCurrentLocation = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setRegion(DEFAULT_REGION);
        return;
      }
    }
    Geolocation.getCurrentPosition(
      position => {
        setRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      },
      () => setRegion(DEFAULT_REGION),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const openBuildingDetailSheet = (buildingId: number) => {
    navigation.navigate(mapNavigation.BUILDING_PREVIEW, {buildingId});
  };

  const handleSelectFavorite = (item: FavoriteItem) => {
    openBuildingDetailSheet(item.id);
    setFavoriteVisible(false);
  };

  useEffect(() => {
    globalThis.openFavoriteBottomSheet = () => {
      favoriteApi.getFavorites().then(res => {
        setFavoriteList(
          res.data.buildings.map((b: any) => ({
            id: b.buildingId,
            name: b.buildingName,
            latitude: b.latitude ?? 0,
            longitude: b.longitude ?? 0,
          })),
        );
        setFavoriteVisible(true);
      });
    };
  }, []);

  useEffect(() => {
    const buildingId = route.params?.buildingId;
    if (typeof buildingId === 'number' && buildingId > 0) {
      openBuildingDetailSheet(buildingId);
    } else {
      getCurrentLocation();
    }
  }, [route.params?.buildingId]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.searchBox}
          onPress={() =>
            navigation.navigate(mapNavigation.SEARCH, {
              selectionType: 'start',
            })
          }>
          <View style={styles.searchBoxInput}>
            <Image
              source={require('../../assets/Search-icon.png')}
              style={styles.searchIcon}
            />
            <Text style={styles.searchInput}>어디로 떠나볼까요?</Text>
          </View>
        </TouchableOpacity>

        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region || DEFAULT_REGION}
        />

        <BottomSheet
          index={favoriteVisible ? 0 : -1}
          snapPoints={['40%', '90%']}
          enablePanDownToClose
          onClose={() => setFavoriteVisible(false)}>
          <FavoriteBottomSheetContent
            favorites={favoriteList}
            onSelect={handleSelectFavorite}
          />
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  searchBox: {
    position: 'absolute',
    top: 30,
    left: '5%',
    width: deviceWidth * 0.9,
    height: 50,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
    justifyContent: 'center',
  },
  searchBoxInput: {flexDirection: 'row', alignItems: 'center'},
  searchIcon: {width: 20, height: 20, marginRight: 8},
  searchInput: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.GRAY_500,
  },
});

export default MapHomeScreen;
