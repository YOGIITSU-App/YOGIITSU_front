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

function parseBearer(s?: string | null) {
  if (!s) return null;
  const parts = s.split(' ');
  return parts.length === 2 ? parts[1] : s;
}

export async function signInWithApple(): Promise<LoginOk | null> {
  // 1) 애플 로그인
  const r = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });
  const { authorizationCode } = r;
  if (!authorizationCode) throw new Error('NO_AUTHORIZATION_CODE');

  // 2) 서버 교환
  const resp = await fetch(`${Config.API_BASE_URL}/auth/apple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorizationCode }),
  });
  const txt = await resp.text().catch(() => '');
  if (!resp.ok)
    throw new Error(`APPLE_LOGIN_HTTP_${resp.status}: ${txt || ''}`);

  // 3) 헤더/바디에서 토큰/유저정보 모두 시도해서 추출
  // 헤더(access)
  const hAuth =
    resp.headers.get('authorization') || resp.headers.get('Authorization');
  const hAccess = parseBearer(hAuth) || resp.headers.get('x-access-token');
  const hRefresh = resp.headers.get('x-refresh-token');

  // 바디
  let body: any = {};
  try {
    body = txt ? JSON.parse(txt) : {};
  } catch {
    body = {};
  }
  const bAccess = body?.accessToken || body?.token;
  const bRefresh = body?.refreshToken || body?.refresh;
  const bUserId =
    body?.userId ?? body?.user?.userId ?? body?.user?.id ?? body?.id;
  const bRole = body?.role ?? body?.user?.role ?? body?.userRole ?? 'USER';

  const accessToken = hAccess || bAccess || '';
  const refreshToken = hRefresh || bRefresh || '';

  // 4) 저장 (RootNavigator가 이 키로 판별)
  if (accessToken) await EncryptedStorage.setItem('accessToken', accessToken);
  if (refreshToken)
    await EncryptedStorage.setItem('refreshToken', refreshToken);
  if (bUserId != null)
    await EncryptedStorage.setItem('userId', String(bUserId));
  if (bRole) await EncryptedStorage.setItem('role', String(bRole));

  return bUserId != null && bRole
    ? { userId: Number(bUserId), role: bRole as Role }
    : null;
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
