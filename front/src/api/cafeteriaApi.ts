import client from './axiosInstance';

export type CafeteriaMenuItem = {
  buildingId: number;
  buildingName: string;
  place: string;
  mealDate: string;
  mealType: string;
  corner?: string;
  items: string[];
  itemsChoice: string[];
  itemsCommon: string[];
  dayIndex: number;
  date: string;
};

export type CafeteriaWeeklyRes = {
  tz: string;
  serverTime: string;
  weekStart: string;
  todayIndex: number;
  availableIndices: number[];
  indexToDate?: Record<string, string>;
  menus: CafeteriaMenuItem[];
  lastUpdatedAt: string;
};

export async function getCafeteriaWeekly(
  buildingId: number,
  signal?: AbortSignal,
) {
  const { data } = await client.get<CafeteriaWeeklyRes>(
    '/cafeteria/menus/weekly',
    { params: { buildingId }, signal },
  );
  return data;
}
