import {
  BottomTabNavigationProp,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {Image, Text, TouchableOpacity} from 'react-native';
import MapStackNavigator from '../stack/MapStackNavigator';
import MypageStackNavigator from '../stack/MypageStackNavigator';
import {defaultTabOptions} from '../../constants/tabOptions';
import {
  getFocusedRouteNameFromRoute,
  useNavigation,
  useNavigationState,
} from '@react-navigation/native';
import {colors, mapNavigation} from '../../constants';
import React, {useEffect, useState} from 'react';

export type BottomTabParamList = {
  홈: undefined;
  즐겨찾기: undefined;
  MY: undefined;
};

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

function BottomTabNavigator() {
  const [selectedTab, setSelectedTab] = useState<
    '홈' | 'MY' | '즐겨찾기' | null
  >('홈');
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const navState = useNavigationState(state => state);

  // 현재 라우트 감지해서 탭 상태 동기화
  useEffect(() => {
    const currentRoute = navState.routes[navState.index]?.name;

    // 탭 아이콘 색상 상태 업데이트
    if (
      selectedTab !== currentRoute &&
      (currentRoute === '홈' || currentRoute === 'MY')
    ) {
      setSelectedTab(currentRoute as '홈' | 'MY');
    }
  }, [navState]);

  // 공통 버튼 생성
  const createTabButton = (props: any, label: '홈' | 'MY' | '즐겨찾기') => {
    const isFocused = selectedTab === label;

    const handlePress = () => {
      if (label === '즐겨찾기') {
        // 홈으로 이동한 뒤 토글
        navigation.navigate('홈');
        requestAnimationFrame(() => {
          setSelectedTab('즐겨찾기');
          globalThis.openFavoriteBottomSheet?.();
        });
      } else {
        // 일반 탭: 선택 + 즐겨찾기 바텀시트 닫기
        setSelectedTab(label);
        globalThis.closeFavoriteBottomSheet?.();
        props.onPress?.();
      }
    };

    return (
      <TouchableOpacity
        {...props}
        onPress={handlePress}
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 15,
        }}>
        <Image
          source={
            label === '홈'
              ? require('../../assets/Home.png')
              : label === '즐겨찾기'
              ? require('../../assets/Favorite.png')
              : require('../../assets/MyPage.png')
          }
          style={{
            width: 24,
            height: 24,
            ...(isFocused && {tintColor: colors.BLUE_700}),
          }}
          resizeMode="contain"
        />
        <Text
          style={{
            fontSize: 12,
            marginTop: 2,
            color: isFocused ? colors.BLUE_700 : colors.BLACK_500,
          }}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <BottomTab.Navigator screenOptions={{...defaultTabOptions}}>
      <BottomTab.Screen
        name="홈"
        component={MapStackNavigator}
        options={({route}) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? '';
          const hiddenScreens = [
            mapNavigation.SEARCH,
            mapNavigation.BUILDING_PREVIEW,
            mapNavigation.BUILDING_DETAIL,
            mapNavigation.ROUTE_SELECTION,
            mapNavigation.ROUTE_RESULT,
          ];
          return {
            tabBarButton: props => createTabButton(props, '홈'),
            tabBarStyle: hiddenScreens.includes(routeName as any)
              ? {display: 'none'}
              : defaultTabOptions.tabBarStyle,
          };
        }}
      />
      <BottomTab.Screen
        name="즐겨찾기"
        component={MapStackNavigator}
        options={{
          tabBarButton: props => createTabButton(props, '즐겨찾기'),
        }}
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

export default BottomTabNavigator;
