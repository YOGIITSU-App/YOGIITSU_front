import axiosInstance from './axiosInstance';

export type ShuttleSchedule = {
  nextShuttleTime: string[];
  timeTable: string[];
  route: string[];
};

export const fetchShuttleSchedule = async (): Promise<ShuttleSchedule> => {
  const res = await axiosInstance.get('/shuttles/schedule');
  return res.data;
};
