import {Dimensions} from 'react-native';

const deviceHeight = Dimensions.get('screen').height;

export const defaultTabOptions = {
  headerShown: false,

  tabBarStyle: {
    height: deviceHeight * 0.08,
    backgroundColor: '#fff',
    paddingBottom: -10,
  },
  tabBarActiveTintColor: 'blue',
  tabBarInactiveTintColor: 'gray',
  tabBarLabelStyle: {
    fontSize: 12,
    paddingBottom: 15,
  },
  tabBarIconStyle: {
    width: 24,
    height: 24,
  },
};
