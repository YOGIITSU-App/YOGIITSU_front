import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import searchApi from '../api/searchApi';
import buildingApi from '../api/buildingApi';
import {MapStackParamList} from '../navigations/stack/MapStackNavigator';
import {mapNavigation} from '../constants/navigation';

export type SelectContext = {
  selectionType: 'start' | 'end';
  fromResultScreen: boolean;
  routeParams: RouteProp<
    MapStackParamList,
    typeof mapNavigation.SEARCH
  >['params'];
  navigation: StackNavigationProp<MapStackParamList>;
};

export async function selectBuilding(buildingId: number, ctx: SelectContext) {
  const {selectionType, fromResultScreen, routeParams, navigation} = ctx;

  const {data} = await buildingApi.getBuildingDetail(buildingId);
  const {latitude, longitude, name} = data.buildingInfo;
  const location = `${latitude},${longitude}`;

  await searchApi.saveKeyword(name);

  const {
    previousStartLocation = '',
    previousEndLocation = '',
    previousStartLocationName = '',
    previousEndLocationName = '',
    startBuildingId: prevStart,
    endBuildingId: prevEnd,
  } = routeParams ?? {};

  const isStart = selectionType === 'start';
  const cameFromSelection = Boolean(
    previousStartLocation || previousEndLocation,
  );
  const fillingMissing = isStart
    ? !previousStartLocation
    : !previousEndLocation;

  const nextParams = {
    startLocation: isStart ? location : previousStartLocation,
    startLocationName: isStart ? name : previousStartLocationName,
    startBuildingId: isStart ? buildingId : prevStart,
    endLocation: isStart ? previousEndLocation : location,
    endLocationName: isStart ? previousEndLocationName : name,
    endBuildingId: isStart ? prevEnd : buildingId,
  };

  if (cameFromSelection) {
    if (fillingMissing) {
      // 빈 칸 채우기 → 결과 화면
      navigation.replace(mapNavigation.ROUTE_RESULT, nextParams);
    } else {
      // 수정 → 셀렉션으로
      navigation.replace(mapNavigation.ROUTE_SELECTION, nextParams);
    }
    return;
  }

  if (fromResultScreen) {
    // 재검색 → 결과
    navigation.replace(mapNavigation.ROUTE_RESULT, nextParams);
  } else {
    // 최초 검색 → 프리뷰
    navigation.navigate({
      name: mapNavigation.BUILDING_PREVIEW,
      key: `preview-${buildingId}`,
      params: isStart
        ? {
            buildingId,
            endLocation: previousEndLocation,
            endLocationName: previousEndLocationName,
          }
        : {
            buildingId,
            startLocation: previousStartLocation,
            startLocationName: previousStartLocationName,
          },
    });
  }
}
