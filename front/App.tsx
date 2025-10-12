import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Rootnavigator from './src/navigations/root/Rootnavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppInitProvider } from './src/contexts/AppInitContext';
import VersionGate from './src/components/common/VersionGate';
import { StatusBar } from 'react-native';

function App() {
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
        <NavigationContainer>
          <Rootnavigator />
        </NavigationContainer>
      </AppInitProvider>
    </SafeAreaProvider>
  );
}

export default App;
