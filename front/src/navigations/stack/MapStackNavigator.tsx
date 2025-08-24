import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import MapHomeScreen from '../../screens/map/MapHomeScreen';
import SearchScreen from '../../screens/map/SearchScreen';
import { colors, mapNavigation } from '../../constants';
import RouteSelectionScreen from '../../screens/map/RouteSelectionScreen';
import RouteResultScreen from '../../screens/map/RouteResultScreen';
import BuildingPreviewScreen from '../../screens/map/BuildingPreviewScreen';
import BuildingDetailScreen from '../../screens/map/BuildingDetailScreen';
import ShortcutListScreen from '../../screens/map/ShortcutListScreen';
import ShortcutDetailScreen from '../../screens/map/ShortcutDetailScreen';
import ShuttleDetailScreen from '../../screens/map/ShuttleDetailScreen';
import { ShuttleSchedule } from '../../api/shuttleApi';
import ChatbotScreen from '../../screens/map/ChatbotScreen';

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
    startBuildingId?: number;
    endBuildingId?: number;
  };

  [mapNavigation.BUILDING_DETAIL]: {
    buildingId: number;
    startLocation?: string;
    startLocationName?: string;
    endLocation?: string;
    endLocationName?: string;
    startBuildingId?: number;
    endBuildingId?: number;
  };

  [mapNavigation.SEARCH]: {
    selectionType: 'start' | 'end';
    source?: 'selection' | 'home' | 'preview' | 'result';
    fromResultScreen: boolean;
    previousStartLocation?: string;
    previousStartLocationName?: string;
    previousEndLocation?: string;
    previousEndLocationName?: string;
    startBuildingId?: number;
    endBuildingId?: number;
    keyword?: string;
  };
  [mapNavigation.ROUTE_SELECTION]: {
    startLocation?: string;
    startLocationName?: string;
    endLocation?: string;
    endLocationName?: string;
    startBuildingId?: number;
    endBuildingId?: number;
    locationsAreSame?: boolean;
    lastSelectedType?: 'start' | 'end';
  };
  [mapNavigation.ROUTE_RESULT]: {
    startLocation: string;
    startLocationName: string;
    endLocation: string;
    endLocationName: string;
    startBuildingId?: number;
    endBuildingId?: number;
  };
  [mapNavigation.SHUTTLE_DETAIL]: {
    shuttleSchedule: ShuttleSchedule;
    selectedTime: string;
    currentStopName?: string;
  };
  [mapNavigation.SHORTCUT_LIST]: undefined;
  [mapNavigation.SHORTCUT_DETAIL]: {
    shortcutId: number;
  };
  [mapNavigation.CHATBOT]: undefined;
};

const Stack = createStackNavigator<MapStackParamList>();

function MapStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen
        name={mapNavigation.MAPHOME}
        component={MapHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={mapNavigation.SEARCH}
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={mapNavigation.BUILDING_PREVIEW}
        component={BuildingPreviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={mapNavigation.BUILDING_DETAIL}
        component={BuildingDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={mapNavigation.ROUTE_SELECTION}
        component={RouteSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={mapNavigation.ROUTE_RESULT}
        component={RouteResultScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={mapNavigation.SHUTTLE_DETAIL}
        component={ShuttleDetailScreen}
        options={{
          title: '셔틀버스',
          headerTitleStyle: { fontSize: 16, fontWeight: '600' },
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name={mapNavigation.SHORTCUT_LIST}
        component={ShortcutListScreen}
        options={{
          title: '지름길',
          headerStyle: { backgroundColor: colors.BLUE_700 },
          headerTintColor: '#fff',
          headerTitleStyle: { fontSize: 16, fontWeight: '600' },
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name={mapNavigation.SHORTCUT_DETAIL}
        component={ShortcutDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={mapNavigation.CHATBOT}
        component={ChatbotScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default MapStackNavigator;
