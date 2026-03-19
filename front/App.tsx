import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Rootnavigator from './src/navigations/root/Rootnavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppInitProvider } from './src/contexts/AppInitContext';
import VersionGate from './src/components/common/VersionGate';
import { StatusBar } from 'react-native';
import { logScreen } from './src/analytics/screens';
import { navigationRef } from './src/utils/NavigationService';
import messaging from '@react-native-firebase/messaging';
import * as NavigationService from './src/utils/NavigationService';
import analytics from '@react-native-firebase/analytics';

function App() {
  const routeNameRef = useRef<string | null>(null);

  const trackScreen = (screenName: string) => {
    void logScreen(screenName).catch(() => {
      // analytics 실패가 화면 전환 흐름에 영향을 주지 않도록 무시
    });
  };

  useEffect(() => {
    // 앱 종료 상태 클릭
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('[종료 상태 클릭]', remoteMessage.data);

          const noticeId = remoteMessage.data?.noticeId;

          analytics().logEvent('push_open', {
            notice_id: noticeId,
          });

          if (noticeId) {
            NavigationService.resetToNotice(Number(noticeId));
          }
        }
      });

    // 백그라운드 상태 클릭
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('[백그라운드 클릭]', remoteMessage.data);

      const noticeId = remoteMessage.data?.noticeId;

      analytics().logEvent('push_open', {
        notice_id: noticeId,
      });

      if (noticeId) {
        NavigationService.resetToNotice(Number(noticeId));
      }
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <AppInitProvider>
        <VersionGate
          fallbackConfig={{
            latestVersion: '2.5.1',
            minSupportedVersion: '2.3.6',
          }}
          defaultMessage={`안정적인 서비스 이용을 위해\n최신 버전으로 업데이트 해주세요.`}
          iosAppStoreId="6751530444"
          aggressive={true}
          snoozeHours={24}
        />
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            const currentRoute = navigationRef.getCurrentRoute()?.name;
            if (currentRoute) {
              trackScreen(currentRoute);
            }
            routeNameRef.current = currentRoute ?? null;
          }}
          onStateChange={() => {
            const currentRoute = navigationRef.getCurrentRoute()?.name;
            if (currentRoute && routeNameRef.current !== currentRoute) {
              trackScreen(currentRoute);
            }
            routeNameRef.current = currentRoute ?? null;
          }}
        >
          <Rootnavigator />
        </NavigationContainer>
      </AppInitProvider>
    </SafeAreaProvider>
  );
}

export default App;
