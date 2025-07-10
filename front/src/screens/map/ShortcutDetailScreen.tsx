import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, Image} from 'react-native';
import WebView from 'react-native-webview';
import BottomSheet from '@gorhom/bottom-sheet';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {colors} from '../../constants';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';

type Coordinate = {
  latitude: number;
  longitude: number;
  pointOrder: number;
  description: string;
  turnType: string;
  segmentDistance: number;
  imageUrl?: string;
};

export default function ShortcutDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<MapStackParamList>>();

  const webRef = useRef<WebView>(null);
  const [headerH, setHeaderH] = useState(0);
  const [loading, setLoading] = useState(true);

  const mock = {
    shortcutId: '1',
    pointA: '기숙사',
    pointB: 'IT 3층',
    distance: 150,
    duration: 2,
    coordinates: [
      {
        latitude: 37.21,
        longitude: 126.975,
        pointOrder: 1,
        description: '기숙사 앞에서 출발',
        turnType: 'STRAIGHT',
        segmentDistance: 20,
        imageUrl: 'https://example.com/image1.jpg',
      },
      {
        latitude: 37.211,
        longitude: 126.976,
        pointOrder: 2,
        description: '건물 사이 길로 직진',
        turnType: 'STRAIGHT',
        segmentDistance: 50,
      },
      {
        latitude: 37.213,
        longitude: 126.977,
        pointOrder: 1,
        description: '우회전해서 쭉 직진',
        turnType: 'STRAIGHT',
        segmentDistance: 20,
        imageUrl: 'https://example.com/image2.jpg',
      },
    ],
  };

  const {pointA, pointB, distance, duration, coordinates} = mock;

  const handleWebViewReady = () => {
    if (!coordinates || coordinates.length === 0) return;

    const path = coordinates.map(coord => ({
      lat: coord.latitude,
      lng: coord.longitude,
    }));

    webRef.current?.postMessage(
      JSON.stringify({
        type: 'drawShortcut',
        path,
      }),
    );

    const start = coordinates[0];
    const end = coordinates[coordinates.length - 1];

    webRef.current?.postMessage(
      JSON.stringify({
        type: 'marker',
        lat: start.latitude,
        lng: start.longitude,
      }),
    );

    webRef.current?.postMessage(
      JSON.stringify({
        type: 'marker',
        lat: end.latitude,
        lng: end.longitude,
      }),
    );

    setLoading(false);
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

      {/* 상단 정보 */}
      <View
        style={styles.header}
        onLayout={e => setHeaderH(e.nativeEvent.layout.height)}>
        <View style={styles.headerTop}>
          {/* 왼쪽: ← */}
          <Text style={styles.iconLeft} onPress={() => navigation.goBack()}>
            ←
          </Text>

          {/* 중앙: 걷기 아이콘 (고정 중앙) */}
          <Image
            source={require('../../assets/walking-icon.png')}
            style={styles.walkingIcon}
            resizeMode="contain"
          />

          {/* 오른쪽: ✕ */}
          <Text
            style={styles.iconRight}
            onPress={() => navigation.navigate('MapHome')}>
            ✕
          </Text>
        </View>
        <View style={styles.titleBox}>
          <Text style={styles.pointText}>{pointA}</Text>
          <Text style={styles.arrowIcon}>↔</Text>
          <Text style={styles.pointText}>{pointB}</Text>
        </View>
      </View>

      {/* 지도 WebView */}
      <WebView
        ref={webRef}
        source={{
          uri: `https://yogiitsu.s3.ap-northeast-2.amazonaws.com/map/map-shortcut.html?ts=${Date.now()}`,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '42%',
        }}
        javaScriptEnabled
        domStorageEnabled
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

      <View style={[styles.summaryBox, {bottom: '37%'}]}>
        <Text style={styles.summaryText}>
          {mock.distance}m · 약 {mock.duration}분 소요
        </Text>
      </View>

      {/* 바텀시트 안내 리스트 */}
      <BottomSheet index={0} snapPoints={['35%', '85%']}>
        <BottomSheetFlatList
          data={coordinates}
          keyExtractor={(_, idx) => `step-${idx}`}
          scrollEnabled={true}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          renderItem={({item, index}) => {
            const isFirst = index === 0;
            const isLast = index === coordinates.length - 1;

            return (
              <View style={styles.stepRow}>
                {/* 타임라인 */}
                <View style={styles.timelineContainer}>
                  {!isFirst && <View style={styles.verticalLineTop} />}

                  {isFirst || isLast ? (
                    <View style={styles.circle}>
                      {isFirst && (
                        <Image
                          source={require('../../assets/start-icon.png')}
                          style={styles.startIcon}
                        />
                      )}
                      {isLast && (
                        <Image
                          source={require('../../assets/arrival-icon.png')}
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
                  <Text style={styles.stepTitle}>{item.description}</Text>
                  <Text style={styles.stepDistance}>
                    {item.segmentDistance.toFixed(0)}m 이동
                  </Text>

                  {(isFirst || isLast) && item.imageUrl && (
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
    marginLeft: -20,
    marginTop: -20,
    zIndex: 99,
  },
  header: {
    backgroundColor: colors.BLUE_700,
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
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
    position: 'absolute',
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
    marginTop: 30,
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
  icon: {
    color: 'white',
    fontSize: 20,
    width: 24,
    textAlign: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
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
