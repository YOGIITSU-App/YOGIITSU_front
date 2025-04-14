import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 공통 axios 인스턴스
const axiosInstance = axios.create({
  baseURL: 'http://15.165.2.118:8080', // 백엔드 주소로 수정해줘요!
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 시 토큰 자동 추가
axiosInstance.interceptors.request.use(async config => {
  // ❗ accessToken이 필요한 요청만 토큰 붙이기
  const skipAuthUrls = [
    '/send-mail/email',
    '/verify/code',
    '/members/find-password',
  ];

  const shouldSkip = skipAuthUrls.some(url => config.url?.includes(url));
  if (!shouldSkip) {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default axiosInstance;
