import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosInstance';

const authApi = {
  // ✅ 1. 로그인 요청
  login: (id: string, password: string) =>
    axiosInstance.post('/members/login', {
      memberId: id, // 서버에서 기대하는 key 이름이 'memberId'일 경우
      password,
    }),

  // ✅ 인증번호 이메일로 전송
  sendResetCode: async (email: string) => {
    const response = await axiosInstance.post('/send-mail/email', {
      email,
    });

    const token = response.data?.token;

    if (token) {
      await AsyncStorage.setItem('emailVerifyToken', token);
    }

    return response;
  },

  // ✅ 인증번호 확인
  verifyResetCode: async (email: string, code: string) => {
    const token = await AsyncStorage.getItem('emailVerifyToken'); // ✅ 저장한 임시 토큰 불러오기

    const response = await axiosInstance.post(
      '/verify/code',
      {email, code},
      {
        headers: {
          'X-Email-Verification-Token': token ?? '', // ❗null 방지
        },
      },
    );

    const newToken = response.data?.token;
    if (newToken) {
      await AsyncStorage.setItem('accessToken', newToken);
    }

    return response;
  },

  // 🔑 비밀번호 재설정
  resetPassword: async (newPassword: string, confirmPassword: string) => {
    const token = await AsyncStorage.getItem('accessToken');
    return axiosInstance.patch(
      '/members/find-password',
      {
        newPassword,
        confirmPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },
};

export default authApi;
