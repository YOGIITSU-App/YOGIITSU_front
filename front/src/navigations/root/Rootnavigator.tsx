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
import PopupAd from '../../components/ad/PopupAd';

export type RootStackParamList = { AuthStack: undefined; BottomTab: undefined };
const RootStack = createStackNavigator<RootStackParamList>();

function RootNavigatorContent() {
  const { isAuthenticated, logout, isGuest, initialized } = useUser();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const splashHiddenRef = useRef(false);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    if (!checkingAuth && (isAuthenticated || isGuest)) {
      const timer = setTimeout(() => {
        setShowAd(true);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [checkingAuth, isAuthenticated, isGuest]);

  const safeHide = () => {
    if (splashHiddenRef.current) return;
    splashHiddenRef.current = true;
    console.log('[RootNavigator] Hiding splash screen');
    BootSplash.hide({ fade: true });
  };

  // 강제 로그아웃
  useEffect(() => {
    const handleLogout = async () => {
      console.log('[RootNavigator] Force logout triggered');
      await EncryptedStorage.clear();
      await logout();
      setCheckingAuth(false);
      console.log('[RootNavigator] Logout completed');
    };

    logoutEmitter.addListener('force-logout', handleLogout);
    return () => {
      logoutEmitter.removeListener?.('force-logout', handleLogout);
      logoutEmitter.off?.('force-logout', handleLogout);
    };
  }, [logout]);

  // 자동 로그인 - 토큰 갱신
  useEffect(() => {
    if (!initialized) {
      console.log('[RootNavigator] Waiting for initialization...');
      return;
    }

    (async () => {
      try {
        console.log('[RootNavigator] Starting auth check...', {
          isAuthenticated,
          isGuest,
        });

        if (isGuest) {
          console.log('[RootNavigator] Guest mode');
          setCheckingAuth(false);
          safeHide();
          return;
        }

        if (!isAuthenticated) {
          console.log('[RootNavigator] Not authenticated');
          setCheckingAuth(false);
          safeHide();
          return;
        }

        // 인증된 사용자 - 토큰 갱신 시도
        console.log(
          '[RootNavigator] User authenticated, attempting token refresh...',
        );

        const [accessToken, refreshTokenValue] = await Promise.all([
          EncryptedStorage.getItem('accessToken'),
          EncryptedStorage.getItem('refreshToken'),
        ]);

        if (accessToken && refreshTokenValue) {
          try {
            const res = await refreshToken(accessToken, refreshTokenValue);
            const rawAuth =
              res.headers.authorization || res.headers.Authorization;
            const newAccessToken = rawAuth?.split(' ')[1];
            const newRefreshToken = res.headers['x-refresh-token'];

            if (newAccessToken && newRefreshToken) {
              await Promise.all([
                EncryptedStorage.setItem('accessToken', newAccessToken),
                EncryptedStorage.setItem('refreshToken', newRefreshToken),
              ]);
              console.log('[RootNavigator] Token refresh successful');
            } else {
              console.warn(
                '[RootNavigator] Token refresh failed - invalid tokens',
              );
              await logout();
            }
          } catch (refreshErr) {
            console.warn('[RootNavigator] Token refresh failed:', refreshErr);
            await logout();
          }
        } else {
          console.warn('[RootNavigator] No tokens found');
          await logout();
        }
      } catch (err) {
        console.error('[RootNavigator] Auth check error:', err);
        await logout();
      } finally {
        setCheckingAuth(false);
        safeHide();
      }
    })();
  }, [initialized, isAuthenticated, isGuest, logout]);

  console.log('[RootNavigator] Render state:', {
    checkingAuth,
    isAuthenticated,
    isGuest,
    initialized,
  });

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
        <>
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated || isGuest ? (
              <RootStack.Screen
                name="BottomTab"
                component={BottomTabNavigator}
              />
            ) : (
              <RootStack.Screen
                name="AuthStack"
                component={AuthStackNavigator}
              />
            )}
          </RootStack.Navigator>
          {showAd && <PopupAd />}
        </>
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
