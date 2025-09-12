import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Rootnavigator from './src/navigations/root/Rootnavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppInitProvider } from './src/contexts/AppInitContext';
import VersionGate from './src/components/common/VersionGate';

function App() {
  return (
    <SafeAreaProvider>
      <AppInitProvider>
        <VersionGate
          fallbackConfig={{
            latestVersion: '2.3.8',
            minSupportedVersion: '2.3.6',
          }}
          defaultMessage={`안정적인 서비스 이용을 위해\n최신 버전으로 업데이트 해주세요.`}
          iosAppStoreId={undefined}
          // iosAppStoreId="1234567890" // ios배포시 등록하기
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
