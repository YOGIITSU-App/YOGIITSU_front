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
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { sha256 } from 'js-sha256';

type Role = 'USER' | 'ADMIN';
export type LoginOk = { userId: number; role: Role };

function __appleRand(len = 32) {
  const s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += s[(Math.random() * s.length) | 0];
  return out;
}

type __AppleLoginOk = { userId: number; role: string };

function __joinUrl(base: string, path: string) {
  return `${base?.replace(/\/+$/, '')}${
    path.startsWith('/') ? path : `/${path}`
  }`;
}

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

export async function signInWithApple(): Promise<__AppleLoginOk> {
  if (!appleAuth.isSupported) {
    throw new Error('APPLE_SIGNIN_IOS_ONLY');
  }

  const rawNonce = __appleRand(32);
  const hashedNonce = sha256(rawNonce);
  const state = __appleRand(16);

  const result = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    nonce: hashedNonce,
    state,
  });

  const {
    user: appleUserId,
    email,
    fullName,
    identityToken,
    authorizationCode,
  } = result;

  if (!identityToken) throw new Error('APPLE_NO_IDENTITY_TOKEN');

  const url = __joinUrl(Config.API_BASE_URL as string, '/auth/login/apple');
  const payload = {
    identityToken,
    authorizationCode,
    rawNonce,
    state,
    email: email ?? null,
    name: fullName
      ? `${fullName.givenName ?? ''} ${fullName.familyName ?? ''}`.trim()
      : null,
    appleUserId,
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`APPLE_LOGIN_HTTP_${resp.status}: ${errText}`);
  }

  try {
    const accessToken = resp.headers.get('x-access-token');
    const refreshToken = resp.headers.get('x-refresh-token');

    if (accessToken) await EncryptedStorage.setItem('accessToken', accessToken);
    if (refreshToken)
      await EncryptedStorage.setItem('refreshToken', refreshToken);

    const data = await resp
      .clone()
      .json()
      .catch(() => ({}));
    if (!accessToken && data?.accessToken) {
      await EncryptedStorage.setItem('accessToken', data.accessToken);
    }
    if (!refreshToken && data?.refreshToken) {
      await EncryptedStorage.setItem('refreshToken', data.refreshToken);
    }

    return data as __AppleLoginOk;
  } catch {
    const data = (await resp.json().catch(() => ({}))) as any;
    return data as __AppleLoginOk;
  }
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
