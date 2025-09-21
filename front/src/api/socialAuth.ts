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

async function saveTokensFromHeaders(headers: Record<string, any>) {
  const auth = headers['authorization'] ?? headers['Authorization'];
  const access = parseBearer(auth) ?? headers['x-access-token'];
  const refresh = headers['x-refresh-token'];
  if (!access || !refresh) throw new Error('HEADER_TOKENS_MISSING');

  await Promise.all([
    EncryptedStorage.setItem('accessToken', String(access)),
    EncryptedStorage.setItem('refreshToken', String(refresh)),
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
  // 1) Apple 로그인
  const r = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });
  const { authorizationCode } = r;
  if (!authorizationCode) throw new Error('NO_AUTHORIZATION_CODE');

  // 2) 서버 교환 (axios 일원화: 인터셉터/타임아웃 활용)
  const res = await authApi.post('/auth/apple', { authorizationCode });

  // 3) 토큰 저장: 헤더 우선, 실패 시 바디 폴백. 둘 다 없으면 에러
  let saved = false;
  try {
    await saveTokensFromHeaders(res.headers as any);
    saved = true;
  } catch {
    const data: any = res.data ?? {};
    const bAccess = data.accessToken ?? data.token;
    const bRefresh = data.refreshToken ?? data.refresh;
    if (bAccess && bRefresh) {
      await Promise.all([
        EncryptedStorage.setItem('accessToken', String(bAccess)),
        EncryptedStorage.setItem('refreshToken', String(bRefresh)),
      ]);
      saved = true;
    }
  }
  if (!saved) throw new Error('TOKEN_MISSING');

  // 4) 사용자/역할 추출 & 저장 (기본값 강제하지 않음)
  const data: any = res.data ?? {};
  const userId = data.userId ?? data.user?.userId ?? data.user?.id ?? data.id;
  const roleRaw = data.role ?? data.user?.role ?? data.userRole;

  if (userId != null) {
    await EncryptedStorage.setItem('userId', String(userId));
  }
  if (roleRaw) {
    const role = (
      String(roleRaw).toUpperCase().includes('ADMIN') ? 'ADMIN' : 'USER'
    ) as Role;
    await EncryptedStorage.setItem('role', role);
    return { userId: Number(userId), role };
  }

  // role이 없으면 null 반환하여 상위에서 처리(서버 이슈 노출)
  return null;
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
