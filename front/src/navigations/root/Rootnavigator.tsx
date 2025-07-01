// src/navigations/root/Rootnavigator.tsx

import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import AuthStackNavigator from '../stack/AuthStackNavigator';
import BottomTabNavigator from '../tab/BottomTabNavigator';
import {UserProvider, useUser} from '../../contexts/UserContext';
import EncryptedStorage from 'react-native-encrypted-storage';
import BootSplash from 'react-native-bootsplash';
import {logoutEmitter} from '../../utils/logoutEmitter';
import {refreshToken} from '../../api/refreshApi'; // ← 추가

export type RootStackParamList = {
  AuthStack: undefined;
  BottomTab: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();

function RootNavigatorContent() {
  const {user, login, logout} = useUser();

  // 강제 로그아웃 리스너
  useEffect(() => {
    const handleLogout = async () => {
      await EncryptedStorage.clear();
      logout();
    };
    logoutEmitter.addListener('force-logout', handleLogout);

    return () => {
      logoutEmitter.removeAllListeners('force-logout');
    };
  }, [logout]);

  // 자동 로그인 복원 + 토큰 리프레시 + 스플래시 숨기기
  useEffect(() => {
    (async () => {
      try {
        // 1) 저장된 정보 불러오기
        const userInfoJson = await EncryptedStorage.getItem('userInfo');
        const accessToken = await EncryptedStorage.getItem('accessToken');
        const refreshTokenValue = await EncryptedStorage.getItem(
          'refreshToken',
        );

        if (userInfoJson && accessToken && refreshTokenValue) {
          // 2) 앱 시작 시 토큰 무조건 리프레시
          const res = await refreshToken(accessToken, refreshTokenValue);
          // 응답 헤더에서 새 토큰 추출
          const rawAuth =
            res.headers.authorization || res.headers.Authorization;
          const newAccessToken = rawAuth?.split(' ')[1];
          const newRefreshToken = res.headers['x-refresh-token'];

          if (newAccessToken && newRefreshToken) {
            await EncryptedStorage.setItem('accessToken', newAccessToken);
            await EncryptedStorage.setItem('refreshToken', newRefreshToken);
          } else {
            throw new Error('토큰 재발급 실패');
          }

          // 3) Context에 로그인 처리
          const {userId, role} = JSON.parse(userInfoJson);
          login({userId, role});
        }
      } catch (e) {
        console.warn('앱 시작 토큰 리프레시 실패, 로그아웃 처리', e);
        await EncryptedStorage.clear();
        logout();
      } finally {
        // 4) 복원/리프레시 완료 후 스플래시 숨김
        BootSplash.hide({fade: true});
      }
    })();
  }, [login, logout]);

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

export default function RootNavigator() {
  return (
    <UserProvider>
      <RootNavigatorContent />
    </UserProvider>
  );
}
