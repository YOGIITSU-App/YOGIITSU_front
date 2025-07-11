import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import WebView from 'react-native-webview';
import BottomSheet from '@gorhom/bottom-sheet';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {fetchShortcutDetail, ShortcutDetail} from '../../api/shortcutApi';
import {colors, mapNavigation} from '../../constants';

type ShortcutDetailRouteProp = RouteProp<
  MapStackParamList,
  typeof mapNavigation.SHORTCUT_DETAIL
>;
type NavigationProp = StackNavigationProp<
  MapStackParamList,
  typeof mapNavigation.SHORTCUT_DETAIL
>;

export default function ShortcutDetailScreen() {
  const deviceHeight = Dimensions.get('window').height;
  const route = useRoute<ShortcutDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const {shortcutId} = route.params;

  // 1) map 로딩 상태
  const [mapLoaded, setMapLoaded] = useState(false);
  // 2) 상세 데이터 상태
  const [detail, setDetail] = useState<ShortcutDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);

  const webRef = useRef<WebView>(null);

  // 맵 페이지 URL
  const shortcutMapUrl = useMemo(
    () =>
      `https://yogiitsu.s3.ap-northeast-2.amazonaws.com/map/map-shortcut.html`,
    [],
  );

  // bottom sheet snap points 계산
  const [headerHeight, setHeaderHeight] = useState(0);
  const snapPoints = useMemo(() => {
    const collapsed = 0.35 * deviceHeight;
    const expanded = deviceHeight - headerHeight;
    return [collapsed, expanded];
  }, [headerHeight]);

  // 1) 상세 API 호출
  useEffect(() => {
    fetchShortcutDetail(shortcutId)
      .then(data => setDetail(data))
      .catch(err => console.warn('상세 불러오기 실패', err))
      .finally(() => setDetailLoading(false));
  }, [shortcutId]);

  // 2) map 로드 완료 시
  const onWebViewLoadEnd = () => {
    setMapLoaded(true);
  };

  // 3) detail & mapLoaded 가 모두 true 될 때만 그리기
  useEffect(() => {
    if (!detail || !mapLoaded) return;

    const path = detail.coordinates.map(c => ({
      lat: c.latitude,
      lng: c.longitude,
    }));
    webRef.current?.postMessage(JSON.stringify({type: 'drawShortcut', path}));

    const start = detail.coordinates[0];
    const end = detail.coordinates[detail.coordinates.length - 1];
    [start, end].forEach(p =>
      webRef.current?.postMessage(
        JSON.stringify({type: 'marker', lat: p.latitude, lng: p.longitude}),
      ),
    );
  }, [detail, mapLoaded]);

  const loading = detailLoading || !mapLoaded;

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={colors.BLUE_500}
        />
      )}

      {/* Header */}
      <View
        style={styles.header}
        onLayout={e => setHeaderHeight(e.nativeEvent.layout.height)}>
        <View style={styles.headerTop}>
          <Text onPress={() => navigation.goBack()} style={styles.iconLeft}>
            ←
          </Text>
          <Image
            source={require('../../assets/walking-icon.png')}
            style={styles.walkingIcon}
          />
          <Text
            onPress={() => navigation.navigate(mapNavigation.MAPHOME)}
            style={styles.iconRight}>
            ✕
          </Text>
        </View>
        <View style={styles.titleBox}>
          <Text style={styles.pointText}>{detail?.pointA}</Text>
          <Text style={styles.arrowIcon}>↔</Text>
          <Text style={styles.pointText}>{detail?.pointB}</Text>
        </View>
      </View>

      {/* WebView */}
      <WebView
        ref={webRef}
        source={{uri: shortcutMapUrl}}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: deviceHeight * 0.35,
        }}
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        injectedJavaScriptBeforeContentLoaded={`
          (function() {
            document.addEventListener("message", function(e) {
              window.dispatchEvent(new MessageEvent("message", { data: e.data }));
            });
          })();
          true;
        `}
        onLoadEnd={onWebViewLoadEnd}
      />

      {/* 요약 박스 */}
      <View style={[styles.summaryBox, {bottom: '37%'}]}>
        <Text style={styles.summaryText}>
          {detail?.distance}m · 약 {detail?.duration}분 소요
        </Text>
      </View>

      {/* 안내 BottomSheet */}
      <BottomSheet
        index={0}
        snapPoints={snapPoints}
        enableContentPanningGesture
        enableHandlePanningGesture
        enableOverDrag={false}>
        <BottomSheetFlatList
          data={detail?.coordinates || []}
          keyExtractor={c => c.pointOrder.toString()}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          renderItem={({item, index}) => {
            const isFirst = index === 0;
            const isLast = index === (detail?.coordinates.length ?? 0) - 1;
            return (
              <View style={styles.stepRow}>
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
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{item.description}</Text>
                  {item.segmentDistance > 0 && (
                    <Text style={styles.stepDistance}>
                      {item.segmentDistance}m 이동
                    </Text>
                  )}
                  {item.imageUrl?.trim() !== '' && (
                    <Image
                      source={{uri: item.imageUrl}}
                      style={styles.image}
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
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -18,
    zIndex: 99,
  },
  header: {
    backgroundColor: colors.BLUE_700,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  iconLeft: {
    color: 'white',
    fontSize: 20,
    textAlign: 'left',
  },
  iconRight: {
    color: 'white',
    fontSize: 20,
    textAlign: 'right',
  },
  walkingIcon: {
    left: '50%',
    transform: [{translateX: -24}],
    width: 48,
    height: 30,
  },
  titleBox: {
    backgroundColor: colors.BLUE_100,
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 70,
    marginTop: 20,
  },
  pointText: {
    color: colors.BLUE_700,
    fontSize: 16,
    fontWeight: '600',
  },
  arrowIcon: {
    color: colors.BLUE_700,
    fontSize: 17,
  },
  summaryBox: {
    position: 'absolute',
    right: 15,
    padding: 10,
    backgroundColor: colors.BLUE_700,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.WHITE,
    lineHeight: 16,
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

  content: {
    flex: 1,
    paddingLeft: 12,
  },
  desc: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.BLACK_900,
  },
  sub: {
    fontSize: 12,
    color: colors.GRAY_700,
    marginBottom: 4,
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginTop: 6,
  },
});
