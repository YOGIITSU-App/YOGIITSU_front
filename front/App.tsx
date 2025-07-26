import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Rootnavigator from './src/navigations/root/Rootnavigator';
import {SafeAreaProvider} from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Rootnavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
