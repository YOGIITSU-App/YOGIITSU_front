import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import MypageHomeScreen from '../../screens/mypage/MypageHomeScreen';
import EmailSettingScreen from '../../screens/mypage/EmailSettingScreen';
import NoticeScreen from '../../screens/mypage/NoticeScreen';
import InquiryScreen from '../../screens/mypage/InquiryScreen';
import {colors} from '../../constants';
import DeleteAccountWarningScreen from '../../screens/mypage/DeleteAccount/DeleteAccountWarningScreen';
import DeleteAccountScreen from '../../screens/mypage/DeleteAccount/DeleteAccountScreen';
import ChangePwCodeConfirmScreen from '../../screens/mypage/ChangePw/ChangePwCodeConfirmScreen';
import ChangePwScreen from '../../screens/mypage/ChangePw/ChangePwScreen';

// 🔹 네비게이션 타입 정의
export type MypageStackParamList = {
  MypageHome: undefined;
  ChangePwCodeConfirm: undefined;
  ChangePw: undefined;
  EmailSetting: undefined;
  Notice: undefined;
  Inquiry: undefined;
  DeleteAccountWarning: undefined;
  DeleteAccount: undefined;
};

const Stack = createStackNavigator<MypageStackParamList>();

function MypageStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyle: {
          backgroundColor: 'white',
        },
        headerShown: true, // ✅ 헤더 표시
        title: 'MY', // ✅ 헤더 타이틀
        headerTitleAlign: 'center', // ✅ 중앙 정렬
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '600',
          color: colors.BLACK_500,
        },
      }}>
      <Stack.Screen
        name="MypageHome"
        component={MypageHomeScreen}
        options={{title: 'MY'}}
      />
      <Stack.Screen
        name="ChangePwCodeConfirm"
        component={ChangePwCodeConfirmScreen}
        options={{title: '비밀번호 변경'}}
      />
      <Stack.Screen
        name="ChangePw"
        component={ChangePwScreen}
        options={{title: '비밀번호 변경'}}
      />
      <Stack.Screen
        name="EmailSetting"
        component={EmailSettingScreen}
        options={{title: '이메일 설정'}}
      />
      <Stack.Screen
        name="Notice"
        component={NoticeScreen}
        options={{title: '공지사항'}}
      />
      <Stack.Screen
        name="Inquiry"
        component={InquiryScreen}
        options={{title: '문의'}}
      />
      <Stack.Screen
        name="DeleteAccountWarning"
        component={DeleteAccountWarningScreen}
        options={{title: '회원 탈퇴'}}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccountScreen}
        options={{title: '회원 탈퇴'}}
      />
    </Stack.Navigator>
  );
}

export default MypageStackNavigator;
