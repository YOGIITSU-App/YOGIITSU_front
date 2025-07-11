import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import FavoriteBottomSheetContent from '../../components/FavoriteBottomSheetContent';
import ShuttleBottomSheetContent from '../../components/ShuttleBottomSheetContent';
import {
  FavoriteItem,
  useFavoriteBottomSheet,
} from '../../hooks/useFavoriteBottomSheet';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import {colors} from '../../constants';
import {StackNavigationProp} from '@react-navigation/stack';
import {FacilityFilterButtons} from '../../components/FacilityFilterButtons';
import {useFacilities} from '../../hooks/useFacilities';
import {fetchShuttleSchedule, ShuttleSchedule} from '../../api/shuttleApi';
import WebView from 'react-native-webview';

const deviceWidth = Dimensions.get('screen').width;

type NavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.MAPHOME
>;
type RoutePropType = RouteProp<MapStackParamList, typeof mapNavigation.MAPHOME>;

function MapHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();

  const {visible, open, close, favorites} = useFavoriteBottomSheet();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const facilities = useFacilities(selectedCategory);
  const [shuttleSchedule, setShuttleSchedule] =
    useState<ShuttleSchedule | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [showShuttleBottomSheet, setShowShuttleBottomSheet] = useState(false);
  const shuttleSheetRef = useRef<BottomSheet>(null);
  const [selectedStopName, setSelectedStopName] = useState<string>('');

  const mapWebViewRef = useRef<WebView>(null);
  const mapHtmlUrl = `https://yogiitsu.s3.ap-northeast-2.amazonaws.com/map/map-home.html?ts=${Date.now()}`;

  useEffect(() => {
    if (!mapWebViewRef.current) return;

    const msg = JSON.stringify({
      type: 'setFacilities',
      data:
        selectedCategory && facilities.length > 0
          ? facilities.map(f => ({...f, category: f.type}))
          : [],
    });

    mapWebViewRef.current.postMessage(msg);
  }, [facilities, selectedCategory]);

  const handleWebViewMessage = async (e: any) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);

      if (data.type === 'selectFacility' && data.buildingId) {
        navigation.navigate(mapNavigation.BUILDING_PREVIEW, {
          buildingId: data.buildingId,
        });
      } else if (data.type === 'shuttleClicked') {
        // 셔틀버스 마커 클릭 시 처리
        setLoadingSchedule(true);
        try {
          const res = await fetchShuttleSchedule();
          setShuttleSchedule(res);
          setSelectedStopName(data.name);
          setShowShuttleBottomSheet(true);
        } catch (err) {
          Alert.alert('오류', '셔틀버스 스케줄을 불러올 수 없습니다.');
        } finally {
          setLoadingSchedule(false);
        }
      }
    } catch (err) {
      console.error('웹뷰 메시지 처리 실패:', err);
    }
  };

  const handleWebViewLoad = () => {
    if (!mapWebViewRef.current) return;

    if (facilities.length > 0) {
      mapWebViewRef.current.postMessage(
        JSON.stringify({
          type: 'setFacilities',
          data: facilities.map(f => ({...f, category: f.type})),
        }),
      );
    }

    if (selectedCategory) {
      mapWebViewRef.current.postMessage(
        JSON.stringify({
          type: 'filterCategory',
          category: selectedCategory,
        }),
      );
    }
  };

  useEffect(() => {
    if (!mapWebViewRef.current) return;

    const msg = JSON.stringify({
      type: 'filterCategory',
      category: selectedCategory,
    });

    mapWebViewRef.current.postMessage(msg);
  }, [selectedCategory]);

  const handleSelectFavorite = (item: FavoriteItem) => {
    navigation.navigate(mapNavigation.ROUTE_SELECTION, {
      endLocation: item.id.toString(),
      endLocationName: item.name,
    });
    close();
  };

  useEffect(() => {
    const buildingId = route.params?.buildingId;
    if (typeof buildingId === 'number') {
      navigation.navigate(mapNavigation.BUILDING_PREVIEW, {buildingId});
    }
    globalThis.openFavoriteBottomSheet = () => {
      setSelectedCategory(null);
      open();
    };
    return () => {
      globalThis.openFavoriteBottomSheet = undefined;
    };
  }, [open]);

  useEffect(() => {
    setShowShuttleBottomSheet(false);
    close(); // 즐겨찾기 바텀시트 닫기
  }, [selectedCategory, close]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        {loadingSchedule && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.BLUE_700} />
          </View>
        )}
        {/* 검색창 */}
        <TouchableOpacity
          style={styles.searchBox}
          onPress={() =>
            navigation.navigate(mapNavigation.SEARCH, {
              selectionType: 'start',
              fromResultScreen: false,
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

        {/* 카테고리 탭 */}
        <FacilityFilterButtons
          selected={selectedCategory}
          onSelect={category =>
            setSelectedCategory(category === selectedCategory ? null : category)
          }
        />

        {/* 지도 */}
        <WebView
          ref={mapWebViewRef}
          source={{uri: mapHtmlUrl}}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          style={{flex: 1}}
          onLoadEnd={handleWebViewLoad}
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

        <TouchableOpacity
          style={styles.shortcutButton}
          onPress={() => navigation.navigate(mapNavigation.SHORTCUT_LIST)}>
          <Image
            source={require('../../assets/shortcut-icon.png')}
            style={{width: 24, height: 24, marginBottom: 4}}
            resizeMode="contain"
          />
          <Text style={styles.shortcutButtonText}>지름길</Text>
        </TouchableOpacity>

        {/* 바텀시트 */}
        {selectedCategory === 'SHUTTLE_BUS' &&
        showShuttleBottomSheet &&
        shuttleSchedule ? (
          <BottomSheet
            ref={shuttleSheetRef}
            index={0}
            snapPoints={['65%', '100%']}
            enablePanDownToClose
            onClose={() => setShowShuttleBottomSheet(false)}
            onChange={index => {
              // index가 1이면 100%로 올라간 상태
              if (index === 1) {
                // navigation.navigate(mapNavigation.SHUTTLE_DETAIL);
                // 시트 닫기
                shuttleSheetRef.current?.close();
              }
            }}>
            <ShuttleBottomSheetContent
              data={shuttleSchedule}
              currentStopName={selectedStopName}
            />
          </BottomSheet>
        ) : visible ? (
          <BottomSheet
            index={0}
            snapPoints={['40%', '80%']}
            enablePanDownToClose
            onClose={close}>
            <FavoriteBottomSheetContent
              favorites={favorites}
              onRefresh={open}
              onSelect={handleSelectFavorite}
            />
          </BottomSheet>
        ) : null}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  map: {flex: 1},
  searchBox: {
    position: 'absolute',
    top: 30,
    left: '5%',
    width: deviceWidth * 0.9,
    height: 50,
    paddingHorizontal: 18,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
    justifyContent: 'center',
  },
  searchBoxInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: 12,
  },
  searchInput: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.GRAY_1000,
    lineHeight: 20,
  },
  shortcutButton: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    width: 56,
    height: 70,
    backgroundColor: colors.BLUE_700,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortcutButtonText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default MapHomeScreen;
