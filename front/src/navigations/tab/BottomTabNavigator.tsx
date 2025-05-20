import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Dimensions, Image, Text, TouchableOpacity, View} from 'react-native';
import MapStackNavigator from '../stack/MapStackNavigator';
import FavoriteHomeScreen from '../../screens/favorite/FavoriteHomeScreen';
import MypageHomeScreen from '../../screens/mypage/MypageHomeScreen';
import {colors} from '../../constants';
import MypageStackNavigator from '../stack/MypageStackNavigator';

const BottomTab = createBottomTabNavigator();
const deviceHeight = Dimensions.get('screen').height;

function BottomTabNavigator() {
  return (
    <BottomTab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,

        // ✅ 탭 바 높이를 적절하게 설정 (기본보다 조금 높게 설정)
        tabBarStyle: {
          height: deviceHeight * 0.08,
          backgroundColor: '#fff',
          paddingBottom: -10, // ✅ 아이콘과 텍스트가 너무 아래로 가지 않도록 패딩 추가
        },

        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',

        // ✅ 아이콘과 텍스트 간격을 자연스럽게 조정
        tabBarLabelStyle: {
          fontSize: 12, // 글자 크기 유지
          paddingBottom: 15, // ✅ 텍스트가 너무 아래로 내려가지 않도록 설정
        },

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
      <BottomTab.Screen name="홈" component={MapStackNavigator} />
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
