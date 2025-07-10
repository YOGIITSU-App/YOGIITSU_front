import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {StyleSheet} from 'react-native';
import AuthHomeScreen from '../../screens/auth/AuthHomeScreen';
import {authNavigations, colors} from '../../constants';
import SignupScreen from '../../screens/auth/SignupScreen';
import FindIdScreen from '../../screens/auth/FindIdScreen';
import FindPwScreen from '../../screens/auth/FindPw/FindPwScreen';
import BottomTabNavigator from '../tab/BottomTabNavigator';
import FindPwCodeConfirmScreen from '../../screens/auth/FindPw/FindPwCodeConfirmScreen';
import FindPwCompleteScreen from '../../screens/auth/FindPw/FindPwCompleteScreen';
import TermsDetailScreen from '../../screens/auth/TermsDetailScreen';

export type AuthStackParamList = {
  [authNavigations.AUTH_HOME]: undefined;
  [authNavigations.LOGIN]: undefined;
  [authNavigations.FINDID]: undefined;
  FindPwCodeConfirm: undefined;
  FindPw: {email: string};
  FindPwComplete: undefined;
  [authNavigations.SIGNUP]: undefined;
  [authNavigations.TERMS_DETAIL]: {type: 'age' | 'terms' | 'privacy' | 'loc'};
};

const Stack = createStackNavigator<AuthStackParamList>();
function getTermsTitle(type: 'age' | 'terms' | 'privacy' | 'loc') {
  switch (type) {
    case 'age':
      return '연령 확인';
    case 'terms':
      return '서비스 이용약관';
    case 'privacy':
      return '개인정보 수집 및 이용';
    case 'loc':
      return '위치기반 서비스';
    default:
      return '';
  }
}

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
        component={BottomTabNavigator}
        options={{headerTitle: '로그인'}}
      />
      <Stack.Screen
        name={authNavigations.FINDID}
        component={FindIdScreen}
        options={{
          headerTitle: '아이디찾기',
          headerTitleAlign: 'center', // 상단 제목 중앙 정렬
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.BLACK_500,
          },
          headerStyle: {
            borderBottomWidth: 1,
            borderBottomColor: colors.GRAY_200,
          },
        }}
      />
      <Stack.Screen
        name="FindPwCodeConfirm"
        component={FindPwCodeConfirmScreen}
        options={{
          headerTitle: '비밀번호찾기',
          headerTitleAlign: 'center', // 상단 제목 중앙 정렬
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.BLACK_500,
          },
          headerStyle: {
            borderBottomWidth: 1,
            borderBottomColor: colors.GRAY_200,
          },
        }}
      />
      <Stack.Screen
        name="FindPw"
        component={FindPwScreen}
        options={{title: '비밀번호찾기'}}
      />
      <Stack.Screen
        name="FindPwComplete"
        component={FindPwCompleteScreen}
        options={{title: '비밀번호찾기'}}
      />
      <Stack.Screen
        name={authNavigations.SIGNUP}
        component={SignupScreen}
        options={{
          headerTitle: '회원가입',
          headerTitleAlign: 'center', // 상단 제목 중앙 정렬
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.BLACK_500,
          },
          headerStyle: {
            borderBottomWidth: 1,
            borderBottomColor: colors.GRAY_200,
          },
        }}
      />
      <Stack.Screen
        name={authNavigations.TERMS_DETAIL}
        component={TermsDetailScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});

export default AuthStackNavigator;
