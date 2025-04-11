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

  // ✅ 인증번호 확인
  verifyCode: async (email: string, code: string) => {
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

    return response;
  },

  signup: async (
    id: string,
    password: string,
    email: string,
    userName: string,
  ) => {
    return axiosInstance.post('/members/signup', {
      memberId: id,
      password,
      email,
      userName,
    });
  },
};

export default authApi;
