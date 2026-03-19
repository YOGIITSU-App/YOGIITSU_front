import EncryptedStorage from 'react-native-encrypted-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import messaging from '@react-native-firebase/messaging';
import fcmApi from '../api/fcmApi';
import { PermissionsAndroid, Platform } from 'react-native';
import * as NavigationService from '../utils/NavigationService';

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<{
    userId: number;
    role: 'USER' | 'ADMIN';
  } | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const login = (userData: { userId: number; role: 'USER' | 'ADMIN' }) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    setUser(null);
    setIsGuest(false);
    setIsAuthenticated(false);
    try {
      await EncryptedStorage.clear();
    } catch (err) {
      console.error('[UserContext] Logout Error:', err);
    }
  };

  const setGuest = async (value: boolean) => {
    try {
      if (value) {
        await EncryptedStorage.setItem('guest_mode', 'true');
        setIsGuest(true);
      } else {
        await EncryptedStorage.removeItem('guest_mode');
        setIsGuest(false);
      }
    } catch (err) {
      setIsGuest(value);
    }
  };

  // 초기화 로직
  useEffect(() => {
    (async () => {
      try {
        const guest = await EncryptedStorage.getItem('guest_mode');
        if (guest === 'true') {
          setIsGuest(true);
          return;
        }

        const [accessToken, refreshToken] = await Promise.all([
          EncryptedStorage.getItem('accessToken'),
          EncryptedStorage.getItem('refreshToken'),
        ]);

        if (accessToken && refreshToken) {
          const appleUserId = await EncryptedStorage.getItem('appleUserId');
          if (appleUserId) {
            const credentialState = await appleAuth.getCredentialStateForUser(
              appleUserId,
            );
            if (credentialState === appleAuth.State.REVOKED) {
              await EncryptedStorage.clear();
              return;
            }
          }

          setIsAuthenticated(true);
          const [userId, role] = await Promise.all([
            EncryptedStorage.getItem('userId'),
            EncryptedStorage.getItem('role'),
          ]);

          if (userId && role) {
            setUser({ userId: Number(userId), role: role as 'USER' | 'ADMIN' });
          }
        }
      } catch (err) {
        console.warn('[UserContext] Init Error:', err);
      } finally {
        setInitialized(true);
      }
    })();
  }, []);

  // FCM 설정 로직
  useEffect(() => {
    let isSubscribed = true;

    if (isAuthenticated) {
      const setupFCM = async () => {
        try {
          const accessToken = await EncryptedStorage.getItem('accessToken');
          if (!accessToken) return;

          // 권한 요청
          if (Platform.OS === 'ios') {
            const authStatus = await messaging().requestPermission();
            if (
              authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
              authStatus === messaging.AuthorizationStatus.PROVISIONAL
            ) {
              await messaging().registerDeviceForRemoteMessages();
            }
          } else if (
            Platform.OS === 'android' &&
            Number(Platform.Version) >= 33
          ) {
            await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );
          }

          // 토큰 등록
          const fcmToken = await messaging().getToken();
          if (fcmToken && isSubscribed) {
            await fcmApi.registerToken(fcmToken);
          }
        } catch (error) {
          console.warn('[UserContext] FCM Setup Error:', error);
        }
      };

      const timer = setTimeout(setupFCM, 500);
      const unsubscribe = messaging().onTokenRefresh(token => {
        if (isSubscribed) fcmApi.registerToken(token).catch(() => {});
      });

      return () => {
        isSubscribed = false;
        clearTimeout(timer);
        unsubscribe();
      };
    }
  }, [isAuthenticated]);

  // 알림 수신/클릭 핸들링
  useEffect(() => {
    const unsubscribeOnMessage = messaging().onMessage(async _ => {});

    const unsubscribeOnOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        const noticeId = remoteMessage.data?.noticeId;
        if (noticeId) NavigationService.resetToNotice(Number(noticeId));
      },
    );

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnOpened();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        isGuest,
        isAuthenticated,
        initialized,
        setGuest,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
