import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosInstance';

const authApi = {
  // 로그인 요청
  login: (memberId: string, password: string) =>
    axiosInstance.post('/members/login', {
      memberId,
      password,
    }),

  // 인증번호 이메일로 전송
  sendCode: async (email: string) => {
    const response = await axiosInstance.post('/send-mail/email', {
      email,
    });

    const token = response.data?.token;

    if (token) {
      await AsyncStorage.setItem('emailVerifyToken', token);
    }

    return response;
  },

  // 인증번호 확인
  verifyCode: async (email: string, code: string) => {
    const token = await AsyncStorage.getItem('emailVerifyToken'); // 저장한 임시 토큰 불러오기

    const response = await axiosInstance.post(
      '/verify/code',
      {email, code},
      {
        headers: {
          'X-Email-Verification-Token': token ?? '',
        },
      },
    );

    return response;
  },

  // 회원가입
  signup: async (
    memberId: string,
    password: string,
    email: string,
    userName: string,
  ) => {
    return axiosInstance.post('/members/signup', {
      memberId,
      password,
      email,
      userName,
    });
  },

  // 비밀번호 재설정
  resetPassword: async (
    newPassword: string,
    confirmPassword: string,
    email: string,
  ) => {
    return axiosInstance.post('/members/find-password', {
      email,
      newPassword,
      confirmPassword,
    });
  },
};

export default authApi;
