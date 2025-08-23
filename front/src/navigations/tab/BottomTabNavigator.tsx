import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text, TouchableOpacity } from 'react-native';
import {
  getFocusedRouteNameFromRoute,
  useNavigationState,
} from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import MapStackNavigator from '../stack/MapStackNavigator';
import MypageStackNavigator from '../stack/MypageStackNavigator';
import { useTabOptions } from '../../constants/tabOptions';
import { colors, mapNavigation } from '../../constants';

export type BottomTabParamList = {
  홈: undefined;
  즐겨찾기: undefined;
  MY: undefined;
};

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

// 숨기려는 Map 스택 내부 화면들
const hiddenScreens = [
  mapNavigation.SEARCH,
  mapNavigation.BUILDING_PREVIEW,
  mapNavigation.BUILDING_DETAIL,
  mapNavigation.ROUTE_SELECTION,
  mapNavigation.ROUTE_RESULT,
  mapNavigation.SHUTTLE_DETAIL,
  mapNavigation.SHORTCUT_LIST,
  mapNavigation.SHORTCUT_DETAIL,
  mapNavigation.CHATBOT,
];

export default function BottomTabNavigator() {
  const [selectedTab, setSelectedTab] = useState<'홈' | '즐겨찾기' | 'MY'>(
    '홈',
  );
  const navState = useNavigationState(state => state);
  const tabOptions = useTabOptions();

  useEffect(() => {
    const currentRoute = navState.routes[navState.index]?.name;
    if (
      (currentRoute === '홈' || currentRoute === 'MY') &&
      selectedTab !== currentRoute
    ) {
      setSelectedTab(currentRoute);
    }
  }, [navState]);

  useEffect(() => {
    globalThis.setTabToHome = () => setSelectedTab('홈');
    return () => {
      globalThis.setTabToHome = undefined;
    };
  }, []);

  const createTabButton = (props: any, label: '홈' | '즐겨찾기' | 'MY') => {
    const isFocused = selectedTab === label;
    const handlePress = () => {
      if (label === '즐겨찾기') {
        props.onPress?.();
        requestAnimationFrame(() => {
          setSelectedTab('즐겨찾기');
          globalThis.openFavoriteBottomSheet?.();
        });
      } else {
        setSelectedTab(label);
        globalThis.closeFavoriteBottomSheet?.();
        props.onPress?.();
      }
    };

    const iconSource =
      label === '홈'
        ? require('../../assets/Home.png')
        : label === '즐겨찾기'
        ? require('../../assets/Favorite.png')
        : require('../../assets/MyPage.png');

    return (
      <TouchableOpacity
        {...props}
        onPress={handlePress}
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 15,
        }}
      >
        <Image
          key={`icon-${label}-${isFocused ? 'on' : 'off'}`}
          source={iconSource}
          style={{
            width: 24,
            height: 24,
            ...(isFocused && { tintColor: colors.BLUE_700 }),
          }}
          resizeMode="contain"
          fadeDuration={0}
        />
        <Text
          style={{
            fontSize: 12,
            marginTop: 2,
            color: isFocused ? colors.BLUE_700 : colors.BLACK_500,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <BottomTab.Navigator
      initialRouteName="홈"
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? '';
        const isHidden = hiddenScreens.includes(routeName as any);
        return {
          ...tabOptions,
          detachInactiveScreens: false,
          tabBarStyle: isHidden ? { display: 'none' } : tabOptions.tabBarStyle,
        };
      }}
    >
      <BottomTab.Screen
        name="홈"
        component={MapStackNavigator}
        options={{
          tabBarButton: props => createTabButton(props, '홈'),
        }}
      />

      <BottomTab.Screen
        name="즐겨찾기"
        component={MapStackNavigator}
        options={{
          tabBarButton: props => createTabButton(props, '즐겨찾기'),
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('홈');
          },
        })}
      />

      <BottomTab.Screen
        name="MY"
        component={MypageStackNavigator}
        options={{
          tabBarButton: props => createTabButton(props, 'MY'),
        }}
      />
    </BottomTab.Navigator>
  );
}
