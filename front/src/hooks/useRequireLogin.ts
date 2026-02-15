import { useState, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';

export function useRequireLogin() {
  const { isGuest } = useUser();
  const [visible, setVisible] = useState(false);

  const requireLogin = useCallback(
    (action?: () => void) => {
      if (isGuest) {
        setVisible(true); // 게스트면 모달 띄우기
      } else {
        action?.(); // 로그인 유저면 정상 동작
      }
    },
    [isGuest],
  );

  return { visible, setVisible, requireLogin };
}
