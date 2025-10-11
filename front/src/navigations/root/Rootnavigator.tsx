import React, { useEffect, useRef, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthStackNavigator from '../stack/AuthStackNavigator';
import BottomTabNavigator from '../tab/BottomTabNavigator';
import { UserProvider, useUser } from '../../contexts/UserContext';
import EncryptedStorage from 'react-native-encrypted-storage';
import BootSplash from 'react-native-bootsplash';
import { logoutEmitter } from '../../utils/logoutEmitter';
import { refreshToken } from '../../api/refreshApi';
import { ActivityIndicator, StatusBar, View } from 'react-native';

export type RootStackParamList = { AuthStack: undefined; BottomTab: undefined };
const RootStack = createStackNavigator<RootStackParamList>();

function RootNavigatorContent() {
  const { user, login, logout, isGuest, guestLoaded } = useUser();

  const [authStatus, setAuthStatus] = useState<'unknown' | 'guest' | 'member'>(
    'unknown',
  );
  const [checkingAuth, setCheckingAuth] = useState(true);

  const splashHiddenRef = useRef(false);
  const safeHide = () => {
    if (splashHiddenRef.current) return;
    splashHiddenRef.current = true;
    BootSplash.hide({ fade: true });
  };

  // 강제 타임아웃 방지 (iOS 안전용)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (checkingAuth) {
        console.warn('[RootNavigator] Auth check timeout → fallback to guest');
        setAuthStatus('guest');
        setCheckingAuth(false);
        safeHide();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [checkingAuth]);

  // 강제 로그아웃
  useEffect(() => {
    const handleLogout = async () => {
      await EncryptedStorage.clear();
      logout();
      setAuthStatus('guest');
      setCheckingAuth(false);
      safeHide();
    };
    logoutEmitter.addListener('force-logout', handleLogout);
    return () => {
      logoutEmitter.removeListener?.('force-logout', handleLogout);
      logoutEmitter.off?.('force-logout', handleLogout);
    };
  }, [logout]);

  // 자동 로그인 복원
  useEffect(() => {
    if (!guestLoaded) {
      return;
    }

    if (user && !isGuest) {
      setAuthStatus('member');
      setCheckingAuth(false);
      safeHide();
      return;
    }

    if (isGuest) {
      setAuthStatus('guest');
      setCheckingAuth(false);
      safeHide();
      return;
    }

    let isCancelled = false;

    (async () => {
      try {
        const [userId, role, accessToken, refreshTokenValue] =
          await Promise.all([
            EncryptedStorage.getItem('userId'),
            EncryptedStorage.getItem('role'),
            EncryptedStorage.getItem('accessToken'),
            EncryptedStorage.getItem('refreshToken'),
          ]);

        if (isCancelled) return;

        if (userId && role && accessToken && refreshTokenValue) {
          const res = await refreshToken(accessToken, refreshTokenValue);

          if (isCancelled) return;

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

          if (isCancelled) return;

          const parsedUserId = parseInt(userId, 10);
          if (!isNaN(parsedUserId) && parsedUserId > 0) {
            if (!user)
              login({ userId: parsedUserId, role: role as 'USER' | 'ADMIN' });
            setAuthStatus('member');
            setCheckingAuth(false);
            safeHide();
            return;
          }
        }

        if (isCancelled) return;
        logout();
        setAuthStatus('guest');
        setCheckingAuth(false);
        safeHide();
      } catch (err) {
        console.warn('[RootNavigator] refreshToken 실패', err);
        if (isCancelled) return;
        logout();
        setAuthStatus('guest');
        setCheckingAuth(false);
        safeHide();
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [login, logout, user, isGuest, guestLoaded]);

  useEffect(() => {
    if (!checkingAuth) {
      safeHide();
    }
  }, [checkingAuth]);

  useEffect(() => {
    if (user && !isGuest) {
      console.log('[RootNavigator] user detected → member 전환');
      setAuthStatus('member');
      setCheckingAuth(false);
      safeHide();
    }
  }, [user, isGuest]);

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {checkingAuth ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
          }}
        >
          <ActivityIndicator size="large" color="#3352F2" />
        </View>
      ) : (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {authStatus === 'member' || isGuest ? (
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
