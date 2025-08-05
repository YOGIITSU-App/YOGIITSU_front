import axiosInstance from './axiosInstance';
import EncryptedStorage from 'react-native-encrypted-storage';
import {EmailVerificationPurposeType} from '../constants/emailPurpose';

const emailApi = {
  // 인증번호 이메일로 전송
  sendCode: async (email: string, purpose: EmailVerificationPurposeType) => {
    const response = await axiosInstance.post(
      `/email/send-code?purpose=${purpose}`,
      {email},
    );

    const token = response.data?.token;
    if (token) {
      await EncryptedStorage.setItem('emailVerifyToken', token);
    }

    return response;
  },

  // 인증번호 검증
  verifyCode: async (code: string) => {
    const token = await EncryptedStorage.getItem('emailVerifyToken');

    const response = await axiosInstance.post(
      '/email/verify',
      {code},
      {
        headers: {
          'X-Email-Verification-Token': token ?? '',
        },
      },
    );
    return response;
  },

  // [로그인] 이메일 변경
  changeEmail: async () => {
    const token = await EncryptedStorage.getItem('emailVerifyToken');

    return axiosInstance.post(
      '/email/change',
      {},
      {
        headers: {
          'X-Email-Verification-Token': token ?? '',
        },
      },
    );
  },
};

export default emailApi;
