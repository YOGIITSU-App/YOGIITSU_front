import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {StyleSheet} from 'react-native';
import AuthHomeScreen from '../../screens/auth/AuthHomeScreen';
import {authNavigations} from '../../constants';
import SignupScreen from '../../screens/auth/SignupScreen';
import FindIdScreen from '../../screens/auth/FindIdScreen';
import FindPwScreen from '../../screens/auth/FindPwScreen';
import MainDrawerNavigator from '../drawer/MainDrawerNavigation';

export type AuthStackParamList = {
  [authNavigations.AUTH_HOME]: undefined;
  [authNavigations.LOGIN]: undefined;
  [authNavigations.FINDID]: undefined;
  [authNavigations.FINDPW]: undefined;
  [authNavigations.SIGNUP]: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

function AuthStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyle: {
          backgroundColor: 'white',
        },
      }}>
      <Stack.Screen
        name={authNavigations.AUTH_HOME}
        component={AuthHomeScreen}
        options={{headerTitle: ' ', headerShown: false}}
      />
      <Stack.Screen
        name={authNavigations.LOGIN}
        component={MainDrawerNavigator}
        options={{headerTitle: '로그인'}}
      />
      <Stack.Screen
        name={authNavigations.FINDID}
        component={FindIdScreen}
        options={{headerTitle: '아이디찾기'}}
      />
      <Stack.Screen
        name={authNavigations.FINDPW}
        component={FindPwScreen}
        options={{headerTitle: '비밀번호찾기'}}
      />
      <Stack.Screen
        name={authNavigations.SIGNUP}
        component={SignupScreen}
        options={{headerTitle: '회원가입'}}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});

export default AuthStackNavigator;
