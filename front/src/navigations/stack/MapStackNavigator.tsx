import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import MapHomeScreen from '../../screens/map/MapHomeScreen';
import SearchScreen from '../../screens/map/SearchScreen';
import {mapNavigation} from '../../constants';
import RouteSelectionScreen from '../../screens/map/RouteSelectionScreen';
import RouteResultScreen from '../../screens/map/RouteResultScreen';

// 네비게이션 파라미터 타입 정의
export type MapStackParamList = {
  [mapNavigation.MAPHOME]:
    | {
        selectedPlace?: string;
        selectedLocation?: string; // ✅ 추가
        selectionType?: 'start' | 'end'; // ✅ 추가
        startLocation?: string;
        startLocationName?: string;
        endLocation?: string;
        endLocationName?: string;
      }
    | undefined;
  [mapNavigation.SEARCH]: {
    selectionType: 'start' | 'end';
    previousStartLocation?: string;
    previousStartLocationName?: string;
    previousEndLocation?: string;
    previousEndLocationName?: string;
  };
  [mapNavigation.ROUTE_SELECTION]: {
    startLocation?: string;
    startLocationName?: string;
    endLocation?: string;
    endLocationName?: string;
  };
  [mapNavigation.ROUTE_RESULT]: {
    startLocation: string;
    startLocationName: string;
    endLocation: string;
    endLocationName: string;
  };
};

const Stack = createStackNavigator<MapStackParamList>();

function MapStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MapHome"
        component={MapHomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{title: '검색'}}
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
