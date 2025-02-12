import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import MapHomeScreen from '../../screens/map/MapHomeScreen';
import SearchScreen from '../../screens/map/SearchScreen';
import PlaceDetailScreen from '../../screens/map/PlaceDetailScreen';
import {mapNavigation} from '../../constants';

// 네비게이션 파라미터 타입 정의
export type MapStackParamList = {
  [mapNavigation.MAPHOME]:
    | {selectedPlace?: string; startLocation?: string; endLocation?: string}
    | undefined;
  [mapNavigation.SEARCH]: undefined;
  [mapNavigation.PLACEDETAIL]: {placeName: string}; // ✅ 장소 정보를 전달받을 수 있도록 설정
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
        name="PlaceDetail"
        component={PlaceDetailScreen}
        options={{title: '장소 정보'}}
      />
    </Stack.Navigator>
  );
}

export default MapStackNavigator;
