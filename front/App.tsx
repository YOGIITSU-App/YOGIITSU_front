import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Rootnavigator from './src/navigations/root/Rootnavigator';

function App() {
  return (
    <NavigationContainer>
      <Rootnavigator />
    </NavigationContainer>
  );
}

export default App;
