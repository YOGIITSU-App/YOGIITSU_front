import React from 'react';
import AuthStackNavigator from '../stack/AuthStackNavigator';
import BottomTabNavigator from '../drawer/BottomTabNavigator';

function Rootnavigator() {
  const isLoggedIn = true;

  return <>{isLoggedIn ? <BottomTabNavigator /> : <AuthStackNavigator />}</>;
}

export default Rootnavigator;
