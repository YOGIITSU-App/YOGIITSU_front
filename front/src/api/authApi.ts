import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosInstance';

const authApi = {
  // ✅ 1. 로그인 요청
  login: (id: string, password: string) =>
    axiosInstance.post('/members/login', {
      memberId: id, // 서버에서 기대하는 key 이름이 'memberId'일 경우
      password,
    }),

  // 존재하는 이메일 여부 추가 예정

  // ✅ 인증번호 이메일로 전송
  sendResetCode: (email: string) =>
    axiosInstance.post('/send-mail/email', {
      email,
    }),

  // ✅ 인증번호 확인
  verifyResetCode: async (email: string, code: string) => {
    const response = await axiosInstance.post('/verify/code', {
      email,
      code,
    });

    const token = response.data?.token;
    if (token) {
      await AsyncStorage.setItem('accessToken', token);
    }

    return response;
  },

  // 🔑 비밀번호 재설정
  resetPassword: (
    email: string,
    newPassword: string,
    confirmPassword: string,
  ) =>
    axiosInstance.patch('/members/find-password', {
      email,
      newPassword,
      confirmPassword,
    }),
};

export default authApi;
