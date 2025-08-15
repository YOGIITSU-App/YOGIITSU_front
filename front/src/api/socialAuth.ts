import axios from 'axios';
import { Platform } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import Config from 'react-native-config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  login as kakaoLogin,
  getAccessToken as getKakaoAccessToken,
  logout as kakaoLogout,
} from '@react-native-seoul/kakao-login';

type Role = 'USER' | 'ADMIN';
export type LoginOk = { userId: number; role: Role };

const authApi = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export function configureSocial() {
  GoogleSignin.configure({
    webClientId: Config.GOOGLE_WEB_CLIENT_ID, // Android/iOS 공통
    iosClientId: Config.GOOGLE_IOS_CLIENT_ID, // iOS 권장
    offlineAccess: false,
  });
}

async function saveTokensFromHeaders(headers: any) {
  const raw = headers?.authorization || headers?.Authorization;
  const access = raw?.split(' ')[1];
  const refresh = headers?.['x-refresh-token'] || headers?.['X-Refresh-Token'];
  if (!access || !refresh) throw new Error('TOKEN_MISSING');
  await Promise.all([
    EncryptedStorage.setItem('accessToken', access),
    EncryptedStorage.setItem('refreshToken', refresh),
  ]);
}

export async function signInWithGoogle(): Promise<LoginOk> {
  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }
  await GoogleSignin.signIn();
  const { idToken } = await GoogleSignin.getTokens();
  if (!idToken) throw new Error('NO_GOOGLE_ID_TOKEN');

  const res = await authApi.post('/auth/google', { idToken });

  await saveTokensFromHeaders(res.headers);

  const { userId, role } = (res.data ?? {}) as Partial<LoginOk>;
  if (!userId || !role) throw new Error('INVALID_BACKEND_PAYLOAD');

  await Promise.all([
    EncryptedStorage.setItem('userId', String(userId)),
    EncryptedStorage.setItem('role', role),
  ]);
  return { userId, role };
}

export async function signInWithKakao(): Promise<LoginOk> {
  const r = await kakaoLogin();
  console.log(r.accessToken);
  let accessToken = r?.accessToken as string | undefined;
  if (!accessToken) {
    const t = await getKakaoAccessToken().catch(() => null);
    accessToken = (t as any)?.accessToken;
  }
  if (!accessToken) throw new Error('NO_KAKAO_ACCESS_TOKEN');

  const res = await authApi.post('/auth/kakao', { accessToken });

  await saveTokensFromHeaders(res.headers);

  const { userId, role } = (res.data ?? {}) as Partial<LoginOk>;
  if (!userId || !role) throw new Error('INVALID_BACKEND_PAYLOAD');

  await Promise.all([
    EncryptedStorage.setItem('userId', String(userId)),
    EncryptedStorage.setItem('role', role),
  ]);
  return { userId, role };
}

export async function signOutAll() {
  try {
    await GoogleSignin.signOut();
  } catch {}
  try {
    await kakaoLogout();
  } catch {}
  await EncryptedStorage.clear();
}
