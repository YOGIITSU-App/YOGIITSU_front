import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Rootnavigator from './src/navigations/root/Rootnavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppInitProvider } from './src/contexts/AppInitContext';

function App() {
  return (
    <SafeAreaProvider>
      <AppInitProvider>
        <NavigationContainer>
          <Rootnavigator />
        </NavigationContainer>
      </AppInitProvider>
    </SafeAreaProvider>
  );
}

export default App;
