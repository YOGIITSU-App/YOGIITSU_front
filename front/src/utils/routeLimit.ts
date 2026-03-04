import EncryptedStorage from 'react-native-encrypted-storage';

const DAILY_LIMIT = 20;
const CACHE_TTL = 1000 * 60 * 20; // 20분

const getTodayKey = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/* ---------- 일일 호출 제한 ---------- */
export const canCallRouteApi = async () => {
  const todayKey = getTodayKey();
  const data = await EncryptedStorage.getItem('route_daily_count');

  if (!data) {
    await EncryptedStorage.setItem(
      'route_daily_count',
      JSON.stringify({ date: todayKey, count: 0 }),
    );
    return true;
  }

  const parsed = JSON.parse(data);

  if (parsed.date !== todayKey) {
    await EncryptedStorage.setItem(
      'route_daily_count',
      JSON.stringify({ date: todayKey, count: 0 }),
    );
    return true;
  }

  return parsed.count < DAILY_LIMIT;
};

export const increaseRouteCount = async () => {
  const todayKey = getTodayKey();
  const data = await EncryptedStorage.getItem('route_daily_count');
  if (!data) return;

  const parsed = JSON.parse(data);
  await EncryptedStorage.setItem(
    'route_daily_count',
    JSON.stringify({
      date: todayKey,
      count: parsed.count + 1,
    }),
  );
};

/* ---------- 동일 경로 캐싱 ---------- */
export const getCachedRoute = async (key: string) => {
  const data = await EncryptedStorage.getItem(`route_cache_${key}`);
  if (!data) return null;

  const parsed = JSON.parse(data);
  if (Date.now() - parsed.savedAt > CACHE_TTL) return null;

  return parsed.result;
};

export const setCachedRoute = async (key: string, result: any) => {
  await EncryptedStorage.setItem(
    `route_cache_${key}`,
    JSON.stringify({
      savedAt: Date.now(),
      result,
    }),
  );
};
