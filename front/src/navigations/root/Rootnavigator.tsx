import React, {useState, createContext} from 'react'; // ✅ useState, createContext 추가
import {createStackNavigator} from '@react-navigation/stack';
import AuthStackNavigator from '../stack/AuthStackNavigator';
import BottomTabNavigator from '../drawer/BottomTabNavigator';

// 🔹 네비게이터에서 사용할 타입 정의
export type RootStackParamList = {
  AuthStack: undefined;
  BottomTab: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();

// 🔹 AuthContext 생성
export const AuthContext = createContext<{
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // ✅ 로그인 상태 관리

  return (
    <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn}}>
      <RootStack.Navigator screenOptions={{headerShown: false}}>
        {isLoggedIn ? (
          <RootStack.Screen name="BottomTab" component={BottomTabNavigator} />
        ) : (
          <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
        )}
      </RootStack.Navigator>
    </AuthContext.Provider>
  );
}

export default RootNavigator;
