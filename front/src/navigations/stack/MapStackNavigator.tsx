import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import MapHomeScreen from '../../screens/map/MapHomeScreen';
import SearchScreen from '../../screens/map/SearchScreen';
import {mapNavigation} from '../../constants';
import RouteSelectionScreen from '../../screens/map/RouteSelectionScreen';
import RouteResultScreen from '../../screens/map/RouteResultScreen';
import BuildingPreviewScreen from '../../screens/map/BuildingPreviewScreen';
import BuildingDetailScreen from '../../screens/map/BuildingDetailScreen';

// 네비게이션 파라미터 타입 정의
export type MapStackParamList = {
  [mapNavigation.MAPHOME]:
    | {
        buildingId?: number;
        selectedPlace?: string;
        selectedLocation?: string;
        selectionType?: 'start' | 'end';
        startLocation?: string;
        startLocationName?: string;
        endLocation?: string;
        endLocationName?: string;
      }
    | undefined;
  [mapNavigation.BUILDING_PREVIEW]: {
    buildingId: number;
    startLocation?: string;
    startLocationName?: string;
    endLocation?: string;
    endLocationName?: string;
  };

  [mapNavigation.BUILDING_DETAIL]: {
    buildingId: number;
    startLocation?: string;
    startLocationName?: string;
    endLocation?: string;
    endLocationName?: string;
  };

  [mapNavigation.SEARCH]: {
    selectionType: 'start' | 'end';
    fromResultScreen: boolean;
    previousStartLocation?: string;
    previousStartLocationName?: string;
    previousEndLocation?: string;
    previousEndLocationName?: string;
    startBuildingId?: number;
    endBuildingId?: number;
  };
  [mapNavigation.ROUTE_SELECTION]: {
    startLocation?: string;
    startLocationName?: string;
    endLocation?: string;
    endLocationName?: string;
    startBuildingId?: number;
    endBuildingId?: number;
  };
  [mapNavigation.ROUTE_RESULT]: {
    startLocation: string;
    startLocationName: string;
    endLocation: string;
    endLocationName: string;
    startBuildingId?: number;
    endBuildingId?: number;
  };
};

const Stack = createStackNavigator<MapStackParamList>();

function MapStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={mapNavigation.MAPHOME}
        component={MapHomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={mapNavigation.SEARCH}
        component={SearchScreen}
        options={{title: '검색'}}
      />
      <Stack.Screen
        name={mapNavigation.BUILDING_PREVIEW}
        component={BuildingPreviewScreen}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name={mapNavigation.BUILDING_DETAIL}
        component={BuildingDetailScreen}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name={mapNavigation.ROUTE_SELECTION}
        component={RouteSelectionScreen}
        options={{headerTitle: '출발 & 도착 선택'}}
      />
      <Stack.Screen
        name={mapNavigation.ROUTE_RESULT}
        component={RouteResultScreen}
        options={{title: '길찾기 결과'}}
      />
    </Stack.Navigator>
  );
}

export default MapStackNavigator;
