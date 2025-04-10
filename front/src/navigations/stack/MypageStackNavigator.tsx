import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import MypageHomeScreen from '../../screens/mypage/MypageHomeScreen';
import NoticeScreen from '../../screens/mypage/NoticeScreen';
import InquiryScreen from '../../screens/mypage/Inquiry/InquiryScreen';
import {colors} from '../../constants';
import DeleteAccountWarningScreen from '../../screens/mypage/DeleteAccount/DeleteAccountWarningScreen';
import DeleteAccountScreen from '../../screens/mypage/DeleteAccount/DeleteAccountScreen';
import ChangePwCodeConfirmScreen from '../../screens/mypage/ChangePw/ChangePwCodeConfirmScreen';
import ChangePwScreen from '../../screens/mypage/ChangePw/ChangePwScreen';
import ChangePwCompleteScreen from '../../screens/mypage/ChangePw/ChangePwCompleteScreen';
import CurrentEmailCodeConfirmScreen from '../../screens/mypage/ChangeEmail/CurrentEmailCodeConfirmScreen';
import ChangeNewEmailScreen from '../../screens/mypage/ChangeEmail/ChangeNewEmailScreen';
import ChangeEmailCompleteScreen from '../../screens/mypage/ChangeEmail/ChangeEmailCompleteScreen';
import DeleteAccountCompleteScreen from '../../screens/mypage/DeleteAccount/DeleteAccountCompleteScreen';
import InquiryWriteScreen from '../../screens/mypage/Inquiry/InquiryWriteScreen';
import {Inquiry, InquiryProvider} from '../../contexts/InquiryContext';
import InquiryCompleteScreen from '../../screens/mypage/Inquiry/InquiryCompleteScreen';
import InquiryDetailScreen from '../../screens/mypage/Inquiry/InquiryDetailScreen';
import InquiryEditScreen from '../../screens/mypage/Inquiry/InquiryEditScreen';

// 🔹 네비게이션 타입 정의
export type MypageStackParamList = {
  MypageHome: undefined;
  ChangePwCodeConfirm: undefined;
  ChangePw: undefined;
  ChangePwComplete: undefined;
  CurrentEmailCodeConfirm: undefined;
  ChangeNewEmail: undefined;
  ChangeEmailComplete: undefined;
  Notice: undefined;
  Inquiry: undefined;
  InquiryWrite: undefined;
  InquiryComplete: undefined;
  InquiryDetail: {inquiryId: number};
  InquiryEdit: {inquiry: Inquiry};
  DeleteAccountWarning: undefined;
  DeleteAccount: undefined;
  DeleteAccountComplete: undefined;
};

const Stack = createStackNavigator<MypageStackParamList>();

function MypageStackNavigator() {
  return (
    <InquiryProvider>
      <Stack.Navigator
        screenOptions={{
          cardStyle: {
            backgroundColor: 'white',
          },
          headerShown: true, // ✅ 헤더 표시
          headerTitleAlign: 'center', // ✅ 중앙 정렬
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.BLACK_900,
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
          name="ChangePwComplete"
          component={ChangePwCompleteScreen}
          options={{title: '비밀번호 변경'}}
        />
        <Stack.Screen
          name="CurrentEmailCodeConfirm"
          component={CurrentEmailCodeConfirmScreen}
          options={{title: '이메일 설정'}}
        />
        <Stack.Screen
          name="ChangeNewEmail"
          component={ChangeNewEmailScreen}
          options={{title: '이메일 설정'}}
        />
        <Stack.Screen
          name="ChangeEmailComplete"
          component={ChangeEmailCompleteScreen}
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
          name="InquiryWrite"
          component={InquiryWriteScreen}
          options={{title: '문의 작성'}}
        />
        <Stack.Screen
          name="InquiryComplete"
          component={InquiryCompleteScreen}
          options={{title: '문의'}}
        />
        <Stack.Screen
          name="InquiryDetail"
          component={InquiryDetailScreen}
          options={{title: '문의'}}
        />
        <Stack.Screen
          name="InquiryEdit"
          component={InquiryEditScreen}
          options={{title: '문의 수정'}}
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
        <Stack.Screen
          name="DeleteAccountComplete"
          component={DeleteAccountCompleteScreen}
          options={{title: '회원 탈퇴'}}
        />
      </Stack.Navigator>
    </InquiryProvider>
  );
}

export default MypageStackNavigator;
