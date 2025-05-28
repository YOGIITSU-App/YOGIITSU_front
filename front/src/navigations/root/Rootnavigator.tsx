import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import AuthStackNavigator from '../stack/AuthStackNavigator';
import BottomTabNavigator from '../tab/BottomTabNavigator';
import {UserProvider, useUser} from '../../contexts/UserContext'; // ✅ UserContext 추가
import EncryptedStorage from 'react-native-encrypted-storage';
import {logoutEmitter} from '../../utils/logoutEmitter';

// 네비게이터에서 사용할 타입 정의
export type RootStackParamList = {
  AuthStack: undefined;
  BottomTab: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();

// 유저 로그인 상태에 따라 화면 분기
function RootNavigatorContent() {
  const {user, logout} = useUser();

  useEffect(() => {
    const handleLogout = async () => {
      await EncryptedStorage.clear(); // 토큰 삭제
      logout(); // context 초기화
    };

    logoutEmitter.addListener('force-logout', handleLogout);

    return () => {
      logoutEmitter.removeAllListeners('force-logout');
    };
  }, [logout]);

  return (
    <RootStack.Navigator screenOptions={{headerShown: false}}>
      {user ? (
        <RootStack.Screen name="BottomTab" component={BottomTabNavigator} />
      ) : (
        <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
      )}
    </RootStack.Navigator>
  );
}

function RootNavigator() {
  return (
    <UserProvider>
      <RootNavigatorContent />
    </UserProvider>
  );
}

export default RootNavigator;
