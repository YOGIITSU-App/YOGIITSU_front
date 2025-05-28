import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Dimensions, Image, Text, TouchableOpacity} from 'react-native';
import MapStackNavigator from '../stack/MapStackNavigator';
import MypageStackNavigator from '../stack/MypageStackNavigator';
import {defaultTabOptions} from '../../constants/tabOptions';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {mapNavigation} from '../../constants';

const BottomTab = createBottomTabNavigator();
const deviceHeight = Dimensions.get('screen').height;

function BottomTabNavigator() {
  return (
    <BottomTab.Navigator
      screenOptions={({route}) => ({
        ...defaultTabOptions, // 👉 한 번에 적용!!

        tabBarIcon: ({color, size}) => {
          let iconSource;

          if (route.name === '홈') {
            iconSource = require('../../assets/Home.png');
          } else if (route.name === '즐겨찾기') {
            iconSource = require('../../assets/Favorite.png');
          } else if (route.name === 'MY') {
            iconSource = require('../../assets/MyPage.png');
          }

          return (
            <Image
              source={iconSource}
              style={{
                width: size * 0.8,
                height: size * 0.85,
                tintColor: color,
              }}
              resizeMode="contain"
            />
          );
        },
      })}>
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
          tabBarButton: props => {
            const isFocused = props.accessibilityState?.selected;

            return (
              <TouchableOpacity
                {...props}
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  paddingBottom: 15,
                }}
                onPress={() => globalThis.openFavoriteBottomSheet?.()}>
                <Image
                  source={require('../../assets/Favorite.png')}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: isFocused ? 'blue' : 'gray',
                  }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 2,
                    color: isFocused ? 'blue' : 'gray',
                  }}>
                  즐겨찾기
                </Text>
              </TouchableOpacity>
            );
          },
        }}
      />

      <BottomTab.Screen name="MY" component={MypageStackNavigator} />
    </BottomTab.Navigator>
  );
}

export default BottomTabNavigator;
