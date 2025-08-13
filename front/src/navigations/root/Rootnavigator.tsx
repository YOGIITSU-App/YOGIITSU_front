import React, { useEffect, useRef, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthStackNavigator from '../stack/AuthStackNavigator';
import BottomTabNavigator from '../tab/BottomTabNavigator';
import { UserProvider, useUser } from '../../contexts/UserContext';
import EncryptedStorage from 'react-native-encrypted-storage';
import BootSplash from 'react-native-bootsplash';
import { logoutEmitter } from '../../utils/logoutEmitter';
import { refreshToken } from '../../api/refreshApi';
import { StatusBar } from 'react-native';
import { useAppInit } from '../../contexts/AppInitContext';

export type RootStackParamList = { AuthStack: undefined; BottomTab: undefined };
const RootStack = createStackNavigator<RootStackParamList>();

function RootNavigatorContent() {
  const { user, login, logout } = useUser();
  const { mapReady, resetMapReady } = useAppInit();

  // 인증 상태
  const [authStatus, setAuthStatus] = useState<'unknown' | 'guest' | 'member'>(
    'unknown',
  );
  // 인증 검사 중 플래그
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 중복 hide 방지
  const splashHiddenRef = useRef(false);
  const safeHide = () => {
    if (splashHiddenRef.current) return;
    splashHiddenRef.current = true;
    BootSplash.hide({ fade: true });
  };

  // 강제 로그아웃 리스너
  useEffect(() => {
    const handleLogout = async () => {
      await EncryptedStorage.clear();
      logout();
      setAuthStatus('guest');
      setCheckingAuth(false);
    };
    logoutEmitter.addListener('force-logout', handleLogout);
    return () => {
      // 등록했던 동일 콜백으로 해제
      // @ts-ignore
      logoutEmitter.removeListener?.('force-logout', handleLogout);
      // @ts-ignore
      logoutEmitter.off?.('force-logout', handleLogout);
    };
  }, [logout]);

  // 자동 로그인 복원 + 토큰 리프레시 → authStatus 결정
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
          if (!newAccessToken || !newRefreshToken)
            throw new Error('토큰 재발급 실패');

          await Promise.all([
            EncryptedStorage.setItem('accessToken', newAccessToken),
            EncryptedStorage.setItem('refreshToken', newRefreshToken),
          ]);

          const parsedUserId = parseInt(userId, 10);
          if (!isNaN(parsedUserId) && parsedUserId > 0) {
            if (!user)
              login({ userId: parsedUserId, role: role as 'USER' | 'ADMIN' });
            setAuthStatus('member');
            setCheckingAuth(false);
            return;
          }
        }

        // 비로그인 처리
        await EncryptedStorage.clear();
        logout();
        setAuthStatus('guest');
        setCheckingAuth(false);
      } catch {
        await EncryptedStorage.clear();
        logout();
        setAuthStatus('guest');
        setCheckingAuth(false);
      }
    })();
  }, [login, logout, user]);

  useEffect(() => {
    if (checkingAuth) return;

    if (authStatus === 'guest') {
      // 로그인 안 된 상태: 즉시 hide → 로그인 화면 노출
      safeHide();
    } else if (authStatus === 'member' && mapReady) {
      // 로그인 된 상태: MapHome이 준비됐을 때 hide
      safeHide();
      resetMapReady();
    }
  }, [checkingAuth, authStatus, mapReady, resetMapReady]);

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {checkingAuth ? null : (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {authStatus === 'member' ? (
            <RootStack.Screen name="BottomTab" component={BottomTabNavigator} />
          ) : (
            <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
          )}
        </RootStack.Navigator>
      )}
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
