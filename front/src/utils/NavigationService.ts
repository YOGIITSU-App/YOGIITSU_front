import {
  createNavigationContainerRef,
  CommonActions,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    const timer = setInterval(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
        clearInterval(timer);
      }
    }, 500);
    setTimeout(() => clearInterval(timer), 10000);
  }
}

export function resetToNotice(noticeId: number) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'BottomTab',
            state: {
              index: 4,
              // key를 포함한 명확한 route 정의
              routes: [
                { name: '홈' },
                { name: '즐겨찾기' },
                { name: '단과대' },
                { name: '학식' },
                {
                  name: 'MY',
                  state: {
                    index: 1,
                    routes: [
                      { name: 'MypageHome' },
                      {
                        name: 'NoticeDetail',
                        params: { noticeId: Number(noticeId) },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      }),
    );
  } else {
    const timer = setInterval(() => {
      if (navigationRef.isReady()) {
        resetToNotice(noticeId);
        clearInterval(timer);
      }
    }, 500);
    setTimeout(() => clearInterval(timer), 10000);
  }
}
