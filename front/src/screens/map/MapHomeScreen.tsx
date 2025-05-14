import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Text,
  Image,
  Animated,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import {colors} from '../../constants';

const deviceWidth = Dimensions.get('screen').width;

type MapHomeScreenNavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.MAPHOME
>;
type MapHomeScreenRouteProp = RouteProp<
  MapStackParamList,
  typeof mapNavigation.MAPHOME
>;

function MapHomeScreen() {
  const navigation = useNavigation<MapHomeScreenNavigationProp>();
  const route = useRoute<MapHomeScreenRouteProp>();

  const selectedLocation = route.params?.startLocation;
  const selectionType = route.params?.selectionType;
  const selectedPlace = route.params?.selectedPlace || '지능형SW융합대학';

  const [startCoords, setStartCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [endCoords, setEndCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [sheetIndex, setSheetIndex] = useState(0);

  const searchOpacity = useRef(new Animated.Value(1)).current;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%', '100%'], []);

  const DEFAULT_REGION: Region = {
    latitude: 37.2983,
    longitude: 127.0047,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      Geolocation.getCurrentPosition(
        position => {
          const currentRegion: Region = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(currentRegion);
          if (!startCoords) {
            setStartCoords({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        },
        () => {
          setRegion(DEFAULT_REGION);
          if (!startCoords) {
            setStartCoords({
              latitude: DEFAULT_REGION.latitude,
              longitude: DEFAULT_REGION.longitude,
            });
          }
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } else {
      setRegion(DEFAULT_REGION);
      if (!startCoords) {
        setStartCoords({
          latitude: DEFAULT_REGION.latitude,
          longitude: DEFAULT_REGION.longitude,
        });
      }
    }
  };

  useEffect(() => {
    if (selectedLocation && selectionType) {
      const coords = selectedLocation.split(',').map(Number);
      if (!isNaN(coords[0]) && !isNaN(coords[1])) {
        const newRegion: Region = {
          latitude: coords[0],
          longitude: coords[1],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        if (selectionType === 'start') {
          setStartCoords({latitude: coords[0], longitude: coords[1]});
        } else if (selectionType === 'end') {
          setEndCoords({latitude: coords[0], longitude: coords[1]});
        }
        setBottomSheetVisible(true);
      }
    } else {
      getCurrentLocation();
    }
  }, [selectedLocation, selectionType]);

  const handleSheetChange = (index: number) => {
    setSheetIndex(index);
    Animated.timing(searchOpacity, {
      toValue: index === 1 ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleNavigateToRouteSelection = (type: 'start' | 'end') => {
    if ((type === 'start' && !startCoords) || (type === 'end' && !endCoords))
      return;

    navigation.navigate(mapNavigation.ROUTE_SELECTION, {
      startLocation: startCoords
        ? `${startCoords.latitude},${startCoords.longitude}`
        : '',
      endLocation: endCoords
        ? `${endCoords.latitude},${endCoords.longitude}`
        : '',
      startLocationName:
        route.params?.startLocationName ||
        (type === 'start' ? selectedPlace : '출발지 선택'),
      endLocationName:
        route.params?.endLocationName ||
        (type === 'end' ? selectedPlace : '도착지 선택'),
    });

    bottomSheetRef.current?.close();
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        {/* 검색창 */}
        <Animated.View
          style={[
            styles.searchBox,
            {
              opacity: searchOpacity,
              transform: [
                {
                  translateY: searchOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}>
          <TouchableOpacity
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
              <TextInput
                style={styles.searchInput}
                placeholder="어디로 떠나볼까요?"
                editable={false}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* 지도 */}
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region || DEFAULT_REGION}>
          {startCoords && (
            <Marker coordinate={startCoords} title="출발지" pinColor="green" />
          )}
          {endCoords && (
            <Marker coordinate={endCoords} title="도착지" pinColor="red" />
          )}
        </MapView>

        {/* 바텀시트 */}
        <BottomSheet
          ref={bottomSheetRef}
          index={bottomSheetVisible ? 0 : -1}
          snapPoints={snapPoints}
          enablePanDownToClose
          handleComponent={null}
          onChange={handleSheetChange}
          onClose={() => setBottomSheetVisible(false)}>
          <BottomSheetScrollView>
            <BottomSheetView style={{padding: 20}}>
              {/* 미리보기 UI */}
              {sheetIndex === 0 ? (
                <>
                  <Image
                    source={require('../../assets/Home.png')}
                    style={{
                      width: '100%',
                      height: 150,
                      borderRadius: 10,
                      marginBottom: 10,
                    }}
                  />
                  <Text style={styles.title}>{selectedPlace}</Text>
                  <Text style={styles.tags}>#ICT융합대학 #벨칸토 #IT대학</Text>
                </>
              ) : (
                <>
                  <Image
                    source={require('../../assets/Home.png')}
                    style={{
                      width: '100%',
                      height: 200,
                      borderRadius: 10,
                      marginBottom: 10,
                    }}
                  />
                  <Text style={styles.title}>{selectedPlace}</Text>
                  <Text style={styles.tags}>#ICT융합대학 #벨칸토 #IT대학</Text>

                  <Text style={styles.section}>학과정보</Text>
                  <Text>📍 ICT대학 3층 (304호)</Text>
                  <Text>📞 031-220-2516</Text>
                  <Text>🕘 09:00 ~ 15:30</Text>

                  <Text style={styles.section}>시설정보</Text>
                  <Text>🛗 엘리베이터</Text>
                  <Text>🖨 프린터기(2F)</Text>
                  <Text>📘 열람실(2F)</Text>

                  <View style={styles.buttonContainer}>
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
                </>
              )}

              <View style={{height: 300}} />
            </BottomSheetView>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
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
  },
  searchBoxInput: {flexDirection: 'row', alignItems: 'center'},
  searchIcon: {width: 20, height: 20, marginRight: 8},
  searchInput: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.GRAY_500,
    flex: 1,
  },
  map: {flex: 1},
  title: {fontSize: 20, fontWeight: 'bold'},
  tags: {color: '#666', marginVertical: 4},
  section: {marginTop: 20, fontSize: 16, fontWeight: 'bold'},
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    width: 100,
    alignItems: 'center',
  },
  buttonText: {color: 'white', fontSize: 16},
});

export default MapHomeScreen;
