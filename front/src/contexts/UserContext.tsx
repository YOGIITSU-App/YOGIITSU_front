import EncryptedStorage from 'react-native-encrypted-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { appleAuth } from '@invertase/react-native-apple-authentication';

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
    console.log('[UserContext] login called', userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    console.log('[UserContext] logout called');
    setUser(null);
    setIsGuest(false);
    setIsAuthenticated(false);

    try {
      await EncryptedStorage.clear();
      console.log('[UserContext] Storage cleared successfully');
    } catch (err) {
      console.error('[UserContext] Failed to clear storage:', err);
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
      console.warn('[UserContext] Failed to set guest mode', err);
      setIsGuest(value);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        console.log('[UserContext] Initializing...');

        // 게스트 모드 체크
        const guest = await EncryptedStorage.getItem('guest_mode');
        if (guest === 'true') {
          setIsGuest(true);
          setInitialized(true);
          console.log('[UserContext] Guest mode detected');
          return;
        }

        // 토큰 체크
        const [accessToken, refreshToken] = await Promise.all([
          EncryptedStorage.getItem('accessToken'),
          EncryptedStorage.getItem('refreshToken'),
        ]);

        if (accessToken && refreshToken) {
          console.log('[UserContext] Tokens found, user is authenticated');

          // Apple 사용자 체크 (credential 검증)
          const appleUserId = await EncryptedStorage.getItem('appleUserId');
          if (appleUserId) {
            try {
              const credentialState = await appleAuth.getCredentialStateForUser(
                appleUserId,
              );
              console.log(
                '[UserContext] Apple credentialState:',
                credentialState,
              );

              if (credentialState === appleAuth.State.REVOKED) {
                console.log(
                  '[UserContext] Apple credential revoked, clearing storage',
                );
                await EncryptedStorage.clear();
                setInitialized(true);
                return;
              }
            } catch (err) {
              console.warn('[UserContext] Apple credential check failed:', err);
            }
          }

          // 인증됨으로 표시 (userId/role은 나중에 필요할 때 로드)
          setIsAuthenticated(true);

          // userId와 role이 저장되어 있다면 복원
          const [userId, role] = await Promise.all([
            EncryptedStorage.getItem('userId'),
            EncryptedStorage.getItem('role'),
          ]);

          if (userId && role) {
            setUser({
              userId: Number(userId),
              role: role as 'USER' | 'ADMIN',
            });
            console.log('[UserContext] User profile restored from storage');
          } else {
            console.log(
              '[UserContext] User authenticated but profile will be loaded on demand',
            );
          }
        } else {
          console.log('[UserContext] No tokens found');
        }
      } catch (err) {
        console.warn('[UserContext] Initialization failed', err);
      } finally {
        setInitialized(true);
        console.log('[UserContext] Initialization complete');
      }
    })();
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
