import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
import {logoutEmitter} from '../utils/logoutEmitter';
import {refreshToken as requestTokenRefresh} from './refreshApi';
import {API_BASE_URL} from '@env';

// 공통 axios 인스턴스
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
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

// 토큰 재발급 중 여부를 나타내는 플래그
let isRefreshing = false;
// 재발급 중인 동안 대기 중인 요청을 저장하는 큐
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (error: any) => void;
}[] = [];

// 큐에 대기 중인 요청들을 처리
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(p => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
};

// 요청 인터셉터 설정
axiosInstance.interceptors.request.use(async config => {
  const shouldSkip = skipAuthUrls.some(url => config.url?.includes(url));

  // 인증이 필요한 요청에만 토큰 삽입
  if (!shouldSkip) {
    const token = await EncryptedStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    delete config.headers.Authorization;
  }

  console.log('[axios 요청]', config.method?.toUpperCase(), config.url);
  return config;
});

// 응답 인터셉터 설정
axiosInstance.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    // 401 에러이고, 아직 재시도하지 않은 요청이라면
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 중복 재시도 방지 플래그 설정
      originalRequest._retry = true;

      // 토큰 재발급 중이라면 큐에 요청을 추가하고 대기
      if (isRefreshing) {
        try {
          const newToken = await new Promise((resolve, reject) => {
            failedQueue.push({resolve, reject});
          });
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }

      isRefreshing = true;

      try {
        // 기존 토큰 가져오기
        const accessToken = await EncryptedStorage.getItem('accessToken');
        const refreshToken = await EncryptedStorage.getItem('refreshToken');
        if (!accessToken || !refreshToken) throw new Error('토큰 없음');

        // 토큰 재발급 요청
        const res = await requestTokenRefresh(accessToken, refreshToken);

        // 응답 헤더에서 토큰 추출
        const rawAuthHeader =
          res.headers.authorization || res.headers.Authorization;
        const newAccessToken = rawAuthHeader?.split(' ')[1];
        const newRefreshToken = res.headers['x-refresh-token'];
        if (!newAccessToken || !newRefreshToken)
          throw new Error('토큰 재발급 실패');

        // 새로운 토큰 저장
        await EncryptedStorage.setItem('accessToken', newAccessToken);
        await EncryptedStorage.setItem('refreshToken', newRefreshToken);

        // 큐에 있는 요청들 처리
        processQueue(null, newAccessToken);

        // 실패했던 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        // 재발급 실패 시 → 로그아웃 처리
        processQueue(err, null);
        await EncryptedStorage.clear();
        logoutEmitter.emit('force-logout');
        return Promise.reject(err);
      } finally {
        // 재발급 완료
        isRefreshing = false;
      }
    }

    // 그 외 에러는 그대로 반환
    return Promise.reject(error);
  },
);

export default axiosInstance;
