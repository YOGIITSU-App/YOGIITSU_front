import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
import authApi from './authApi';
import {logoutEmitter} from '../utils/logoutEmitter';
import {refreshToken as requestTokenRefresh} from './refreshApi';

// 공통 axios 인스턴스
const axiosInstance = axios.create({
  baseURL: 'http://43.200.10.184:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인증 제외 URL (ex: 비회원 접근)
const skipAuthUrls = [
  '/send-mail/email',
  '/verify/code',
  '/members/find-password',
];

// 요청 인터셉터
axiosInstance.interceptors.request.use(async config => {
  const shouldSkip = skipAuthUrls.some(url => config.url?.includes(url));

  if (!shouldSkip) {
    const token = await EncryptedStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

// 응답 인터셉터: 재발급 처리
axiosInstance.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const accessToken = await EncryptedStorage.getItem('accessToken');
        const refreshToken = await EncryptedStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) throw new Error('토큰 없음');

        const res = await requestTokenRefresh(accessToken, refreshToken);

        const newAccessToken = res.headers.authorization?.split(' ')[1];
        const newRefreshToken = res.headers['x-refresh-token'];

        if (!newAccessToken || !newRefreshToken) throw new Error('재발급 실패');

        // 새 토큰 저장
        await EncryptedStorage.setItem('accessToken', newAccessToken);
        await EncryptedStorage.setItem('refreshToken', newRefreshToken);

        // 재시도 시 헤더 갱신
        axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        // 실패 → 로그아웃 처리 (저장소 회원정보 삭제)
        await EncryptedStorage.clear();
        logoutEmitter.emit('force-logout'); // 전역 로그아웃 이벤트 발생!
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
