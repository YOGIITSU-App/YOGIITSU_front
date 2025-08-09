import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const useTabOptions = () => {
  const insets = useSafeAreaInsets();
  return {
    headerShown: false,
    tabBarStyle: {
      height: 70 + insets.bottom,
      backgroundColor: '#fff',
      paddingBottom: insets.bottom,
    },
    tabBarActiveTintColor: 'blue',
    tabBarInactiveTintColor: 'gray',
    tabBarLabelStyle: {
      fontSize: 12,
      paddingBottom: 8,
    },
    tabBarIconStyle: {
      width: 24,
      height: 24,
      marginTop: 8,
    },
  };
};
