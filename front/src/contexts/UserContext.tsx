import React, {createContext, useContext, useState, ReactNode} from 'react';

// ✅ 1. 사용자 타입 정의
export type User = {
  userId: number;
  role: 'USER' | 'ADMIN';
};

// ✅ 2. Context 타입 정의
type UserContextType = {
  user: User | null;
  login: (userInfo: User) => void;
  logout: () => void;
};

// ✅ 3. Context 생성
const UserContext = createContext<UserContextType | undefined>(undefined);

// ✅ 4. 커스텀 훅
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('UserContext 안에서 사용해주세요!');
  return context;
};

// ✅ 5. Provider
export const UserProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userInfo: User) => setUser(userInfo);
  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{user, login, logout}}>
      {children}
    </UserContext.Provider>
  );
};
