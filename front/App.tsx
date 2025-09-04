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
        {/* <VersionGate
          fallbackConfig={{
            latestVersion: '2.3.8', // 배포하는 버전명
          }}
          snoozeHours={24}
          aggressive={true}
        /> */}
        <NavigationContainer>
          <Rootnavigator />
        </NavigationContainer>
      </AppInitProvider>
    </SafeAreaProvider>
  );
}

export default App;
