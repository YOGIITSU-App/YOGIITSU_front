import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Dimensions, Image} from 'react-native';
import MapStackNavigator from '../stack/MapStackNavigator';
import FavoriteHomeScreen from '../../screens/favorite/FavoriteHomeScreen';
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
      <BottomTab.Screen name="즐겨찾기" component={FavoriteHomeScreen} />
      <BottomTab.Screen
        name="MY"
        component={MypageStackNavigator} // ✅ 변경!
      />
    </BottomTab.Navigator>
  );
}

export default BottomTabNavigator;
