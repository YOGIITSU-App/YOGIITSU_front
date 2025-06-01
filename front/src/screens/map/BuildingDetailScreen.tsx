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
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../../constants/navigation';
import buildingApi, {BuildingDetail} from '../../api/buildingApi';
import {StackNavigationProp} from '@react-navigation/stack';
import {colors} from '../../constants';
import favoriteApi from '../../api/favoriteApi';

const {width: deviceWidth} = Dimensions.get('window');

const facilityIconMap: {[key: string]: any} = {
  엘리베이터: require('../../assets/elevator-icon.png'),
  프린터기: require('../../assets/printer-icon.png'),
  자판기: require('../../assets/vending-icon.png'),
};

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
  const [selectedDeptIndex, setSelectedDeptIndex] = useState(0); // 학과 배열
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(0); // 층별 배열
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

  if (!buildingDetail) return null;

  const {buildingInfo, departments} = buildingDetail;

  return (
    <ScrollView style={styles.container}>
      <Image source={{uri: buildingInfo.imageUrl}} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{buildingInfo.name}</Text>
          <TouchableOpacity
            onPress={() => {
              console.log('북마크');
            }}>
            <Image source={require('../../assets/bookmark-icon.png')} />
          </TouchableOpacity>
        </View>

        <Text style={styles.tags}>
          {buildingInfo.tags.map(tag => `#${tag}`).join(' ')}
        </Text>

        {/* 시설 아이콘 */}
        <View style={styles.facilityRow}>
          {buildingInfo.facilities.map(fac => {
            const icon = facilityIconMap[fac.name.trim()];
            return icon ? (
              <Image key={fac.name} source={icon} style={styles.facilityIcon} />
            ) : null;
          })}
        </View>
      </View>
      {/* 학과 탭 */}
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
        {/* 학과 정보 */}
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

        {/* 층별 안내 */}
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
                      index === selectedFloorIndex && styles.activeFloorTabItem,
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

              {/* 선택된 층 도면 */}
              <Image
                source={{
                  uri: buildingDetail.floorPlans[selectedFloorIndex].imageUrl,
                }}
                style={styles.floorImage}
                resizeMode="contain"
              />
            </>
          )}

        {/* 출발 / 도착 버튼 */}
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
    </ScrollView>
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
  facilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 16,
    marginBottom: 5,
  },
  facilityIcon: {
    resizeMode: 'contain',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: colors.BLACK_700,
  },
  departmentBox: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
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
  button: {
    backgroundColor: colors.BLUE_700,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
