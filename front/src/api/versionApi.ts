// src/api/versionApi.ts
import axiosInstance from './axiosInstance';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export type ServerUpdateType = 'NONE' | 'SELECT' | 'FORCE';
export type ClientUpdateType = 'NONE' | 'SOFT' | 'HARD';

export type ServerVersionPolicy = {
  updateType?: ServerUpdateType | string; // 서버 원본 (혹시 모를 변형 대비)
  latestVersion?: string;
  minVersion?: string;
  // message?: string;
  storeUrl?: string;
};

export type ClientVersionPolicy = {
  updateType: ClientUpdateType;
  latestVersion?: string;
  minVersion?: string;
  // message?: string;
  storeUrl?: string;
};

function cmpSemver(a?: string, b?: string) {
  if (!a || !b) return 0;
  const A = a.split('.').map(Number),
    B = b.split('.').map(Number);
  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    const d = (A[i] || 0) - (B[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}

// 서버 타입 → 클라 공통 타입 정규화
function normalizeType(serverType?: string): ClientUpdateType | undefined {
  const t = (serverType || '').toUpperCase();
  if (t === 'NONE') return 'NONE';
  if (t === 'SELECT' || t === 'SOFT' || t === 'OPTIONAL' || t === 'RECOMMEND')
    return 'SOFT';
  if (t === 'FORCE' || t === 'HARD' || t === 'MANDATORY' || t === 'REQUIRED')
    return 'HARD';
  return undefined; // 모르는 값이면 undefined로 반환 → 아래 보정 로직으로 처리
}

export async function fetchVersionPolicy(): Promise<ClientVersionPolicy> {
  const currentVersion = DeviceInfo.getVersion();
  const platform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

  const { data } = await axiosInstance.get<ServerVersionPolicy>(
    '/app/version',
    {
      params: { platform, currentVersion },
    },
  );

  const latest = data.latestVersion;
  const min = data.minVersion;

  // 1) 우선 타입 정규화
  let type = normalizeType(data.updateType);

  // 2) 혹시 모르면 버전 비교로 보정 (서버 타입이 비표준일 때 안전망)
  if (!type) {
    if (min && cmpSemver(currentVersion, min) < 0) type = 'HARD';
    else if (latest && cmpSemver(currentVersion, latest) < 0) type = 'SOFT';
    else type = 'NONE';
  }

  return {
    updateType: type,
    latestVersion: latest,
    minVersion: min,
    // message: data.message,
    storeUrl: data.storeUrl,
  };
}
