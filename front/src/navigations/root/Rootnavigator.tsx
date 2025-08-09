import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthStackNavigator from '../stack/AuthStackNavigator';
import BottomTabNavigator from '../tab/BottomTabNavigator';
import { UserProvider, useUser } from '../../contexts/UserContext';
import EncryptedStorage from 'react-native-encrypted-storage';
import BootSplash from 'react-native-bootsplash';
import { logoutEmitter } from '../../utils/logoutEmitter';
import { refreshToken } from '../../api/refreshApi';
import { StatusBar } from 'react-native';

export type RootStackParamList = {
  AuthStack: undefined;
  BottomTab: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();

function RootNavigatorContent() {
  const { user, login, logout } = useUser();

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
        const [userId, role, accessToken, refreshTokenValue] =
          await Promise.all([
            EncryptedStorage.getItem('userId'),
            EncryptedStorage.getItem('role'),
            EncryptedStorage.getItem('accessToken'),
            EncryptedStorage.getItem('refreshToken'),
          ]);

        if (userId && role && accessToken && refreshTokenValue) {
          const res = await refreshToken(accessToken, refreshTokenValue);
          const rawAuth =
            res.headers.authorization || res.headers.Authorization;
          const newAccessToken = rawAuth?.split(' ')[1];
          const newRefreshToken = res.headers['x-refresh-token'];

          if (!newAccessToken || !newRefreshToken) {
            throw new Error('토큰 재발급 실패');
          }

          // 토큰 저장
          await Promise.all([
            EncryptedStorage.setItem('accessToken', newAccessToken),
            EncryptedStorage.setItem('refreshToken', newRefreshToken),
          ]);

          const parsedUserId = parseInt(userId, 10);
          if (isNaN(parsedUserId) || parsedUserId <= 0) {
            throw new Error(`유효하지 않은 userId: ${userId}`);
          }

          // 로그인 상태가 아니라면만 login 호출
          if (!user) {
            login({ userId: parsedUserId, role: role as 'USER' | 'ADMIN' });
          }
        }
      } catch (e) {
        console.warn('앱 시작 토큰 리프레시 실패, 로그아웃 처리', e);
        await EncryptedStorage.clear();
        logout();
      } finally {
        BootSplash.hide({ fade: true });
      }
    })();
  }, [login, logout]);

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content" // 필요에 따라 'light-content'
      />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="BottomTab" component={BottomTabNavigator} />
        ) : (
          <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
        )}
      </RootStack.Navigator>
    </>
  );
}

export default function RootNavigator() {
  return (
    <UserProvider>
      <RootNavigatorContent />
    </UserProvider>
  );
}
