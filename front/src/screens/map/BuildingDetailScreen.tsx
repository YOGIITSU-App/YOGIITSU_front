import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import buildingApi, {BuildingDetail} from '../../api/buildingApi';
import {StackNavigationProp} from '@react-navigation/stack';
import {colors} from '../../constants';
import favoriteApi from '../../api/favoriteApi';
import BuildingHeader from '../../components/BuildingHeader';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import FacilityBadge from '../../components/FacilityBadge';
import FacilityBadgeWithFloor from '../../components/FacilityBadgeWithFloor';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

type RouteType = RouteProp<
  MapStackParamList,
  typeof mapNavigation.BUILDING_DETAIL
>;
type NavigationProp = StackNavigationProp<MapStackParamList>;

export default function BuildingDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const [buildingDetail, setBuildingDetail] = useState<BuildingDetail | null>(
    null,
  );
  const [selectedDeptIndex, setSelectedDeptIndex] = useState(0);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isImageModalVisible, setImageModalVisible] = useState(false);

  // 출발/도착 상태값
  const [startLocation, setStartLocation] = useState('');
  const [startLocationName, setStartLocationName] = useState('');
  const [startBuildingId, setStartBuildingId] = useState<number | undefined>();
  const [endLocation, setEndLocation] = useState('');
  const [endLocationName, setEndLocationName] = useState('');
  const [endBuildingId, setEndBuildingId] = useState<number | undefined>();

  // route.params 갱신되면 상태 업데이트
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
        header: () => (
          <BuildingHeader buildingName={buildingDetail.buildingInfo.name} />
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
      if (isFavorite) await favoriteApi.removeFavorite(id);
      else await favoriteApi.addFavorite(id);
      setIsFavorite(prev => !prev);
    } catch {
      Alert.alert('에러', '즐겨찾기 처리 중 문제 발생');
    }
  };

  const handleNavigateToRouteSelection = (type: 'start' | 'end') => {
    const lat = buildingDetail?.buildingInfo.latitude;
    const lon = buildingDetail?.buildingInfo.longitude;
    const name = buildingDetail?.buildingInfo.name;
    const currentId = route.params?.buildingId;
    const locationStr = `${lat},${lon}`;

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

  if (!buildingDetail) return null;

  const {buildingInfo, departments} = buildingDetail;

  return (
    <AppScreenLayout>
      <ScrollView style={styles.container}>
        <Image source={{uri: buildingInfo.imageUrl}} style={styles.image} />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{buildingInfo.name}</Text>
            <TouchableOpacity onPress={toggleFavorite}>
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
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}>
          {departments.map((dep, index) => (
            <TouchableOpacity
              key={dep.id}
              onPress={() => setSelectedDeptIndex(index)}
              style={[
                styles.tabItem,
                index === selectedDeptIndex && styles.activeTabItem,
              ]}>
              <Text
                style={[
                  styles.tabText,
                  index === selectedDeptIndex && styles.activeTabText,
                ]}>
                {dep.departmentName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>학과정보</Text>
          <View style={styles.departmentBox}>
            <View style={styles.departmentRow}>
              <Text style={styles.departmentLabel}>학과위치</Text>
              <Text style={styles.departmentValue}>
                {departments[selectedDeptIndex]?.location}
              </Text>
            </View>

            <View style={styles.departmentRow}>
              <Text style={styles.departmentLabel}>대표전화</Text>
              <Text style={styles.departmentValue}>
                {departments[selectedDeptIndex]?.phone}
              </Text>
            </View>

            {departments[selectedDeptIndex]?.fax && (
              <View style={styles.departmentRow}>
                <Text style={styles.departmentLabel}>FAX</Text>
                <Text style={styles.departmentValue}>
                  {departments[selectedDeptIndex]?.fax}
                </Text>
              </View>
            )}
            {departments[selectedDeptIndex]?.officeHours && (
              <View style={styles.departmentRow}>
                <Text style={styles.departmentLabel}>업무시간</Text>
                <Text style={styles.departmentValue}>
                  {departments[selectedDeptIndex]?.officeHours}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.sectionTitle}>시설정보</Text>
            <FacilityBadgeWithFloor facilities={buildingInfo.facilities} />
          </View>
          <View style={styles.divider} />
          {buildingDetail.floorPlans.length > 0 &&
            buildingDetail.floorPlans[selectedFloorIndex] && (
              <>
                <Text style={styles.sectionTitle}>층별안내</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.floorTabContainer}>
                  {buildingDetail.floorPlans.map((plan, index) => (
                    <TouchableOpacity
                      key={plan.floor}
                      style={[
                        styles.floorTabItem,
                        index === selectedFloorIndex &&
                          styles.activeFloorTabItem,
                      ]}
                      onPress={() => setSelectedFloorIndex(index)}>
                      <Text
                        style={[
                          styles.floorTabText,
                          index === selectedFloorIndex &&
                            styles.activeFloorTabText,
                        ]}>
                        {plan.floor}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity onPress={() => setImageModalVisible(true)}>
                  <Image
                    source={{
                      uri: buildingDetail.floorPlans[selectedFloorIndex]
                        .imageUrl,
                    }}
                    style={styles.floorImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {/* 팝업 모달 */}
                <Modal
                  isVisible={isImageModalVisible}
                  onBackdropPress={() => setImageModalVisible(false)}
                  style={{margin: 0}}>
                  <StatusBar
                    backgroundColor={
                      isImageModalVisible ? 'black' : 'transparent'
                    }
                    barStyle={
                      isImageModalVisible ? 'light-content' : 'dark-content'
                    }
                    animated
                  />
                  <View style={{flex: 1, backgroundColor: 'black'}}>
                    <TouchableOpacity
                      onPress={() => setImageModalVisible(false)}
                      style={{
                        position: 'absolute',
                        top: 23,
                        right: 10,
                        zIndex: 10,
                        padding: 10,
                      }}>
                      <Text style={{fontSize: 20, color: 'white'}}>✕</Text>
                    </TouchableOpacity>

                    <ImageViewer
                      imageUrls={buildingDetail.floorPlans.map(plan => ({
                        url: plan.imageUrl,
                      }))}
                      index={selectedFloorIndex} // 현재 선택된 층부터 시작
                      enableSwipeDown
                      onSwipeDown={() => setImageModalVisible(false)}
                      backgroundColor="black"
                      renderHeader={() => (
                        <View
                          style={{
                            position: 'absolute',
                            top: 23,
                            right: 10,
                            zIndex: 10,
                            padding: 10,
                          }}
                          pointerEvents="box-none">
                          <TouchableOpacity
                            onPress={() => setImageModalVisible(false)}>
                            <Text style={{fontSize: 20, color: 'white'}}>
                              ✕
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                  </View>
                </Modal>
              </>
            )}

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
      </ScrollView>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  image: {
    width: deviceWidth,
    height: deviceWidth * 0.6,
  },
  content: {
    padding: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: colors.BLACK_900,
  },
  tags: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.BLACK_700,
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: colors.GRAY_400,
    marginBottom: 10,
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  activeTabItem: {
    borderBottomWidth: 3,
    borderBottomColor: colors.BLUE_700,
  },
  tabText: {
    fontWeight: '600',
    color: colors.GRAY_700,
    fontSize: 14,
  },
  activeTabText: {
    color: colors.BLACK_700,
    fontWeight: '600',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: colors.BLACK_700,
  },
  departmentBox: {
    marginBottom: 28,
  },
  departmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  departmentLabel: {
    width: 100,
    fontWeight: 'bold',
    color: colors.BLACK_600,
    fontSize: 14,
  },
  departmentValue: {
    flex: 1,
    fontSize: 14,
    color: colors.BLACK_600,
  },
  floorTabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    marginTop: 6,
  },
  floorTabItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
  },
  activeFloorTabItem: {
    backgroundColor: colors.BLUE_700,
  },
  floorTabText: {
    color: colors.BLACK_600,
    fontSize: 14,
  },
  activeFloorTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  floorImage: {
    width: deviceWidth * 0.9,
    height: deviceWidth * 0.6,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
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
