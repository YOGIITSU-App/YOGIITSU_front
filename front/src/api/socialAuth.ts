import axios from 'axios';
import { Platform } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import Config from 'react-native-config';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  login as kakaoLogin,
  getAccessToken as getKakaoAccessToken,
  logout as kakaoLogout,
} from '@react-native-seoul/kakao-login';

type Role = 'USER' | 'ADMIN';
export type LoginOk = { userId: number; role: Role };

const REQUIRED_ENV = [
  'API_BASE_URL',
  'KAKAO_NATIVE_APP_KEY',
  'GOOGLE_WEB_CLIENT_ID',
];
const missing = REQUIRED_ENV.filter(k => !(Config as any)[k]);
if (missing.length) {
  console.warn('[env] Missing config:', missing.join(', '));
}

const authApi = axios.create({
  baseURL: Config.API_BASE_URL || undefined,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export function configureSocial() {
  GoogleSignin.configure({
    webClientId: Config.GOOGLE_WEB_CLIENT_ID,
    iosClientId: Config.GOOGLE_IOS_CLIENT_ID,
    offlineAccess: false,
  });
}

async function saveTokensFromHeaders(headers: any) {
  const raw = headers?.authorization ?? headers?.Authorization;
  const access =
    raw && String(raw).startsWith('Bearer ') ? String(raw).slice(7) : undefined;
  const refresh = headers?.['x-refresh-token'] ?? headers?.['X-Refresh-Token'];
  if (!access || !refresh) throw new Error('TOKEN_MISSING');
  await Promise.all([
    EncryptedStorage.setItem('accessToken', access),
    EncryptedStorage.setItem('refreshToken', refresh),
  ]);
}

function pickIdToken(result: unknown): string | null {
  const top = (result as any)?.idToken;
  if (top) return top as string;
  const nested = (result as any)?.data?.idToken;
  if (nested) return nested as string;
  return null;
}

export async function signInWithGoogle(): Promise<LoginOk> {
  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  let signInResult: unknown;
  try {
    signInResult = await GoogleSignin.signIn();
  } catch (e: any) {
    if (e?.code === statusCodes.SIGN_IN_CANCELLED) throw e;
    throw e;
  }

  const idToken = pickIdToken(signInResult);
  if (!idToken) throw new Error('NO_GOOGLE_ID_TOKEN');

  const res = await authApi.post('/auth/google', { idToken });
  await saveTokensFromHeaders(res.headers);

  const { userId, role } = (res.data ?? {}) as Partial<LoginOk>;
  if (!userId || !role) throw new Error('INVALID_BACKEND_PAYLOAD');

  await Promise.all([
    EncryptedStorage.setItem('userId', String(userId)),
    EncryptedStorage.setItem('role', role),
  ]);

  return { userId, role } as LoginOk;
}

export async function signInWithKakao(): Promise<LoginOk> {
  const r = await kakaoLogin();
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

  return { userId, role } as LoginOk;
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
