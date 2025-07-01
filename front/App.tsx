import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';
import Rootnavigator from './src/navigations/root/Rootnavigator';

function App() {
  useEffect(() => {
    BootSplash.hide({fade: true});
  }, []);

  return (
    <NavigationContainer>
      <Rootnavigator />
    </NavigationContainer>
  );
}

export default App;
