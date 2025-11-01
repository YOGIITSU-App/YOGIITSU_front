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

function parseBearer(s?: string | null) {
  if (!s) return null;
  const parts = s.split(' ');
  return parts.length === 2 ? parts[1] : s;
}

async function fetchUserIdFromProfile(): Promise<number> {
  try {
    const token = await EncryptedStorage.getItem('accessToken');
    if (!token) throw new Error('NO_ACCESS_TOKEN');

    console.log('[fetchUserIdFromProfile] Fetching from /mypage/profile...');

    const res = await authApi.get('/mypage/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const userId = res.data?.memberId ?? res.data?.userId ?? res.data?.id;

    if (userId != null) {
      console.log('[fetchUserIdFromProfile] userId found:', userId);
      return Number(userId);
    }

    throw new Error('USER_ID_NOT_FOUND_IN_PROFILE');
  } catch (err) {
    console.error('[fetchUserIdFromProfile] Failed:', err);
    throw err;
  }
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

  console.log('[signInWithGoogle] Response data:', res.data);

  // 응답에서 userId 시도
  let userId =
    res.data?.userId ??
    res.data?.user?.id ??
    res.data?.memberId ??
    res.data?.id;
  const roleRaw = res.data?.role ?? res.data?.user?.role;

  // userId 없으면 프로필에서 가져오기
  if (userId == null) {
    console.log(
      '[signInWithGoogle] No userId in response, fetching from profile...',
    );
    userId = await fetchUserIdFromProfile();
  }

  const role: Role =
    roleRaw && String(roleRaw).toUpperCase().includes('ADMIN')
      ? 'ADMIN'
      : 'USER';

  await Promise.all([
    EncryptedStorage.setItem('userId', String(userId)),
    EncryptedStorage.setItem('role', role),
  ]);

  console.log('[signInWithGoogle] Login complete:', { userId, role });
  return { userId: Number(userId), role };
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

  console.log('[signInWithKakao] Response data:', res.data);

  let userId =
    res.data?.userId ??
    res.data?.user?.id ??
    res.data?.memberId ??
    res.data?.id;
  const roleRaw = res.data?.role ?? res.data?.user?.role;

  if (userId == null) {
    console.log(
      '[signInWithKakao] No userId in response, fetching from profile...',
    );
    userId = await fetchUserIdFromProfile();
  }

  const role: Role =
    roleRaw && String(roleRaw).toUpperCase().includes('ADMIN')
      ? 'ADMIN'
      : 'USER';

  await Promise.all([
    EncryptedStorage.setItem('userId', String(userId)),
    EncryptedStorage.setItem('role', role),
  ]);

  console.log('[signInWithKakao] Login complete:', { userId, role });
  return { userId: Number(userId), role };
}

export async function signInWithApple(): Promise<LoginOk> {
  const r = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });
  const { authorizationCode, user } = r;
  if (!authorizationCode) throw new Error('NO_AUTHORIZATION_CODE');

  const res = await authApi.post('/auth/apple', { authorizationCode });

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

  if (user) {
    await EncryptedStorage.setItem('appleUserId', user);
  }

  console.log('[signInWithApple] Response data:', res.data);

  let userId =
    res.data?.userId ??
    res.data?.user?.id ??
    res.data?.memberId ??
    res.data?.id;
  const roleRaw = res.data?.role ?? res.data?.user?.role;

  if (userId == null) {
    console.log(
      '[signInWithApple] No userId in response, fetching from profile...',
    );
    userId = await fetchUserIdFromProfile();
  }

  const role: Role =
    roleRaw && String(roleRaw).toUpperCase().includes('ADMIN')
      ? 'ADMIN'
      : 'USER';

  await Promise.all([
    EncryptedStorage.setItem('userId', String(userId)),
    EncryptedStorage.setItem('role', role),
  ]);

  console.log('[signInWithApple] Login complete:', { userId, role });
  return { userId: Number(userId), role };
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
