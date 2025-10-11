import EncryptedStorage from 'react-native-encrypted-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<{
    userId: number;
    role: 'USER' | 'ADMIN';
  } | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestLoaded, setGuestLoaded] = useState(false);

  const login = (userData: { userId: number; role: 'USER' | 'ADMIN' }) => {
    console.log('[UserContext] login called');
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
    EncryptedStorage.clear();
  };

  const setGuest = async (value: boolean) => {
    try {
      if (value) {
        await EncryptedStorage.setItem('guest_mode', 'true');
        setIsGuest(true);
      } else {
        try {
          await EncryptedStorage.removeItem('guest_mode');
        } catch (err) {
          console.warn('게스트 상태 저장 실패(무시)', err);
        }
        setIsGuest(false);
      }
    } catch (err) {
      console.warn('게스트 상태 저장 실패', err);
      setIsGuest(value);
    } finally {
      setGuestLoaded(true);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const guest = await EncryptedStorage.getItem('guest_mode');
        setIsGuest(guest === 'true');
      } catch (e) {
        console.warn('게스트 모드 로드 실패', e);
      } finally {
        setGuestLoaded(true);
      }
    })();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, login, logout, isGuest, guestLoaded, setGuest }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
