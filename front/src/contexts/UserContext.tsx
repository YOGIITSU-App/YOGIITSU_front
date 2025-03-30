import React, {createContext, useContext, useState, ReactNode} from 'react';

export type User = {
  id: string;
  username: string;
  email: string;
};

type UserContextType = {
  user: User | null;
  login: (userInfo: User) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('UserContext 안에서 사용해주세요!');
  return context;
};

export const UserProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<User | null>(null); // ← 처음엔 null이니까 로그인 상태 아님

  const login = (userInfo: User) => setUser(userInfo); // ← 로그인 성공 시 user 저장
  const logout = () => setUser(null); // ← 로그아웃 시 user 제거

  return (
    <UserContext.Provider value={{user, login, logout}}>
      {children}
    </UserContext.Provider>
  );
};
