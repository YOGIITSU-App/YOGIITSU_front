import axios from './axiosInstance';

export interface ShortcutSummary {
  shortcutId: number;
  pointA: string;
  pointB: string;
  distance: number;
  duration: number;
}

export interface ShortcutDetail {
  shortcutId: number;
  pointA: string;
  pointB: string;
  distance: number;
  duration: number;
  coordinates: {
    latitude: number;
    longitude: number;
    pointOrder: number;
    description: string;
    turnType: string;
    segmentDistance: number;
    imageUrl?: string;
  }[];
}

// 지름길 전체 리스트 조회
export async function fetchShortcuts(): Promise<ShortcutSummary[]> {
  const res = await axios.get('/shortcuts');
  return res.data;
}

// 지름길 상세 조회
export async function fetchShortcutDetail(
  shortcutId: number,
): Promise<ShortcutDetail> {
  const res = await axios.get(`/shortcuts/${shortcutId}`);
  return res.data;
}
