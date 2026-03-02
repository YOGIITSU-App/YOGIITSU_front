import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React, { useRef } from 'react';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import Rootnavigator from './src/navigations/root/Rootnavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppInitProvider } from './src/contexts/AppInitContext';
import VersionGate from './src/components/common/VersionGate';
import { StatusBar } from 'react-native';
import { logScreen } from './src/analytics/screens';

export const navigationRef = createNavigationContainerRef();

function App() {
  const routeNameRef = useRef<string | null>(null);

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
              logScreen(currentRoute);
            }
            routeNameRef.current = currentRoute ?? null;
          }}
          onStateChange={() => {
            const currentRoute = navigationRef.getCurrentRoute()?.name;
            if (currentRoute && routeNameRef.current !== currentRoute) {
              logScreen(currentRoute);
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
