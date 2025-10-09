import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';

export type User = {
  userId: number;
  role: 'USER' | 'ADMIN';
};

type UserContextType = {
  user: User | null;
  isGuest: boolean;
  guestLoaded: boolean;
  login: (userInfo: User) => void;
  logout: () => Promise<void>;
  setGuest: (value: boolean) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('UserContext 안에서 사용해주세요!');
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestLoaded, setGuestLoaded] = useState(false);

  /** 앱 실행 시 게스트 상태 복구 */
  useEffect(() => {
    (async () => {
      try {
        const saved = await EncryptedStorage.getItem('isGuest');
        if (saved === 'true') setIsGuest(true);
      } catch (err) {
        console.warn('게스트 상태 복구 실패', err);
      } finally {
        setGuestLoaded(true); // 복구 완료 표시
      }
    })();
  }, []);

  /** 게스트 로그인 시 호출 */
  const setGuest = async (value: boolean) => {
    try {
      if (value) {
        await EncryptedStorage.setItem('isGuest', 'true');
      } else {
        await EncryptedStorage.removeItem('isGuest');
      }
      setIsGuest(value);
    } catch (err) {
      console.warn('게스트 상태 저장 실패', err);
    }
  };

  /** 회원 로그인 */
  const login = (userInfo: User) => {
    setUser(userInfo);
    setIsGuest(false);
    EncryptedStorage.removeItem('isGuest');
  };

  /** 로그아웃 */
  const logout = async () => {
    setUser(null);
    setIsGuest(false);
    await EncryptedStorage.removeItem('isGuest');
  };

  return (
    <UserContext.Provider
      value={{ user, isGuest, guestLoaded, login, logout, setGuest }}
    >
      {children}
    </UserContext.Provider>
  );
};
