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
  const token = await EncryptedStorage.getItem('accessToken');
  if (!token) throw new Error('NO_ACCESS_TOKEN');

  const res = await authApi.get('/mypage/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const userId = res.data?.memberId ?? res.data?.userId ?? res.data?.id;
  if (userId == null) throw new Error('USER_ID_NOT_FOUND_IN_PROFILE');
  return Number(userId);
}

// Google Login
export async function signInWithGoogle(): Promise<LoginOk> {
  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const signInResult = await GoogleSignin.signIn();
  if (signInResult.type !== 'success') {
    throw new Error('GOOGLE_SIGN_IN_CANCELLED_OR_FAILED');
  }
  const idToken = signInResult.data.idToken;
  if (!idToken) throw new Error('NO_GOOGLE_ID_TOKEN');

  const res = await authApi.post('/auth/google', { idToken });
  await saveTokensFromHeaders(res.headers);

  let userId =
    res.data?.userId ??
    res.data?.user?.id ??
    res.data?.memberId ??
    res.data?.id;
  if (userId == null) userId = await fetchUserIdFromProfile();

  const role: Role = String(res.data?.role ?? res.data?.user?.role)
    .toUpperCase()
    .includes('ADMIN')
    ? 'ADMIN'
    : 'USER';

  await Promise.all([
    EncryptedStorage.setItem('userId', String(userId)),
    EncryptedStorage.setItem('role', role),
  ]);

  return { userId: Number(userId), role };
}

// Kakao Login
export async function signInWithKakao(): Promise<LoginOk> {
  const r = await kakaoLogin();
  let accessToken = r?.accessToken;

  if (!accessToken) {
    const t = await getKakaoAccessToken().catch(() => null);
    accessToken = (t as any)?.accessToken;
  }
  if (!accessToken) throw new Error('NO_KAKAO_ACCESS_TOKEN');

  const res = await authApi.post('/auth/kakao', { accessToken });
  await saveTokensFromHeaders(res.headers);

  let userId =
    res.data?.userId ??
    res.data?.user?.id ??
    res.data?.memberId ??
    res.data?.id;
  if (userId == null) userId = await fetchUserIdFromProfile();

  const role: Role = String(res.data?.role ?? res.data?.user?.role)
    .toUpperCase()
    .includes('ADMIN')
    ? 'ADMIN'
    : 'USER';

  await Promise.all([
    EncryptedStorage.setItem('userId', String(userId)),
    EncryptedStorage.setItem('role', role),
  ]);

  return { userId: Number(userId), role };
}

// Apple Login
export async function signInWithApple(): Promise<LoginOk> {
  const r = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });

  const { authorizationCode, user } = r;
  if (!authorizationCode) throw new Error('NO_AUTHORIZATION_CODE');

  const res = await authApi.post('/auth/apple', { authorizationCode });

  try {
    await saveTokensFromHeaders(res.headers as any);
  } catch {
    const data: any = res.data ?? {};
    const bAccess = data.accessToken ?? data.token;
    const bRefresh = data.refreshToken ?? data.refresh;
    if (bAccess && bRefresh) {
      await Promise.all([
        EncryptedStorage.setItem('accessToken', String(bAccess)),
        EncryptedStorage.setItem('refreshToken', String(bRefresh)),
      ]);
    } else {
      throw new Error('TOKEN_MISSING');
    }
  }

  if (user) await EncryptedStorage.setItem('appleUserId', user);

  let userId =
    res.data?.userId ??
    res.data?.user?.id ??
    res.data?.memberId ??
    res.data?.id;
  if (userId == null) userId = await fetchUserIdFromProfile();

  const role: Role = String(res.data?.role ?? res.data?.user?.role)
    .toUpperCase()
    .includes('ADMIN')
    ? 'ADMIN'
    : 'USER';

  await Promise.all([
    EncryptedStorage.setItem('userId', String(userId)),
    EncryptedStorage.setItem('role', role),
  ]);

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
