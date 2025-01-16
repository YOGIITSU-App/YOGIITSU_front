import {NavigationContainer} from '@react-navigation/native';
import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import AuthHomeScreen from './src/screens/auth/AuthHomeScreen';
import AuthStackNavigator from './src/navigations/stack/AuthStackNavigator';
import Rootnavigator from './src/navigations/root/Rootnavigator';

function App() {
  return (
    <NavigationContainer>
      <Rootnavigator />
    </NavigationContainer>
  );
}

export default App;
