import axiosInstance from './axiosInstance';

const fcmApi = {
  registerToken: async (token: string) => {
    try {
      const response = await axiosInstance.post('/fcm/token', {
        token,
      });
      return response.data;
    } catch (error) {
      console.error('FCM 토큰 등록 중 에러 발생:', error);
      throw error;
    }
  },
};

export default fcmApi;
